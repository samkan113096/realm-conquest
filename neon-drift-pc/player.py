"""Player ship — direct movement + timed weapon buffs."""

import math
import pygame

from art import ship_surface


class Player:
    COLORS = [
        (0, 255, 200),
        (255, 100, 200),
        (100, 200, 255),
        (255, 220, 50),
        (200, 100, 255),
    ]

    MAX_SPEED = 320
    ACCEL = 1100
    FRICTION = 10.0
    BASE_FIRE_RATE = 8

    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.vx = 0
        self.vy = 0
        self.angle = -math.pi / 2
        self.radius = 16
        self.hp = 3
        self.max_hp = 3
        self.shield = 0
        self.speed_mult = 1.0
        self.fire_rate = self.BASE_FIRE_RATE
        self.fire_cooldown = 0
        self.rapid_fire_timer = 0.0
        self.spread_shot_timer = 0.0
        self.color_idx = 0
        self.trail = []
        self._ship = ship_surface(52)

    @property
    def color(self):
        return self.COLORS[self.color_idx % len(self.COLORS)]

    def update(self, keys, dt, width, height):
        if self.rapid_fire_timer > 0:
            self.rapid_fire_timer = max(0, self.rapid_fire_timer - dt)
        if self.spread_shot_timer > 0:
            self.spread_shot_timer = max(0, self.spread_shot_timer - dt)
        if self.rapid_fire_timer <= 0:
            self.fire_rate = self.BASE_FIRE_RATE

        move_x = 0.0
        move_y = 0.0
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            move_x -= 1
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            move_x += 1
        if keys[pygame.K_UP] or keys[pygame.K_w]:
            move_y -= 1
        if keys[pygame.K_DOWN] or keys[pygame.K_s]:
            move_y += 1

        max_speed = self.MAX_SPEED * self.speed_mult
        accel = self.ACCEL * self.speed_mult

        if move_x or move_y:
            length = math.hypot(move_x, move_y)
            move_x /= length
            move_y /= length
            self.vx += move_x * accel * dt
            self.vy += move_y * accel * dt
            self.angle = math.atan2(move_y, move_x)
            speed = math.hypot(self.vx, self.vy)
            if speed > max_speed:
                scale = max_speed / speed
                self.vx *= scale
                self.vy *= scale
        else:
            decay = math.exp(-self.FRICTION * dt)
            self.vx *= decay
            self.vy *= decay

        self.x += self.vx * dt
        self.y += self.vy * dt
        self.x = max(self.radius, min(width - self.radius, self.x))
        self.y = max(self.radius, min(height - self.radius, self.y))

        self.trail.append((self.x, self.y))
        if len(self.trail) > 14:
            self.trail.pop(0)

        if self.fire_cooldown > 0:
            self.fire_cooldown -= 1

    def shoot(self):
        if self.fire_cooldown > 0:
            return []
        rate = 3 if self.rapid_fire_timer > 0 else self.fire_rate
        self.fire_cooldown = rate
        speed = 520
        spread = [-0.28, 0, 0.28] if self.spread_shot_timer > 0 else [0]
        bullets = []
        for offset in spread:
            a = self.angle + offset
            bullets.append({
                "x": self.x + math.cos(a) * 22,
                "y": self.y + math.sin(a) * 22,
                "vx": math.cos(a) * speed,
                "vy": math.sin(a) * speed,
                "life": 90,
                "dmg": 1,
            })
        return bullets

    def active_buffs(self):
        buffs = []
        if self.rapid_fire_timer > 0:
            buffs.append(f"RAPID {self.rapid_fire_timer:.0f}s")
        if self.spread_shot_timer > 0:
            buffs.append(f"SPREAD {self.spread_shot_timer:.0f}s")
        if self.shield > 0:
            buffs.append(f"SHIELD {self.shield}")
        return buffs

    def draw(self, screen, ox=0, oy=0):
        x, y = int(self.x + ox), int(self.y + oy)

        for i, (tx, ty) in enumerate(self.trail):
            c = tuple(max(0, min(255, v - (14 - i) * 12)) for v in self.color)
            pygame.draw.circle(screen, c, (int(tx + ox), int(ty + oy)), max(1, i // 2))

        rotated = pygame.transform.rotozoom(self._ship, -math.degrees(self.angle) - 90, 1.0)
        rect = rotated.get_rect(center=(x, y))
        screen.blit(rotated, rect)

        if self.shield > 0:
            pulse = 2 + int(math.sin(pygame.time.get_ticks() * 0.008) * 2)
            pygame.draw.circle(screen, (100, 200, 255), (x, y), self.radius + 10 + pulse, 2)

        if self.spread_shot_timer > 0:
            pygame.draw.circle(screen, (255, 190, 60), (x, y), self.radius + 4, 1)
