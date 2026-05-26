# Neon Drift — Tutorial Copy

Source-of-truth text for the in-game tutorial (`ui.py`), website guide, and promotion.  
Keep in-game steps and this file in sync.

---

## Campaign premise

**Setting:** 2187 · Orion Belt Smuggler Lanes  

**Pilot:** Captain Nova Kane — rogue ace of the free lanes  

**Ship:** Wraith Wing — last independent fighter in the sector  

**Antagonist:** Viper Holdings — sealed every jump gate, sent drone fleets to hunt survivors  

**Goal:** Fly through **100 warp gates**, each wave deeper into Viper territory. Every **5th gate** holds a **Syndicate Dreadnought**. Destroy bosses to advance the rebellion. Clear gate **100** to win — **Galaxy Freed**.

---

## In-game tutorial steps

Use these seven steps in the tutorial screen (`T` from main menu).

### Step 1 — Move your ship
**WASD or arrow keys** — fly in any direction. Your ship **turns toward your movement**. Momentum carries you; release keys to drift and slow down.

### Step 2 — Shoot
Hold **SPACE** to fire in the direction you're facing. Destroy asteroids for score. Aim by moving — bullets follow your ship's heading.

### Step 3 — Fight drones
Red **corporate drones** chase you from **Wave 2**. They move faster as waves climb. Shoot them down before they ram you.

### Step 4 — Power-ups
Collect glowing pickups from destroyed enemies and asteroids:

| Pickup | Effect |
|--------|--------|
| **RAPID** | Fast fire for ~8 seconds |
| **SPREAD** | Triple shot for ~10 seconds |
| **NUKE** | Destroys all enemies and asteroids on screen; heavy damage to bosses |
| **SHIELD** | +2 shield charges — blocks hits without losing HP |
| **HEAL** | +1 HP (up to max) |
| **SPEED** | Increased movement speed |

### Step 5 — Boss gates
Every **5th wave** (5, 10, 15 … 100) is a **Syndicate Dreadnought** gate.

- A **boss HP bar** appears at the top of the screen  
- The boss moves and **fires at you**  
- Destroy the boss to advance — regular kill quota does not apply on boss waves  
- Named bosses include Ironjaw Tanaka (Wave 5), Mako Viper (Wave 10), and The Board (Wave 100)

### Step 6 — Save & pause
Press **ESC** during a run to **pause**. Progress is **auto-saved** (wave, score, HP, buffs, boss state).

- **ESC** again to resume  
- **M** from pause → main menu (also saves)  
- Main menu → **Continue Campaign** to resume a saved run  
- **New Campaign** starts fresh and clears the save  

Closing the game window while playing also saves if you had HP remaining.

### Step 7 — Ready?
Press **ENTER** to launch **Wraith Wing** into the Orion Belt.

---

## Main menu options

| Key | Action |
|-----|--------|
| **C** | Continue Campaign (if save exists) |
| **SPACE** / **ENTER** | New Campaign |
| **T** | How to Play tutorial |

---

## Controls reference

| Key | Action |
|-----|--------|
| **WASD** or **Arrow keys** | Move ship (8-way); ship rotates toward heading |
| **Space** (hold) | Shoot |
| **ESC** | Pause / resume |
| **M** | Main menu (pause or game over) |
| **T** | Tutorial (main menu only) |

---

## Wave progression

- **Waves 1–100** — difficulty scales: more asteroids, faster enemies, tougher HP  
- **Non-boss waves** — clear a kill quota shown as `CLEAR X/Y` on the HUD  
- **Boss waves** — defeat the dreadnought; no regular quota  
- **Wave 100 cleared** — victory screen: **Galaxy Freed**  
- **Death** — run ends; save cleared; high score kept in `savegame.json`

---

## Combos

- Each kill adds to your **combo** counter  
- Combo timer resets if you go too long without kills  
- **Taking any hull damage resets combo to zero**  
- Score per kill = `10 × min(combo, 20)` — chain up to **20×** multiplier  
- Enemies grant higher combo weight than asteroids  

**Tip:** Shield pickups let you stay aggressive without breaking your chain.

---

## HUD guide

| Element | Meaning |
|---------|---------|
| Red squares (top-left) | HP — empty squares = damage taken |
| SCORE | Current run score |
| WAVE X/100 | Campaign progress |
| CLEAR X/Y | Kills needed to finish non-boss wave |
| BOSS bar | Boss remaining HP |
| xN COMBO | Active combo multiplier |
| BEST | All-time high score |
| Buff labels | Active RAPID / SPREAD / SHIELD timers |

---

## Strategy tips (website / blog)

1. **Learn drift** — release keys to coast; tight dodges use momentum, not constant thrust.  
2. **Prioritize drones** on later waves — they track you and deal contact damage.  
3. **Save SHIELD and NUKE for boss gates** — dreadnoughts have large HP pools.  
4. **Don't greed on combos** near asteroids — one hit resets the chain and costs HP.  
5. **Pause before a boss** if you need a break — your run is saved at that wave.  
6. **SPREAD + RAPID** overlap is the best DPS window for boss DPS checks.  
7. **Wave 50+** expects long sessions — Continue Campaign is there for multi-day clears.

---

## FAQ (website / support)

**What platforms run Neon Drift?**  
PC — Windows, macOS, Linux via Python 3 + Pygame. Run `pip install -r requirements.txt` then `python main.py`, or `npm run pc` from the repo root.

**Is there a story?**  
Yes. The main menu story panel covers the Orion Belt campaign — Captain Nova Kane vs Viper Holdings across 100 gates.

**How long is a full campaign?**  
Clearing all 100 waves can take several hours depending on skill. Saves let you spread it across sessions.

**Where is progress saved?**  
`neon-drift-pc/savegame.json` — wave, score, HP, buffs, and boss state.

**Is it roguelike?**  
Campaign-style arcade: permadeath on death, but mid-run saves. Power-ups drop during combat (not between-wave drafts).

**Can I use arrow keys?**  
Yes. WASD and arrow keys both work.
