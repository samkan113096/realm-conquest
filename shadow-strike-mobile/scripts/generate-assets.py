#!/usr/bin/env python3
"""Generate valid PNG/JPG assets for Shadow Strike (Metro/web bundler)."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent / "assets"

COLORS = {
    "bg": (10, 6, 18),
    "player": (255, 34, 102),
    "enemy": (255, 51, 102),
    "fast": (255, 153, 51),
    "tank": (153, 51, 255),
    "boss": (255, 0, 102),
    "gold": (255, 204, 0),
    "cyan": (0, 204, 255),
    "wall": (42, 16, 48),
    "skin": (255, 198, 160),
    "skin_shadow": (210, 150, 120),
    "hair_dark": (30, 20, 35),
    "hair_pink": (255, 80, 140),
    "pants": (25, 25, 45),
    "boots": (40, 35, 50),
    "white": (240, 240, 250),
}


def gradient(size, top, bottom):
    w, h = size
    img = Image.new("RGB", size)
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(h - 1, 1)
        r = int(top[0] + (bottom[0] - top[0]) * t)
        g = int(top[1] + (bottom[1] - top[1]) * t)
        b = int(top[2] + (bottom[2] - top[2]) * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b))
    return img


def save_jpg(path, img, quality=88):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "JPEG", quality=quality, optimize=True)


def save_png(path, img):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG", optimize=True)


def _limb(d, x1, y1, x2, y2, w, color, shadow=None):
    d.line([(x1, y1), (x2, y2)], fill=color, width=w)
    if shadow:
        d.line([(x1 + 1, y1 + 1), (x2 + 1, y2 + 1)], fill=shadow, width=max(1, w - 2))


def draw_face(d, cx, cy, scale, facing=1):
    s = scale
    fx = int(cx + (3 * s * facing))
    cx, cy = int(cx), int(cy)
    d.ellipse([cx - int(9 * s), cy - int(14 * s), cx + int(9 * s), cy + int(2 * s)], fill=COLORS["skin"])
    d.ellipse([cx - int(9 * s), cy - int(14 * s), cx + int(9 * s), cy - int(4 * s)], fill=COLORS["hair_dark"])
    d.ellipse([fx - int(2 * s), cy - int(7 * s), fx - int(s), cy - int(5 * s)], fill=(20, 20, 30))
    d.ellipse([fx + int(2 * s), cy - int(7 * s), fx + int(3 * s), cy - int(5 * s)], fill=(20, 20, 30))
    d.arc([cx - int(4 * s), cy - int(3 * s), cx + int(4 * s), cy + int(3 * s)], 10, 170, fill=COLORS["skin_shadow"], width=max(1, int(s)))


def draw_fighter_sprite(w, h, outfit, accent, hair=None, pose="idle", bulk=1.0):
    """Draw a shaded humanoid fighter sprite."""
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, foot = w // 2, h - 6
    s = h / 96.0
    facing = 1 if pose != "attack_left" else -1

    shadow_y = foot - 2
    d.ellipse([cx - 14 * s * bulk, shadow_y - 3, cx + 14 * s * bulk, shadow_y + 5], fill=(0, 0, 0, 80))

    # Legs
    leg_w = int(5 * s * bulk)
    _limb(d, cx - 5 * s, foot - 18 * s, cx - 8 * s, foot, leg_w, COLORS["pants"], (15, 15, 30))
    _limb(d, cx + 5 * s, foot - 18 * s, cx + 8 * s, foot, leg_w, COLORS["pants"], (15, 15, 30))
    d.rectangle([cx - 10 * s, foot - 6, cx - 4 * s, foot], fill=COLORS["boots"])
    d.rectangle([cx + 4 * s, foot - 6, cx + 10 * s, foot], fill=COLORS["boots"])

    # Torso
    tw, th = int(18 * s * bulk), int(24 * s)
    tx, ty = cx - tw // 2, foot - 44 * s
    d.rounded_rectangle([tx, ty, tx + tw, ty + th], radius=int(4 * s), fill=outfit)
    d.line([(tx + 2, ty + th // 2), (tx + tw - 2, ty + th // 2)], fill=accent, width=max(1, int(2 * s)))

    # Arms
    aw = int(5 * s * bulk)
    if pose == "attack":
        _limb(d, cx + 4 * s * facing, ty + 4 * s, cx + 28 * s * facing, ty + 10 * s, aw, outfit, accent)
        _limb(d, cx - 4 * s * facing, ty + 6 * s, cx - 16 * s * facing, ty + 18 * s, aw, outfit, accent)
        d.ellipse([cx + 24 * s * facing - 4, ty + 6 * s, cx + 28 * s * facing + 4, ty + 14 * s], fill=COLORS["skin"])
    else:
        _limb(d, cx - 4 * s, ty + 4 * s, cx - 18 * s, ty + 20 * s, aw, outfit, accent)
        _limb(d, cx + 4 * s, ty + 4 * s, cx + 18 * s, ty + 20 * s, aw, outfit, accent)
        d.ellipse([cx - 20 * s, ty + 18 * s, cx - 14 * s, ty + 24 * s], fill=COLORS["skin"])
        d.ellipse([cx + 14 * s, ty + 18 * s, cx + 20 * s, ty + 24 * s], fill=COLORS["skin"])

    # Head + hair
    head_y = ty - 14 * s
    d.ellipse([cx - 10 * s, head_y - 12 * s, cx + 10 * s, head_y + 4 * s], fill=COLORS["skin"])
    hair_c = hair or COLORS["hair_dark"]
    d.ellipse([cx - 11 * s, head_y - 14 * s, cx + 11 * s, head_y - 2 * s], fill=hair_c)
    if hair == COLORS["hair_pink"]:
        d.polygon([(cx + 8 * s, head_y - 2), (cx + 14 * s, head_y + 10 * s), (cx + 6 * s, head_y + 4)], fill=hair_c)
    draw_face(d, cx, head_y - 4 * s, s, facing)

    # Accent glow for fighters
    d.ellipse([cx - int(12 * s), int(ty - 2), cx + int(12 * s), int(ty + th + 2)], outline=(*accent[:3], 60), width=1)
    return img


def draw_portrait(outfit, accent, hair, letter, mood="neutral"):
    img = Image.new("RGBA", (128, 128), COLORS["wall"] + (255,))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([4, 4, 124, 124], radius=10, outline=accent, width=2)
    cx, cy = 64, 58
    d.ellipse([cx - 34, cy - 10, cx + 34, cy + 50], fill=outfit)
    d.ellipse([cx - 28, cy - 38, cx + 28, cy + 8], fill=COLORS["skin"])
    d.ellipse([cx - 30, cy - 42, cx + 30, cy - 8], fill=hair)
    d.ellipse([cx - 10, cy - 18, cx - 4, cy - 12], fill=(20, 20, 30))
    d.ellipse([cx + 4, cy - 18, cx + 10, cy - 12], fill=(20, 20, 30))
    if mood == "angry":
        d.line([(cx - 12, cy - 22), (cx - 2, cy - 18)], fill=(40, 20, 20), width=2)
        d.line([(cx + 2, cy - 18), (cx + 12, cy - 22)], fill=(40, 20, 20), width=2)
    d.arc([cx - 10, cy - 2, cx + 10, cy + 10], 20, 160, fill=COLORS["skin_shadow"], width=2)
    d.text((54, 96), letter, fill=accent)
    return img


def draw_logo():
    img = Image.new("RGBA", (400, 160), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([8, 8, 392, 152], radius=12, outline=COLORS["player"], width=4)
    d.text((28, 48), "SHADOW", fill=COLORS["player"])
    d.text((28, 88), "STRIKE", fill=COLORS["gold"])
    return img


def main():
    menu = gradient((1280, 720), (18, 8, 32), (8, 4, 14))
    d = ImageDraw.Draw(menu)
    for i in range(0, 1280, 80):
        d.line([(i, 0), (i - 200, 720)], fill=(80, 20, 50), width=1)
    d.text((40, 40), "NEO-TOKYO 2187", fill=COLORS["cyan"])
    save_jpg(ROOT / "backgrounds" / "menu-hero.jpg", menu)

    arena = gradient((800, 450), (22, 10, 28), (10, 5, 16))
    d = ImageDraw.Draw(arena)
    d.rectangle([0, 380, 800, 450], fill=(30, 12, 36))
    for x in range(0, 800, 40):
        d.line([(x, 380), (x, 450)], fill=(35, 18, 42), width=1)
    for y in range(380, 450, 20):
        d.line([(0, y), (800, y)], fill=(28, 12, 34), width=1)
    d.rectangle([0, 0, 800, 8], fill=(50, 20, 55))
    d.rectangle([0, 442, 800, 450], fill=(50, 20, 55))
    save_jpg(ROOT / "backgrounds" / "arena-pit.jpg", arena)

    kira_outfit = (180, 20, 70)
    kira_accent = (255, 100, 150)
    save_png(ROOT / "sprites" / "kira-idle.png", draw_fighter_sprite(96, 96, kira_outfit, kira_accent, COLORS["hair_pink"], "idle"))
    save_png(ROOT / "sprites" / "kira-attack.png", draw_fighter_sprite(96, 96, kira_outfit, kira_accent, COLORS["hair_pink"], "attack"))

    save_png(ROOT / "sprites" / "enemy-grunt.png", draw_fighter_sprite(64, 64, (120, 30, 50), COLORS["enemy"], COLORS["hair_dark"], "idle"))
    save_png(ROOT / "sprites" / "enemy-striker.png", draw_fighter_sprite(64, 64, (160, 80, 20), COLORS["fast"], (200, 120, 40), "attack", 0.9))
    save_png(ROOT / "sprites" / "enemy-brute.png", draw_fighter_sprite(80, 80, (80, 30, 120), COLORS["tank"], COLORS["hair_dark"], "idle", 1.35))
    save_png(ROOT / "sprites" / "boss-viper.png", draw_fighter_sprite(112, 112, (100, 10, 50), COLORS["boss"], (60, 10, 30), "attack", 1.5))

    save_png(ROOT / "logo.png", draw_logo())

    icon = Image.new("RGBA", (1024, 1024), COLORS["bg"] + (255,))
    d = ImageDraw.Draw(icon)
    d.ellipse([200, 200, 824, 824], fill=COLORS["player"])
    fighter = draw_fighter_sprite(512, 512, (180, 20, 70), kira_accent, COLORS["hair_pink"], "attack")
    icon.paste(fighter, (256, 180), fighter)
    save_png(ROOT / "icon.png", icon)

    save_png(ROOT / "portraits" / "kira.png", draw_portrait(kira_outfit, kira_accent, COLORS["hair_pink"], "K"))
    save_png(ROOT / "portraits" / "viper.png", draw_portrait((100, 10, 50), COLORS["boss"], (60, 10, 30), "V", "angry"))
    save_png(ROOT / "portraits" / "narrator.png", draw_portrait((50, 50, 80), COLORS["cyan"], COLORS["hair_dark"], "N"))

    print("Generated assets in", ROOT)


if __name__ == "__main__":
    main()
