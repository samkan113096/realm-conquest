"""Procedural neon sprites — no external art files required."""

import math
import random
import pygame

_CACHE = {}


def _glow_circle(surf, color, radius, alpha=120):
    for r in range(radius, 0, -2):
        a = max(20, int(alpha * (r / radius)))
        c = (*color[:3], a)
        s = pygame.Surface((r * 2 + 4, r * 2 + 4), pygame.SRCALPHA)
        pygame.draw.circle(s, c, (r + 2, r + 2), r)
        surf.blit(s, (int(surf.get_width() / 2 - r - 2), int(surf.get_height() / 2 - r - 2)))


def ship_surface(size=48):
    key = ("ship", size)
    if key in _CACHE:
        return _CACHE[key]
    s = pygame.Surface((size, size), pygame.SRCALPHA)
    cx, cy = size // 2, size // 2
    body = [(cx, 4), (cx + 18, cy + 14), (cx + 8, cy + 8), (cx + 8, cy + 20),
            (cx - 8, cy + 20), (cx - 8, cy + 8), (cx - 18, cy + 14)]
    pygame.draw.polygon(s, (0, 255, 200), body)
    pygame.draw.polygon(s, (180, 255, 240), body, 2)
    pygame.draw.polygon(s, (255, 100, 200), [(cx, 8), (cx + 6, cy + 6), (cx - 6, cy + 6)])
    _glow_circle(s, (0, 255, 200), size // 2 - 2, 40)
    _CACHE[key] = s
    return s


def asteroid_surface(radius=22):
    key = ("ast", radius)
    if key in _CACHE:
        return _CACHE[key]
    s = pygame.Surface((radius * 2 + 8, radius * 2 + 8), pygame.SRCALPHA)
    cx, cy = radius + 4, radius + 4
    pts = []
    for i in range(8):
        a = i * math.pi / 4
        r = radius * (0.75 + (i % 3) * 0.08)
        pts.append((cx + math.cos(a) * r, cy + math.sin(a) * r))
    pygame.draw.polygon(s, (60, 45, 35), pts)
    pygame.draw.polygon(s, (200, 160, 90), pts, 2)
    for i in range(4):
        a = i * 1.3
        pygame.draw.circle(s, (120, 90, 60), (int(cx + math.cos(a) * radius * 0.4), int(cy + math.sin(a) * radius * 0.3)), 3)
    _CACHE[key] = s
    return s


def enemy_surface():
    key = "enemy"
    if key in _CACHE:
        return _CACHE[key]
    s = pygame.Surface((40, 32), pygame.SRCALPHA)
    pygame.draw.polygon(s, (255, 40, 100), [(4, 16), (28, 4), (36, 16), (28, 28)])
    pygame.draw.polygon(s, (255, 150, 200), [(4, 16), (28, 4), (36, 16), (28, 28)], 2)
    pygame.draw.rect(s, (255, 80, 140), (30, 12, 8, 8), border_radius=2)
    _glow_circle(s, (255, 60, 120), 18, 35)
    _CACHE[key] = s
    return s


def boss_surface(wave):
    key = ("boss", wave // 5)
    if key in _CACHE:
        return _CACHE[key]
    w, h = 120, 80
    s = pygame.Surface((w, h), pygame.SRCALPHA)
    cx, cy = w // 2, h // 2
    hull = [(8, cy), (cx, 12), (w - 8, cy), (cx + 20, h - 10), (cx, h - 4), (cx - 20, h - 10)]
    pygame.draw.polygon(s, (90, 20, 50), hull)
    pygame.draw.polygon(s, (255, 60, 120), hull, 3)
    pygame.draw.rect(s, (255, 40, 80), (cx - 18, cy - 8, 36, 16), border_radius=4)
    for i in range(3):
        pygame.draw.circle(s, (255, 100, 180), (cx - 24 + i * 24, h - 14), 6)
    _glow_circle(s, (255, 40, 100), 50, 25)
    _CACHE[key] = s
    return s


def pickup_surface(kind, size=36):
    key = ("pickup", kind, size)
    if key in _CACHE:
        return _CACHE[key]
    from powerups import POWERUP_TYPES
    info = POWERUP_TYPES.get(kind, POWERUP_TYPES["rapid"])
    color = info["color"]
    s = pygame.Surface((size, size), pygame.SRCALPHA)
    cx, cy = size // 2, size // 2
    _glow_circle(s, color, size // 2 - 2, 80)
    pygame.draw.circle(s, color, (cx, cy), size // 2 - 6, 3)
    if kind == "rapid":
        pygame.draw.polygon(s, color, [(cx - 8, cy + 6), (cx + 2, cy + 6), (cx + 2, cy + 10), (cx + 10, cy), (cx + 2, cy - 10), (cx + 2, cy - 6), (cx - 8, cy - 6)])
    elif kind == "spread":
        for da in (-0.35, 0, 0.35):
            a = -math.pi / 2 + da
            pygame.draw.line(s, color, (cx, cy), (cx + math.cos(a) * 12, cy + math.sin(a) * 12), 3)
    elif kind == "nuke":
        pygame.draw.circle(s, color, (cx, cy), 8, 2)
        for i in range(8):
            a = i * math.pi / 4
            pygame.draw.line(s, color, (cx, cy), (cx + math.cos(a) * 14, cy + math.sin(a) * 14), 2)
    elif kind == "shield":
        pygame.draw.arc(s, color, (cx - 10, cy - 10, 20, 20), 0.5, 2.6, 3)
    elif kind == "heal":
        pygame.draw.rect(s, color, (cx - 2, cy - 10, 4, 20))
        pygame.draw.rect(s, color, (cx - 10, cy - 2, 20, 4))
    else:
        pygame.draw.polygon(s, color, [(cx, cy - 10), (cx + 8, cy + 8), (cx - 8, cy + 8)])
    _CACHE[key] = s
    return s


def bullet_surface(color=(100, 255, 255)):
    s = pygame.Surface((12, 12), pygame.SRCALPHA)
    pygame.draw.circle(s, color, (6, 6), 4)
    pygame.draw.circle(s, (255, 255, 255), (6, 6), 2)
    return s


_BULLET = bullet_surface()
_ENEMY_BULLET = bullet_surface((255, 80, 120))


def draw_bullet(screen, x, y, ox=0, oy=0, enemy=False):
    surf = _ENEMY_BULLET if enemy else _BULLET
    screen.blit(surf, (int(x + ox - 6), int(y + oy - 6)))


_GALAXY_SEED = random.randint(0, 9999)


def draw_galaxy(screen, t, ox=0, oy=0, w=960, h=640):
    """Deep-space galaxy backdrop with nebula and parallax stars."""
    # Base gradient
    for y in range(0, h, 4):
        ratio = y / h
        c = (
            int(8 + ratio * 12),
            int(6 + ratio * 8),
            int(28 + ratio * 35),
        )
        pygame.draw.rect(screen, c, (0, y, w, 4))

    rng = random.Random(_GALAXY_SEED)
    nebulae = []
    for _ in range(5):
        nebulae.append((
            rng.randint(0, w),
            rng.randint(0, h),
            rng.randint(80, 180),
            rng.choice([(120, 40, 160), (40, 80, 180), (180, 50, 100), (60, 160, 140)]),
        ))

    for nx, ny, nr, col in nebulae:
        blob = pygame.Surface((nr * 2, nr * 2), pygame.SRCALPHA)
        for r in range(nr, 0, -8):
            a = int(18 * (r / nr))
            pygame.draw.circle(blob, (*col, a), (nr, nr), r)
        screen.blit(blob, (nx + ox - nr, ny + oy - nr))

    # Distant spiral core
    gx, gy = w * 0.72, h * 0.28
    core = pygame.Surface((200, 200), pygame.SRCALPHA)
    for r in range(90, 0, -3):
        a = int(35 * (r / 90))
        pygame.draw.circle(core, (200, 180, 255, a), (100, 100), r)
    screen.blit(core, (int(gx + ox - 100), int(gy + oy - 100)))

    # Star layers
    for layer, speed, count, col in [
        (1, 10, 50, (40, 45, 90)),
        (2, 22, 70, (70, 80, 140)),
        (3, 38, 45, (120, 140, 200)),
    ]:
        for i in range(count):
            sx = (i * 137 + int(t * speed * layer)) % w
            sy = (i * 89 + layer * 31) % h
            pygame.draw.circle(screen, col, (sx + ox, sy + oy), layer)


def draw_starfield(screen, t, ox=0, oy=0, w=960, h=640):
    draw_galaxy(screen, t, ox, oy, w, h)
