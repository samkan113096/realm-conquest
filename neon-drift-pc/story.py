"""Campaign storyline — Neon Drift."""

PILOT_NAME = "Captain Nova Kane"
FIGHTER_NAME = "Wraith Wing"

STORY_INTRO = [
    "2187 · Orion Belt Smuggler Lanes",
    "",
    f"You are {PILOT_NAME}, rogue ace of the free lanes. Viper Holdings sealed every jump gate and sent drone fleets to hunt survivors.",
    "",
    f"Your warplane {FIGHTER_NAME} is the last independent fighter in the sector. Fly through one hundred warp gates — each wave deeper into Viper territory.",
    "",
    "Every fifth gate holds a Syndicate Dreadnought. Destroy it to push the rebellion forward.",
    "",
    "Collect power-ups from wreckage. Save your run anytime — this war lasts hours, not minutes.",
]

BOSS_NAMES = {
    5: ('Ironjaw Tanaka', 'Pit Enforcer'),
    10: ('Mako Viper', 'Syndicate Champion'),
    15: ('Director Viper', 'Gate Warden'),
    20: ('Nexus-7', 'Hive Carrier'),
    25: ('Crimson Widow', 'Assassin Flagship'),
    30: ('Void Reaper', 'Debris Titan'),
    35: ('Helix Core', 'AI Overmind'),
    40: ('Orion Fang', 'Corporate Dreadnought'),
    45: ('Black Nova', 'Singularity Gun'),
    50: ('Halfway Warden', 'Midway Gatekeeper'),
    55: ('Shard Emperor', 'Crystal Leviathan'),
    60: ('Pulse Hydra', 'Multi-Canon Beast'),
    65: ('Ghost Fleet', 'Phantom Armada'),
    70: ('Solar Tyrant', 'Star Eater'),
    75: ('Quantum Maw', 'Rift Devourer'),
    80: ('Neon Seraph', 'Angel of Viper'),
    85: ('Eclipse Crown', 'Dark Admiral'),
    90: ('Penultimate', 'Gate Sentinel'),
    95: ('Viper Prime', 'Heir of Holdings'),
    100: ('The Board', 'Final Executive'),
}


def boss_title(wave):
    if wave in BOSS_NAMES:
        name, title = BOSS_NAMES[wave]
        return f"{name} — {title}"
    return f"Syndicate Dreadnought MK-{wave // 5}"
