# Neon Drift — PC Arcade Game

Neon arcade shooter set in the Orion Belt, 2187. Fly Captain Nova Kane's **Wraith Wing** through **100 warp gates**, fight Syndicate Dreadnoughts every 5 waves, chain combos, and save your campaign mid-run.

## Play

```bash
pip install -r requirements.txt
python main.py

# Or from project root
npm run pc
```

## Controls

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Move ship (8-way); ship turns toward heading |
| Space (hold) | Shoot |
| ESC | Pause / resume (auto-saves) |
| M | Main menu (when paused or game over) |
| C | Continue Campaign (main menu, if save exists) |
| T | Tutorial (main menu) |
| Space / Enter | New campaign · advance tutorial |

## Campaign

- **100 waves** — escalating difficulty; full clear can take hours
- **Boss every 5 waves** — named Syndicate Dreadnoughts with HP bars
- **Story on main menu** — Orion Belt lore and rebel pilot narrative
- **Save & continue** — pause or quit; resume from main menu
- **Victory** — clear wave 100 for **Galaxy Freed**

## Power-ups (drop from kills)

| Pickup | Effect |
|--------|--------|
| **RAPID** | Fast fire for 8 seconds |
| **SPREAD** | Triple shot for 10 seconds |
| **NUKE** | Destroy all enemies & asteroids on screen |
| **SHIELD** | +2 shield charges |
| **HEAL** | +1 HP |
| **SPEED** | Move faster |

## Gameplay Loop

- Destroy asteroids and drones — combos multiply score (up to 20×)
- Enemies appear from wave 2 onward
- Clear kill quota each wave; boss waves require defeating the dreadnought
- High score and campaign save in `savegame.json`

## Docs

| File | Purpose |
|------|---------|
| [`TUTORIAL.md`](TUTORIAL.md) | Full tutorial copy (in-game + web) |
| [`../promotion/neon-drift/PROMOTION-TEMPLATE.md`](../promotion/neon-drift/PROMOTION-TEMPLATE.md) | Launch & social promotion template |
| [`../website/tutorials/neon-drift.html`](../website/tutorials/neon-drift.html) | Public web tutorial |

## Structure

```
neon-drift-pc/
├── main.py          # Entry point
├── game.py          # Game loop, waves, bosses, save
├── player.py        # Player ship
├── entities.py      # Asteroids, enemies, bosses, particles
├── powerups.py      # Power-up types
├── ui.py            # HUD, menus, tutorial
├── story.py         # Campaign lore & boss names
├── waves.py         # 100-wave difficulty scaling
├── save_system.py   # Campaign save/load
├── art.py           # Sprites & galaxy background
└── requirements.txt
```
