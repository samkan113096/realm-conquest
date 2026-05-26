"""Campaign save / load."""

import json
import os

SAVE_PATH = os.path.join(os.path.dirname(__file__), "savegame.json")


def load_all():
    try:
        with open(SAVE_PATH) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"high_score": 0, "campaign": None}


def write_all(data):
    with open(SAVE_PATH, "w") as f:
        json.dump(data, f, indent=2)


def has_campaign():
    data = load_all()
    c = data.get("campaign")
    return bool(c and c.get("active"))


def save_campaign(game):
    data = load_all()
    p = game.player
    data["high_score"] = max(data.get("high_score", 0), game.high_score, game.score)
    data["campaign"] = {
        "active": True,
        "wave": game.wave,
        "score": game.score,
        "wave_kills": game.wave_kills,
        "hp": p.hp,
        "max_hp": p.max_hp,
        "shield": p.shield,
        "speed_mult": p.speed_mult,
        "rapid_fire_timer": p.rapid_fire_timer,
        "spread_shot_timer": p.spread_shot_timer,
        "x": p.x,
        "y": p.y,
        "boss_active": game.boss is not None and game.boss.alive,
        "boss_hp": game.boss.hp if game.boss else 0,
        "boss_max_hp": game.boss.max_hp if game.boss else 0,
        "boss_wave": game.wave if game.boss else 0,
    }
    write_all(data)


def clear_campaign():
    data = load_all()
    data["campaign"] = None
    write_all(data)


def apply_campaign(game, c):
    game.wave = c["wave"]
    game.score = c["score"]
    game.wave_kills = c.get("wave_kills", 0)
    p = game.player
    p.hp = c["hp"]
    p.max_hp = c.get("max_hp", 3)
    p.shield = c.get("shield", 0)
    p.speed_mult = c.get("speed_mult", 1.0)
    p.rapid_fire_timer = c.get("rapid_fire_timer", 0)
    p.spread_shot_timer = c.get("spread_shot_timer", 0)
    p.x = c.get("x", game.player.x)
    p.y = c.get("y", game.player.y)
    if c.get("boss_active"):
        from waves import is_boss_wave
        from entities import BossShip
        if is_boss_wave(c["wave"]):
            game.boss = BossShip(480, 80, c["wave"], 960)
            game.boss.hp = c.get("boss_hp", game.boss.hp)
            game.boss.max_hp = c.get("boss_max_hp", game.boss.max_hp)
