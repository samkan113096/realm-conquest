"""Core game loop and state management."""

import json
import os
import random
import math
import pygame

from player import Player
from entities import Asteroid, Particle, EnemyShip, BossShip
from powerups import PowerUp, POWERUP_TYPES, roll_powerup_type
from art import draw_galaxy, draw_bullet
from ui import (
    draw_hud, draw_menu, draw_game_over, draw_tutorial,
    draw_pause, draw_toasts, draw_nuke_flash, TUTORIAL_STEPS,
)
from waves import (
    MAX_WAVE, is_boss_wave, kills_to_clear,
    asteroid_spawn_count, enemy_spawn_interval,
)
from story import boss_title
from save_system import (
    load_all, save_campaign, clear_campaign, has_campaign, apply_campaign,
)

LEGACY_SAVE = os.path.join(os.path.dirname(__file__), "highscore.json")
WIDTH, HEIGHT = 960, 640
FPS = 60


class Game:
    def __init__(self):
        pygame.init()
        pygame.display.set_caption("Neon Drift")
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        self.clock = pygame.time.Clock()
        self.font = pygame.font.SysFont("monospace", 22, bold=True)
        self.big_font = pygame.font.SysFont("monospace", 48, bold=True)
        self.state = "menu"
        self.tutorial_step = 0
        self.victory = False
        self._migrate_legacy_save()
        data = load_all()
        self.high_score = data.get("high_score", 0)
        self.toasts = []
        self.flash_timer = 0.0
        self.reset_run()

    def _migrate_legacy_save(self):
        if not os.path.exists(LEGACY_SAVE):
            return
        try:
            with open(LEGACY_SAVE) as f:
                legacy = json.load(f).get("high_score", 0)
            data = load_all()
            if legacy > data.get("high_score", 0):
                data["high_score"] = legacy
                from save_system import write_all
                write_all(data)
        except (json.JSONDecodeError, OSError):
            pass

    def reset_run(self):
        self.player = Player(WIDTH // 2, HEIGHT // 2)
        self.asteroids = []
        self.enemies = []
        self.boss = None
        self.particles = []
        self.powerups = []
        self.bullets = []
        self.score = 0
        self.wave = 1
        self.wave_kills = 0
        self.combo = 0
        self.combo_timer = 0
        self.shake = 0
        self.spawn_timer = 0
        self.enemy_timer = 0
        self.run_time = 0
        self.toasts = []
        self.flash_timer = 0.0
        self.victory = False
        if is_boss_wave(self.wave):
            self.spawn_boss()

    def go_menu(self):
        if self.state in ("playing", "paused") and self.player.hp > 0:
            save_campaign(self)
        self.state = "menu"
        self.tutorial_step = 0

    def add_toast(self, text, color=(255, 220, 50)):
        self.toasts.append({"text": text, "color": color, "life": 2.2})

    def trigger_nuke(self):
        self.flash_timer = 0.45
        cleared = 0
        for e in self.enemies:
            if e.alive:
                e.alive = False
                self.explode(e.x, e.y, (255, 80, 160), 20, big=True)
                self.add_combo(2)
                cleared += 1
        for a in self.asteroids:
            if a.alive:
                a.alive = False
                self.explode(a.x, a.y, (255, 200, 80), 14, big=True)
                self.add_combo()
                cleared += 1
        if self.boss and self.boss.alive:
            dmg = max(1, self.boss.max_hp // 8)
            self.boss.hp -= dmg
            self.explode(self.boss.x, self.boss.y, (255, 100, 200), 24, big=True)
            if self.boss.hp <= 0:
                self._on_boss_killed()
        self.shake = 22
        self.add_toast(f"NUKE! +{cleared * 50} bonus", (255, 100, 200))
        self.score += cleared * 50

    def spawn_boss(self):
        if self.boss and self.boss.alive:
            return
        self.boss = BossShip(WIDTH // 2, 80, self.wave, WIDTH)
        self.add_toast(f"BOSS: {boss_title(self.wave)}", (255, 80, 140))

    def spawn_asteroids(self):
        count = asteroid_spawn_count(self.wave)
        for _ in range(count):
            edge = random.choice(["top", "bottom", "left", "right"])
            if edge == "top":
                x, y = random.randint(0, WIDTH), -30
            elif edge == "bottom":
                x, y = random.randint(0, WIDTH), HEIGHT + 30
            elif edge == "left":
                x, y = -30, random.randint(0, HEIGHT)
            else:
                x, y = WIDTH + 30, random.randint(0, HEIGHT)
            self.asteroids.append(Asteroid(x, y, self.wave))

    def spawn_enemy(self):
        x = random.choice([40, WIDTH - 40])
        y = random.randint(60, HEIGHT - 60)
        self.enemies.append(EnemyShip(x, y, self.wave))

    def maybe_drop_powerup(self, x, y, from_enemy=False):
        chance = 0.42 if from_enemy else 0.2
        if random.random() < chance:
            kind = roll_powerup_type(from_enemy=from_enemy)
            self.powerups.append(PowerUp(x, y, kind))

    def add_combo(self, amount=1):
        self.combo += amount
        self.combo_timer = 120
        multiplier = min(self.combo, 20)
        self.score += 10 * multiplier

    def register_kill(self, boss=False):
        if boss:
            self._on_boss_killed()
            return
        self.wave_kills += 1
        if is_boss_wave(self.wave):
            return
        if self.wave_kills >= kills_to_clear(self.wave):
            self._advance_wave()

    def _on_boss_killed(self):
        if not self.boss:
            return
        self.boss.alive = False
        self.explode(self.boss.x, self.boss.y, (255, 60, 140), 40, big=True)
        self.add_combo(10)
        self.score += self.wave * 200
        self.shake = 18
        self.boss = None
        self._advance_wave()

    def _advance_wave(self):
        if self.wave >= MAX_WAVE:
            self.victory = True
            clear_campaign()
            if self.score > self.high_score:
                self.high_score = self.score
            data = load_all()
            data["high_score"] = self.high_score
            from save_system import write_all
            write_all(data)
            self.state = "gameover"
            self.add_toast("GALAXY FREED — 100 gates cleared!", (0, 255, 200))
            return

        self.wave += 1
        self.wave_kills = 0
        self.shake = 10
        self.add_toast(f"WAVE {self.wave} — Gate {self.wave}/100", (255, 200, 50))
        if is_boss_wave(self.wave):
            self.spawn_boss()
        save_campaign(self)

    def explode(self, x, y, color, count=12, big=False):
        for _ in range(count):
            self.particles.append(Particle(x, y, color, big=big))

    def start_new_campaign(self):
        clear_campaign()
        self.reset_run()
        self.state = "playing"

    def continue_campaign(self):
        data = load_all()
        c = data.get("campaign")
        if not c or not c.get("active"):
            return
        self.reset_run()
        apply_campaign(self, c)
        self.state = "playing"

    def run(self):
        running = True
        while running:
            dt = self.clock.tick(FPS) / 1000.0
            self.run_time += dt

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    if self.state in ("playing", "paused") and self.player.hp > 0:
                        save_campaign(self)
                    running = False
                if event.type == pygame.KEYDOWN:
                    self._on_key(event.key)

            if self.state == "playing":
                self.update(dt)
            elif self.state == "paused":
                self._update_toasts(dt)

            self.draw()

        pygame.quit()

    def _on_key(self, key):
        if self.state == "menu":
            if key == pygame.K_c and has_campaign():
                self.continue_campaign()
            elif key in (pygame.K_SPACE, pygame.K_RETURN):
                self.start_new_campaign()
            elif key == pygame.K_t:
                self.state = "tutorial"
                self.tutorial_step = 0
        elif self.state == "tutorial":
            if key in (pygame.K_RETURN, pygame.K_SPACE):
                if self.tutorial_step >= len(TUTORIAL_STEPS) - 1:
                    self.start_new_campaign()
                else:
                    self.tutorial_step += 1
            elif key == pygame.K_ESCAPE:
                self.go_menu()
        elif self.state == "playing":
            if key == pygame.K_ESCAPE:
                save_campaign(self)
                self.state = "paused"
        elif self.state == "paused":
            if key == pygame.K_ESCAPE:
                self.state = "playing"
            elif key == pygame.K_m:
                self.go_menu()
        elif self.state == "gameover":
            if key in (pygame.K_SPACE, pygame.K_RETURN):
                self.start_new_campaign()
            elif key == pygame.K_m:
                self.go_menu()

    def update(self, dt):
        keys = pygame.key.get_pressed()
        self.player.update(keys, dt, WIDTH, HEIGHT)
        if keys[pygame.K_SPACE]:
            self.bullets.extend(self.player.shoot())

        if self.flash_timer > 0:
            self.flash_timer = max(0, self.flash_timer - dt)

        self._update_toasts(dt)

        self.spawn_timer -= 1
        if self.spawn_timer <= 0:
            self.spawn_asteroids()
            self.spawn_timer = max(25, 85 - self.wave)

        if not is_boss_wave(self.wave) or not (self.boss and self.boss.alive):
            self.enemy_timer -= 1
            if self.enemy_timer <= 0 and self.wave >= 2:
                self.spawn_enemy()
                self.enemy_timer = enemy_spawn_interval(self.wave)

        if self.boss and self.boss.alive:
            self.boss.update(dt, self.player.x, self.player.y)
            if self.boss.should_fire():
                self.bullets.append(self.boss.fire_at(self.player.x, self.player.y))

        for a in self.asteroids:
            a.update(dt)
        for e in self.enemies:
            e.update(dt, self.player.x, self.player.y)
        for b in self.bullets:
            b["x"] += b["vx"] * dt
            b["y"] += b["vy"] * dt
            b["life"] -= 1

        self.bullets = [
            b for b in self.bullets
            if 0 < b["life"] and -20 < b["x"] < WIDTH + 20 and -20 < b["y"] < HEIGHT + 20
        ]

        for p in self.particles:
            p.update(dt)
        self.particles = [p for p in self.particles if p.life > 0]

        for pu in self.powerups:
            pu.update(dt)
        self.powerups = [pu for pu in self.powerups if pu.life > 0]

        if self.combo_timer > 0:
            self.combo_timer -= 1
        else:
            self.combo = 0

        if self.shake > 0:
            self.shake -= 1

        self._check_collisions()

        self.asteroids = [a for a in self.asteroids if a.alive]
        self.enemies = [e for e in self.enemies if e.alive]

        if self.player.hp <= 0:
            clear_campaign()
            if self.score > self.high_score:
                self.high_score = self.score
                data = load_all()
                data["high_score"] = self.high_score
                from save_system import write_all
                write_all(data)
            self.state = "gameover"

    def _update_toasts(self, dt):
        for t in self.toasts:
            t["life"] -= dt
        self.toasts = [t for t in self.toasts if t["life"] > 0]

    def _check_collisions(self):
        px, py = self.player.x, self.player.y

        for a in self.asteroids:
            if a.alive and a.collides(px, py, self.player.radius):
                if self.player.shield > 0:
                    self.player.shield -= 1
                    a.alive = False
                    self.explode(a.x, a.y, (100, 200, 255))
                else:
                    self.player.hp -= 1
                    a.alive = False
                    self.shake = 15
                    self.explode(a.x, a.y, (255, 80, 80), big=True)
                    self.combo = 0

        for e in self.enemies:
            if e.alive and e.collides(px, py, self.player.radius):
                if self.player.shield > 0:
                    self.player.shield -= 1
                    e.alive = False
                    self.explode(e.x, e.y, (255, 100, 255), big=True)
                    self.add_combo(2)
                    self.maybe_drop_powerup(e.x, e.y, from_enemy=True)
                    self.register_kill()
                else:
                    self.player.hp -= 1
                    self.shake = 15
                    self.explode(e.x, e.y, (255, 80, 80), big=True)

        if self.boss and self.boss.alive and self.boss.collides(px, py, self.player.radius):
            if self.player.shield > 0:
                self.player.shield -= 1
            else:
                self.player.hp -= 1
                self.shake = 20
                self.combo = 0

        for b in self.bullets[:]:
            if b.get("enemy"):
                if b["life"] > 0 and math.hypot(b["x"] - px, b["y"] - py) < self.player.radius + 4:
                    b["life"] = 0
                    if self.player.shield > 0:
                        self.player.shield -= 1
                    else:
                        self.player.hp -= 1
                        self.shake = 12
                        self.combo = 0
                continue

            for a in self.asteroids:
                if a.alive and a.collides(b["x"], b["y"], 4):
                    a.hp -= b["dmg"]
                    b["life"] = 0
                    if a.hp <= 0:
                        a.alive = False
                        self.explode(a.x, a.y, (255, 200, 50))
                        self.add_combo()
                        self.maybe_drop_powerup(a.x, a.y, from_enemy=False)
                        self.register_kill()
                    break
            if b["life"] <= 0:
                continue
            for e in self.enemies:
                if e.alive and e.collides(b["x"], b["y"], 4):
                    e.hp -= b["dmg"]
                    b["life"] = 0
                    if e.hp <= 0:
                        e.alive = False
                        self.explode(e.x, e.y, (200, 50, 255), big=True)
                        self.add_combo(3)
                        self.maybe_drop_powerup(e.x, e.y, from_enemy=True)
                        self.register_kill()
                    break
            if b["life"] <= 0:
                continue
            if self.boss and self.boss.alive and self.boss.collides(b["x"], b["y"], 4):
                self.boss.hp -= b["dmg"]
                b["life"] = 0
                if self.boss.hp <= 0:
                    self.register_kill(boss=True)

        for pu in self.powerups[:]:
            if pu.collides(px, py, self.player.radius):
                label = pu.apply(self.player, game=self)
                info = POWERUP_TYPES[pu.type]
                self.add_toast(f"{label}! {info['desc']}", info["color"])
                self.explode(pu.x, pu.y, pu.color, 10)
                self.powerups.remove(pu)

    def draw(self):
        shake_x = random.randint(-self.shake, self.shake) if self.shake else 0
        shake_y = random.randint(-self.shake, self.shake) if self.shake else 0

        if self.state in ("playing", "paused", "gameover"):
            draw_galaxy(self.screen, self.run_time, shake_x, shake_y, WIDTH, HEIGHT)
        else:
            self.screen.fill((6, 8, 18))

        if self.state == "menu":
            draw_menu(self.screen, self.big_font, self.font, self.high_score, has_campaign())
        elif self.state == "tutorial":
            draw_tutorial(self.screen, self.big_font, self.font, self.tutorial_step)
        elif self.state == "gameover":
            for a in self.asteroids:
                a.draw(self.screen, shake_x, shake_y)
            for e in self.enemies:
                e.draw(self.screen, shake_x, shake_y)
            if self.boss:
                self.boss.draw(self.screen, shake_x, shake_y)
            draw_game_over(
                self.screen, self.big_font, self.font,
                self.score, self.high_score, self.wave, self.victory,
            )
        else:
            for a in self.asteroids:
                a.draw(self.screen, shake_x, shake_y)
            for e in self.enemies:
                e.draw(self.screen, shake_x, shake_y)
            if self.boss and self.boss.alive:
                self.boss.draw(self.screen, shake_x, shake_y)
            for b in self.bullets:
                draw_bullet(self.screen, b["x"], b["y"], shake_x, shake_y, enemy=b.get("enemy", False))
            self.player.draw(self.screen, shake_x, shake_y)
            for p in self.particles:
                p.draw(self.screen, shake_x, shake_y)
            for pu in self.powerups:
                pu.draw(self.screen, shake_x, shake_y)
            goal = kills_to_clear(self.wave)
            draw_hud(
                self.screen, self.font, self.player, self.score, self.wave,
                self.combo, self.high_score, self.wave_kills, goal, self.boss,
            )
            draw_toasts(self.screen, self.font, self.toasts)
            if self.flash_timer > 0:
                draw_nuke_flash(self.screen, self.flash_timer / 0.45)
            if self.state == "paused":
                draw_pause(self.screen, self.font, self.wave)

        pygame.display.flip()
