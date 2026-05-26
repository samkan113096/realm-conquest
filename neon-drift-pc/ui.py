"""HUD, menus, tutorial, pause overlay."""

import pygame

from art import draw_galaxy, ship_surface
from story import STORY_INTRO, FIGHTER_NAME, PILOT_NAME

TUTORIAL_STEPS = [
    ("Move your ship", "WASD or arrow keys — fly in any direction. Ship turns toward your movement."),
    ("Shoot", "Hold SPACE to fire in the direction you're facing."),
    ("Fight drones", "Red corporate drones chase you from Wave 2. Shoot them down!"),
    ("Power-ups", "Collect glowing pickups: RAPID, SPREAD, NUKE, SHIELD, HEAL."),
    ("Boss gates", "Every 5th wave is a Syndicate Dreadnought. Break through to advance deeper."),
    ("Save & pause", "ESC pauses and auto-saves. Resume a long run from Continue on the main menu."),
    ("Ready?", f"Press ENTER — launch {FIGHTER_NAME} into the Orion Belt."),
]


def draw_hud(screen, font, player, score, wave, combo, high_score, wave_kills=0, wave_goal=0, boss=None):
    bar_y = 10
    for i in range(player.max_hp):
        color = (255, 60, 80) if i < player.hp else (35, 35, 55)
        pygame.draw.rect(screen, color, (10 + i * 28, bar_y, 22, 22), border_radius=4)
        score_text = font.render(f"SCORE {score:,}", True, (0, 255, 200))
        screen.blit(score_text, (screen.get_width() // 2 - 80, 10))

    wave_text = font.render(f"WAVE {wave}/100", True, (255, 200, 50))
    screen.blit(wave_text, (screen.get_width() - 150, 10))

    if boss and boss.alive:
        bw = 280
        bx = screen.get_width() // 2 - bw // 2
        by = 44
        ratio = max(0, boss.hp / boss.max_hp)
        pygame.draw.rect(screen, (30, 20, 40), (bx, by, bw, 14), border_radius=4)
        pygame.draw.rect(screen, (255, 60, 120), (bx, by, int(bw * ratio), 14), border_radius=4)
        bl = font.render("BOSS", True, (255, 120, 180))
        screen.blit(bl, (bx + bw // 2 - bl.get_width() // 2, by - 20))
    elif wave_goal > 0:
        prog = font.render(f"CLEAR {wave_kills}/{wave_goal}", True, (140, 140, 180))
        screen.blit(prog, (screen.get_width() // 2 - prog.get_width() // 2, 44))

    if combo > 1:
        combo_text = font.render(f"x{combo} COMBO!", True, (255, 100, 200))
        screen.blit(combo_text, (screen.get_width() // 2 - 60, 68))

    hs_text = font.render(f"BEST {high_score:,}", True, (80, 80, 120))
    screen.blit(hs_text, (screen.get_width() - 160, 40))

    buffs = player.active_buffs()
    for i, b in enumerate(buffs):
        t = font.render(b, True, (255, 190, 60))
        screen.blit(t, (10, 42 + i * 22))

    hint = font.render("WASD / arrows move · SPACE shoot · ESC pause", True, (60, 60, 90))
    screen.blit(hint, (10, screen.get_height() - 30))


def draw_menu(screen, big_font, font, high_score, has_save=False):
    w, h = screen.get_size()
    t = pygame.time.get_ticks() * 0.001
    draw_galaxy(screen, t, w=w, h=h)

    # Story panel
    panel = pygame.Surface((420, h - 80), pygame.SRCALPHA)
    panel.fill((8, 10, 24, 210))
    pygame.draw.rect(panel, (0, 255, 200), panel.get_rect(), 2, border_radius=10)
    screen.blit(panel, (30, 40))

    title = big_font.render("NEON DRIFT", True, (0, 255, 200))
    screen.blit(title, (50, 55))

    tag = font.render("ORION BELT · 100 WARP GATES", True, (255, 100, 200))
    screen.blit(tag, (50, 115))

    y = 155
    small = pygame.font.SysFont("monospace", 17)
    for line in STORY_INTRO:
        if not line:
            y += 8
            continue
        col = (255, 220, 50) if line.startswith("2187") else (170, 175, 210)
        txt = small.render(line, True, col)
        if txt.get_width() > 380:
            words = line.split()
            chunk = []
            for word in words:
                test = " ".join(chunk + [word])
                if small.render(test, True, col).get_width() > 380:
                    screen.blit(small.render(" ".join(chunk), True, col), (50, y))
                    y += 20
                    chunk = [word]
                else:
                    chunk.append(word)
            if chunk:
                screen.blit(small.render(" ".join(chunk), True, col), (50, y))
                y += 20
        else:
            screen.blit(txt, (50, y))
            y += 20

    # Warplane preview
    plane = ship_surface(72)
    px = w - 200
    screen.blit(plane, (px - plane.get_width() // 2, 120))
    pilot = font.render(PILOT_NAME, True, (0, 255, 200))
    screen.blit(pilot, (px - pilot.get_width() // 2, 210))
    craft = font.render(FIGHTER_NAME, True, (255, 190, 60))
    screen.blit(craft, (px - craft.get_width() // 2, 245))

    opts_y = 320
    opts = []
    if has_save:
        opts.append(("[ C ]  Continue Campaign", (0, 255, 200)))
    opts.extend([
        ("[ SPACE ]  New Campaign", (255, 220, 50)),
        ("[ T ]  Tutorial", (200, 200, 230)),
    ])
    for i, (txt, col) in enumerate(opts):
        t_opt = font.render(txt, True, col)
        screen.blit(t_opt, (px - t_opt.get_width() // 2, opts_y + i * 38))

    hs = font.render(f"High Score: {high_score:,}", True, (120, 120, 160))
    screen.blit(hs, (px - hs.get_width() // 2, h - 70))


def draw_tutorial(screen, big_font, font, step):
    w, h = screen.get_size()
    draw_galaxy(screen, pygame.time.get_ticks() * 0.001, w=w, h=h)

    title = big_font.render("HOW TO PLAY", True, (0, 255, 200))
    screen.blit(title, (w // 2 - title.get_width() // 2, 60))

    step = min(step, len(TUTORIAL_STEPS) - 1)
    head, body = TUTORIAL_STEPS[step]

    box = pygame.Surface((w - 120, 240), pygame.SRCALPHA)
    box.fill((12, 16, 32, 220))
    pygame.draw.rect(box, (0, 255, 200), box.get_rect(), 2, border_radius=12)
    screen.blit(box, (60, 150))

    htxt = font.render(head, True, (255, 220, 50))
    screen.blit(htxt, (w // 2 - htxt.get_width() // 2, 180))

    small = pygame.font.SysFont("monospace", 19)
    words = body.split()
    lines, chunk = [], []
    for word in words:
        test = " ".join(chunk + [word])
        if small.render(test, True, (200, 200, 230)).get_width() > w - 180:
            lines.append(" ".join(chunk))
            chunk = [word]
        else:
            chunk.append(word)
    if chunk:
        lines.append(" ".join(chunk))
    for i, line in enumerate(lines):
        btxt = small.render(line, True, (200, 200, 230))
        screen.blit(btxt, (w // 2 - btxt.get_width() // 2, 230 + i * 24))

    prog = font.render(f"Step {step + 1} / {len(TUTORIAL_STEPS)}", True, (100, 100, 140))
    screen.blit(prog, (w // 2 - prog.get_width() // 2, 340))

    nav = font.render("[ ENTER ] next   [ ESC ] main menu", True, (120, 120, 160))
    screen.blit(nav, (w // 2 - nav.get_width() // 2, 420))


def draw_pause(screen, font, wave=1):
    w, h = screen.get_size()
    overlay = pygame.Surface((w, h), pygame.SRCALPHA)
    overlay.fill((0, 0, 0, 160))
    screen.blit(overlay, (0, 0))

    title = font.render("PAUSED", True, (0, 255, 200))
    screen.blit(title, (w // 2 - title.get_width() // 2, h // 2 - 80))

    saved = font.render("Progress saved", True, (120, 200, 140))
    screen.blit(saved, (w // 2 - saved.get_width() // 2, h // 2 - 40))

    wave_t = font.render(f"Wave {wave}/100", True, (255, 200, 50))
    screen.blit(wave_t, (w // 2 - wave_t.get_width() // 2, h // 2 - 8))

    for i, txt in enumerate(("[ ESC ] Resume", "[ M ] Main Menu")):
        t = font.render(txt, True, (255, 220, 50) if i == 0 else (200, 200, 230))
        screen.blit(t, (w // 2 - t.get_width() // 2, h // 2 + 36 + i * 36))


def draw_game_over(screen, big_font, font, score, high_score, wave, victory=False):
    w = screen.get_width()
    if victory:
        title = big_font.render("GALAXY FREED", True, (0, 255, 200))
    else:
        title = big_font.render("DRIFT OVER", True, (255, 60, 80))
    screen.blit(title, (w // 2 - title.get_width() // 2, 140))

    if victory:
        sub = font.render("All 100 warp gates cleared. Viper Holdings retreats.", True, (200, 200, 230))
        screen.blit(sub, (w // 2 - sub.get_width() // 2, 210))

    score_t = font.render(f"Score: {score:,}", True, (0, 255, 200))
    screen.blit(score_t, (w // 2 - score_t.get_width() // 2, 260))

    wave_t = font.render(f"Reached Wave {wave}", True, (255, 200, 50))
    screen.blit(wave_t, (w // 2 - wave_t.get_width() // 2, 300))

    if score >= high_score and score > 0:
        new = font.render("NEW HIGH SCORE!", True, (255, 220, 50))
        screen.blit(new, (w // 2 - new.get_width() // 2, 340))

    restart = font.render("[ SPACE ] Retry", True, (255, 220, 50))
    screen.blit(restart, (w // 2 - restart.get_width() // 2, 400))
    menu = font.render("[ M ] Main Menu", True, (160, 160, 190))
    screen.blit(menu, (w // 2 - menu.get_width() // 2, 440))


def draw_toasts(screen, font, toasts):
    y = 90
    for t in toasts:
        text = font.render(t["text"], True, t["color"])
        bg = pygame.Surface((text.get_width() + 24, text.get_height() + 12), pygame.SRCALPHA)
        bg.fill((0, 0, 0, 140))
        screen.blit(bg, (screen.get_width() // 2 - bg.get_width() // 2, y))
        screen.blit(text, (screen.get_width() // 2 - text.get_width() // 2, y + 6))
        y += 40


def draw_nuke_flash(screen, alpha):
    if alpha <= 0:
        return
    flash = pygame.Surface(screen.get_size(), pygame.SRCALPHA)
    flash.fill((255, 200, 255, min(180, int(alpha * 255))))
    screen.blit(flash, (0, 0))
