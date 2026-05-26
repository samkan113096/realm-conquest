"""Power-up pickups — drop from kills, fly toward player feel."""

import math
import random
import pygame

from art import pickup_surface

POWERUP_TYPES = {
    "rapid": {"color": (255, 100, 200), "label": "RAPID", "desc": "Fast fire 8s"},
    "spread": {"color": (255, 190, 60), "label": "SPREAD", "desc": "Triple shot 10s"},
    "nuke": {"color": (255, 60, 90), "label": "NUKE", "desc": "Clear the screen"},
    "shield": {"color": (100, 200, 255), "label": "SHIELD", "desc": "+2 shield"},
    "heal": {"color": (60, 255, 130), "label": "HEAL", "desc": "+1 HP"},
    "speed": {"color": (255, 230, 80), "label": "SPEED", "desc": "Boost speed"},
}

ENEMY_DROP_POOL = ["rapid", "rapid", "spread", "spread", "nuke", "shield", "heal", "speed"]
ASTEROID_DROP_POOL = ["rapid", "spread", "shield", "heal", "speed"]


def roll_powerup_type(from_enemy=False):
    pool = ENEMY_DROP_POOL if from_enemy else ASTEROID_DROP_POOL
    return random.choice(pool)


class PowerUp:
    def __init__(self, x, y, kind=None):
        self.x = x
        self.y = y
        self.type = kind or roll_powerup_type(from_enemy=False)
        self.color = POWERUP_TYPES[self.type]["color"]
        self.life = 12.0
        self.pulse = 0
        self.vy = 20

    def update(self, dt):
        self.life -= dt
        self.pulse += dt * 5
        self.y += self.vy * dt

    def collides(self, px, py, pr):
        return math.hypot(self.x - px, self.y - py) < 20 + pr

    def apply(self, player, game=None):
        info = POWERUP_TYPES[self.type]
        if self.type == "rapid":
            player.rapid_fire_timer = 8.0
        elif self.type == "spread":
            player.spread_shot_timer = 10.0
        elif self.type == "nuke":
            if game:
                game.trigger_nuke()
        elif self.type == "shield":
            player.shield = min(player.shield + 2, 5)
        elif self.type == "heal":
            player.hp = min(player.hp + 1, player.max_hp)
        elif self.type == "speed":
            player.speed_mult = min(player.speed_mult + 0.35, 2.2)
        return info["label"]

    def draw(self, screen, ox=0, oy=0):
        x, y = int(self.x + ox), int(self.y + oy)
        bob = int(math.sin(self.pulse) * 4)
        sprite = pickup_surface(self.type)
        scale = 1.0 + math.sin(self.pulse) * 0.08
        w, h = sprite.get_size()
        scaled = pygame.transform.smoothscale(sprite, (int(w * scale), int(h * scale)))
        rect = scaled.get_rect(center=(x, y + bob))
        screen.blit(scaled, rect)
