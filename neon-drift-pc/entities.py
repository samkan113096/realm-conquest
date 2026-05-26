"""Game entities: asteroids, enemies, particles."""

import math
import random
import pygame

from art import asteroid_surface, enemy_surface, boss_surface
from waves import asteroid_speed_mult, enemy_speed_mult, boss_hp, boss_size


class Asteroid:
    def __init__(self, x, y, wave):
        self.x = x
        self.y = y
        self.alive = True
        size = random.choice(["small", "medium", "large"])
        self.radius = {"small": 12, "medium": 22, "large": 35}[size]
        self.hp = {"small": 1, "medium": 2, "large": 4}[size]
        self.hp += wave // 15
        self.max_hp = self.hp
        mult = asteroid_speed_mult(wave)
        speed = random.uniform(40, 80 + wave * 3) * mult
        angle = random.uniform(0, math.pi * 2)
        self.vx = math.cos(angle) * speed
        self.vy = math.sin(angle) * speed
        self.rotation = 0
        self.rot_speed = random.uniform(-1.5, 1.5)
        self._sprite = asteroid_surface(self.radius)

    def update(self, dt):
        self.x += self.vx * dt
        self.y += self.vy * dt
        self.rotation += self.rot_speed * dt

    def collides(self, px, py, pr):
        return math.hypot(self.x - px, self.y - py) < self.radius + pr

    def draw(self, screen, ox=0, oy=0):
        x, y = int(self.x + ox), int(self.y + oy)
        rotated = pygame.transform.rotozoom(self._sprite, math.degrees(self.rotation), 1.0)
        rect = rotated.get_rect(center=(x, y))
        screen.blit(rotated, rect)


class EnemyShip:
    def __init__(self, x, y, wave):
        self.x = x
        self.y = y
        self.alive = True
        self.radius = 18
        self.hp = 2 + wave // 3
        self.speed = (55 + wave * 5) * enemy_speed_mult(wave)
        self._sprite = enemy_surface()
        self.wobble = random.random() * math.pi * 2

    def update(self, dt, px, py):
        dx, dy = px - self.x, py - self.y
        dist = math.hypot(dx, dy) or 1
        self.x += (dx / dist) * self.speed * dt
        self.y += (dy / dist) * self.speed * dt
        self.wobble += dt * 4

    def collides(self, px, py, pr):
        return math.hypot(self.x - px, self.y - py) < self.radius + pr

    def draw(self, screen, ox=0, oy=0):
        x = int(self.x + ox + math.sin(self.wobble) * 3)
        y = int(self.y + oy)
        dx = 0  # face player roughly via flip
        sprite = pygame.transform.flip(self._sprite, self.x > 480, False)
        rect = sprite.get_rect(center=(x, y))
        screen.blit(sprite, rect)


class BossShip:
    def __init__(self, x, y, wave, width=960):
        self.x = x
        self.y = y
        self.wave = wave
        self.alive = True
        self.radius = boss_size(wave)
        self.max_hp = boss_hp(wave)
        self.hp = self.max_hp
        self.width = width
        self.phase = random.random() * math.pi * 2
        self.fire_timer = 1.2
        self._sprite = boss_surface(wave)

    def update(self, dt, px, py):
        self.phase += dt * 0.9
        self.x = self.width // 2 + math.sin(self.phase) * (self.width * 0.32)
        self.y = 70 + math.sin(self.phase * 0.6) * 18
        self.fire_timer -= dt

    def should_fire(self):
        if self.fire_timer <= 0:
            self.fire_timer = max(0.5, 1.8 - self.wave * 0.01)
            return True
        return False

    def fire_at(self, px, py):
        dx, dy = px - self.x, py - self.y
        dist = math.hypot(dx, dy) or 1
        speed = 180 + self.wave * 2
        return {
            "x": self.x,
            "y": self.y + self.radius,
            "vx": dx / dist * speed,
            "vy": dy / dist * speed,
            "life": 180,
            "dmg": 1,
            "enemy": True,
        }

    def collides(self, px, py, pr):
        return math.hypot(self.x - px, self.y - py) < self.radius + pr

    def draw(self, screen, ox=0, oy=0):
        x, y = int(self.x + ox), int(self.y + oy)
        rect = self._sprite.get_rect(center=(x, y))
        screen.blit(self._sprite, rect)


class Particle:
    def __init__(self, x, y, color, big=False):
        self.x = x
        self.y = y
        self.color = color
        angle = random.uniform(0, math.pi * 2)
        speed = random.uniform(80, 280 if big else 200)
        self.vx = math.cos(angle) * speed
        self.vy = math.sin(angle) * speed
        self.life = random.uniform(0.4, 1.1 if big else 0.8)
        self.size = random.randint(2, 5 if big else 3)

    def update(self, dt):
        self.x += self.vx * dt
        self.y += self.vy * dt
        self.vx *= 0.96
        self.vy *= 0.96
        self.life -= dt

    def draw(self, screen, ox=0, oy=0):
        alpha = max(0, min(255, int(255 * (self.life / 0.8))))
        c = tuple(min(255, int(v * alpha / 255)) for v in self.color)
        pygame.draw.circle(screen, c, (int(self.x + ox), int(self.y + oy)), self.size)
