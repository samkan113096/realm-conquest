#!/usr/bin/env python3
"""Generate Google Play store assets: feature graphic + screenshots."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
WEB = ROOT.parent / "website" / "shadow-strike"
STORE = ROOT / "google-play"
SHOTS_WEB = WEB / "screenshots"
SHOTS_STORE = STORE / "screenshots"

COLORS = {
    "bg": (10, 6, 18),
    "pink": (255, 34, 102),
    "gold": (255, 204, 0),
    "cyan": (0, 204, 255),
    "wall": (42, 16, 48),
}


def gradient(w, h, top, bottom):
    img = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(h - 1, 1)
        r = int(top[0] + (bottom[0] - top[0]) * t)
        g = int(top[1] + (bottom[1] - top[1]) * t)
        b = int(top[2] + (bottom[2] - top[2]) * t)
        d.line([(0, y), (w, y)], fill=(r, g, b))
    return img


def draw_feature_graphic():
    w, h = 1024, 500
    img = gradient(w, h, (18, 8, 32), (8, 4, 14))
    d = ImageDraw.Draw(img)

    for i in range(0, w, 60):
        d.line([(i, 0), (i - 120, h)], fill=(80, 20, 50), width=1)

    d.rounded_rectangle([40, 40, 420, 460], radius=16, outline=COLORS["pink"], width=4)
    d.ellipse([120, 100, 340, 380], outline=COLORS["pink"], width=3)
    d.ellipse([180, 160, 280, 320], fill=COLORS["pink"])

    try:
        font_lg = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 72)
        font_md = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 36)
        font_sm = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 24)
    except OSError:
        font_lg = font_md = font_sm = ImageFont.load_default()

    d.text((460, 120), "SHADOW", fill=COLORS["pink"], font=font_lg)
    d.text((460, 200), "STRIKE", fill=COLORS["gold"], font=font_lg)
    d.text((460, 310), "Move. Shoot. Survive the pit.", fill=(224, 224, 255), font=font_md)
    d.text((460, 370), "Neo-Tokyo arena shooter · By Dicky Hui", fill=COLORS["cyan"], font=font_sm)
    d.text((460, 420), "Auto-aim  ·  Bomb swarms  ·  Boss every 5 floors", fill=(136, 136, 170), font=font_sm)

    return img


def save_feature():
    img = draw_feature_graphic()
    for dest in [WEB / "feature-graphic.png", STORE / "feature-graphic.png"]:
        dest.parent.mkdir(parents=True, exist_ok=True)
        img.save(dest, "PNG", optimize=True)
    print("Saved feature-graphic.png (1024×500)")


def capture_screenshots():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Install playwright: pip install playwright && playwright install chromium")
        return False

    SHOTS_WEB.mkdir(parents=True, exist_ok=True)
    SHOTS_STORE.mkdir(parents=True, exist_ok=True)

    shots = [
        ("01-menu.png", None, 0),
        ("02-story.png", "story", 0),
        ("03-gameplay.png", "game", 4000),
        ("04-combat.png", "game", 6000),
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto("http://localhost:8082", wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(2500)

        for filename, mode, extra_wait in shots:
            if mode == "story":
                page.get_by_text("STORY MODE", exact=False).click(timeout=8000)
                page.wait_for_timeout(2000)
            elif mode == "game":
                if page.get_by_text("Skip", exact=False).first.is_visible():
                    page.get_by_text("Skip", exact=False).first.click()
                    page.wait_for_timeout(1000)
                page.wait_for_timeout(extra_wait)
                shooting = page.get_by_text("SHOOT", exact=False)
                if shooting.first.is_visible():
                    shooting.first.dispatch_event("mousedown")
                    page.wait_for_timeout(1500)

            path_web = SHOTS_WEB / filename
            path_store = SHOTS_STORE / filename
            page.screenshot(path=str(path_web), full_page=False)
            path_store.write_bytes(path_web.read_bytes())
            print(f"Saved {filename} (1920×1080)")

        browser.close()
    return True


def main():
    save_feature()
    ok = capture_screenshots()
    if not ok:
        print("Feature graphic done. Start expo (npm run web) and re-run for screenshots.")
    else:
        print("All Google Play assets ready in:")
        print(" ", STORE)
        print(" ", WEB)


if __name__ == "__main__":
    main()
