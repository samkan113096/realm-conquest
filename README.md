# Game Dev Portfolio

Four **independent** games — different stories, art, and platforms — plus **Chain Loot** (standalone Web3 GameFi). No shared in-game universe; each title is its own product.

> **Chain Loot (`gamefi/`) is complete and frozen.** Future work targets the three portfolio games below. Chain Loot docs live in [`gamefi/DEPLOYMENT.md`](gamefi/DEPLOYMENT.md) and [`gamefi/README.md`](gamefi/README.md).

---

## Quick reference

| # | Game | Folder | Platform | Genre | Tagline |
|---|------|--------|----------|-------|---------|
| 1 | **Realm Conquest** | `realm-conquest-browser/` | Browser | Turn-based hex strategy | Conquer Aldoria. One hex at a time. |
| 2 | **Neon Drift** | `neon-drift-pc/` | PC (Pygame) | Arcade roguelike shooter | Outrun the drones. Chase the high score. |
| 3 | **Shadow Strike** | `shadow-strike-mobile/` | Mobile web / Expo | Action brawler | Fight the underrealm. Floor by floor. |
| 4 | **Chain Loot** | `gamefi/` | Browser dApp + landing | Web3 GameFi (Zombie Siege) | Fight zombies. Earn LOOT. |

| Support | Folder | Purpose |
|---------|--------|---------|
| Marketing site | `website/` | Portfolio hub, SEO pages, tutorials |
| Promotion pack | `promotion/` | 90-day tweets, Telegram, email, memes per game |

---

## 1. Realm Conquest

**Folder:** `realm-conquest-browser/`  
**Platform:** Browser (static HTML/Canvas — no install)  
**Live URL:** https://majestic-mandazi-fe5bd6.netlify.app  
**Local URL:** http://localhost:8080 (`npm run web`)

### Setting & story

**Kingdom of Aldoria · Age of Warlords.** Three great houses tear the realm apart. You are **Lord of House Azurewind** (player faction, blue territories). Rivals include the **Red Legion** and **Shadow Court**. Farm, forge armies, and conquer hex lands before enemy lords erase your line.

### Game modes

| Mode | Login | Opponents |
|------|--------|-----------|
| **Solo Campaign** | Guest (no account) | AI — Red Legion & Shadow Court |
| **Online PvP** | Google sign-in only | Real players (Socket.IO matchmaking) |

Online: **3-minute turn limit** per player; timer shown in the HUD. If time runs out, the turn passes to the opponent (enforced on the server).

### Visual style

Medieval fantasy — parchment panels, gold & blue UI, Cinzel headings, responsive layout (desktop + mobile). Hex map with terrain (plains, hills, forests). SVG logo and splash in `assets/`.

### Core gameplay

- **Turn-based** strategy on a **hex map**
- Select territory → build → recruit → **move** / **attack** (pick adjacent hex from highlights or sidebar list) → **End Turn**
- **Resources:** gold, food, army size
- **Buildings:** Farm, Market, Barracks
- **Units:** Warriors, Archers
- **Army upkeep:** 2 food per soldier per turn
- **Terrain** defense on hills/forests
- **3 attacks per turn** maximum
- **Win:** Control **70% of the map**
- Solo: animated AI turn summary after End Turn

### Controls

Mouse / touch — click map and sidebar buttons. Mobile: map on top, action panel scrolls below.

### Tech stack

Vanilla JS (ES modules), HTML5 Canvas, CSS, Google Identity Services, Socket.IO.

```
realm-conquest-browser/
├── index.html
├── css/style.css
├── js/
│   ├── main.js, game.js, map.js, units.js, ai.js
│   ├── renderer.js, ui.js, turnAnim.js
│   ├── auth.js, online.js, config.js
└── server/          # Online lobby + matchmaking (port 8090)
```

### Run

```bash
npm run web              # Game → http://localhost:8080
npm run web:server       # Online matchmaking → http://localhost:8090
```

Details: [`realm-conquest-browser/README.md`](realm-conquest-browser/README.md) and [`realm-conquest-browser/DEPLOY.md`](realm-conquest-browser/DEPLOY.md)

---

## 2. Neon Drift

**Folder:** `neon-drift-pc/`  
**Platform:** PC desktop (Python 3 + Pygame)  
**Launch:** `npm run pc` or `python main.py`

### Setting & story

**Orion Belt smuggler lanes** — cyberpunk space. You are a **rogue pilot** outrunning **corporate drones** through neon debris fields. Asteroids today, armed pursuers tomorrow. One-more-run arcade energy; high score is the only legacy.

### Visual style

Neon cyan / magenta on dark space, monospace HUD, particle effects, retro arcade feel.

### Core gameplay

- **Top-down** ship shooter, **60 FPS**
- Destroy **asteroids** for score; **combo multiplier** chains kills
- **Waves** escalate with score; **enemies** from wave 2+
- **Power-ups:** shield, speed, heal, rapid fire
- **Permadeath** per run; **high score** saved to `highscore.json`
- Menu → run → game over → retry loop

### Controls

| Input | Action |
|-------|--------|
| Arrow keys / WASD | Move & rotate ship |
| Space | Shoot |
| Space (menu / game over) | Start / restart |

### Tech stack

Python 3, Pygame. Dependencies in `requirements.txt`.

```
neon-drift-pc/
├── main.py          # Entry
├── game.py          # Loop, collisions, spawning, waves
├── player.py        # Player ship
├── entities.py      # Asteroids, enemies, particles
├── powerups.py      # Power-up types
├── ui.py            # HUD, menus
└── requirements.txt
```

### Run

```bash
cd neon-drift-pc && pip install -r requirements.txt && python main.py
# or from root:
npm run pc
```

---

## 3. Shadow Strike

**Folder:** `shadow-strike-mobile/`  
**Platform:** Mobile — **Expo / React Native** (iOS, Android, web)  
**Local web URL:** http://localhost:8082 (`npm run phone:web`)

### Setting & story

**Neo-Tokyo 2187 · Underground Circuit.** Play as **Kira Ashida** (codename **Shadow Strike**) — ex-corporate security who walked away after syndicate fight-rigging. She brawls up the illegal pit ladder to expose **Viper Holdings**. Bosses on floors 5, 10, 15 (Ironjaw Tanaka, Mako Viper, Director Viper).

### Visual style

Dark purple / red urban fight pits, pixel-style sprites, landscape orientation, story dialogue panels between floors.

### Core gameplay

- **Endless dungeon floors** — clear all enemies to advance
- **Virtual joystick** (left) + **ATK / CLEAR / DGE** (right)
- **Combos** from rapid attacks; **CLEAR** wipes groups; **DGE** dodge with i-frames
- **Boss every 5 floors** with story cutscenes
- **Story mode** with optional tutorial (first-run)
- Score + floor tracked; local high score on menu

### Controls

| Input | Action |
|-------|--------|
| Left thumb stick | Move Kira |
| ATK | Melee (auto-aims at nearby foes) |
| CLEAR | Area clear / special burst |
| DGE | Dodge (invincibility frames) |

### Tech stack

Expo SDK, React Native, custom `GameScreen` canvas/logic in `src/`.

```
shadow-strike-mobile/
├── App.js
├── app.json
├── src/
│   ├── components/   # GameScreen, TutorialScreen
│   ├── story/        # chapters.js — Kira, bosses, intros
│   ├── constants.js  # Colors, sprites
│   └── storage.js    # Tutorial dismissed flag
└── assets/
```

### Run

```bash
cd shadow-strike-mobile && npm install
npm run phone:web      # Browser :8082
npm run phone:ios      # Expo → iOS simulator
npm run phone:android  # Expo → Android emulator
```

---

## 4. Chain Loot *(complete — reference only)*

**Folder:** `gamefi/`  
**Platform:** Browser dApp + marketing site  
**Network:** Ethereum **Sepolia** testnet (chain `11155111`)  
**Status:** Shipped. Do not modify unless explicitly requested.

### What it is

Standalone **GameFi** — **not** tied to Realm Conquest, Neon Drift, or Shadow Strike. Core game is **Zombie Siege**: mint hero & weapon NFTs, equip, fight zombies on-chain, earn **LOOT** ERC-20.

### Live URLs

| | URL |
|---|-----|
| dApp | https://tourmaline-naiad-7f3ed0.netlify.app |
| Landing | https://golden-haupia-52c7c5.netlify.app |

### Economy & features

| Piece | Description |
|-------|-------------|
| **LOOT** | ERC-20, 1B max supply |
| **CLOOT Heroes** | ERC-721 — 5 classes, 5 rarities, 10k max, named art |
| **WLOOT Weapons** | ERC-721 — 5 types, equippable, 20k max |
| **Zombie Siege** | UUPS proxy — `fight(heroId, tier)` on-chain, HP + 30s cooldown |
| **Staking** | Stake LOOT → earn LOOT |
| **Marketplace** | List/buy heroes & weapons for LOOT (2.5% fee) |
| **LootAirdrop** | Admin-managed community airdrops (**no public faucet**) |

### Zombie tiers

| Tier | Min power | LOOT reward | HP cost |
|------|-----------|-------------|---------|
| Shambler | 40 | 2 | 12 |
| Runner | 70 | 5 | 18 |
| Brute | 110 | 10 | 26 |
| Elite | 160 | 20 | 36 |
| Necromancer | 220 | 40 | 48 |

Hero **HP regen:** 10 HP/hour on-chain.

### Repo layout

```
gamefi/
├── contracts/       # Solidity (Hardhat)
├── dapp/            # React + wagmi dApp
├── site/            # Landing, tutorial, blog
├── scripts/         # deploy, airdrop, e2e tests
├── test/            # 11/11 Hardhat tests
└── DEPLOYMENT.md    # Contract addresses & ops
```

Full deploy details: [`gamefi/DEPLOYMENT.md`](gamefi/DEPLOYMENT.md)

---

## Repo structure (top level)

```
game/
├── README.md                 # This file — master game reference
├── package.json              # Root npm scripts
├── realm-conquest-browser/   # Game 1
├── neon-drift-pc/            # Game 2
├── shadow-strike-mobile/     # Game 3
├── gamefi/                   # Game 4 — Chain Loot (frozen)
├── website/                  # Portfolio marketing site (:3000)
├── promotion/                # 90-day social content per game
└── scripts/
    └── start-all.sh          # Launch local stack
```

---

## Commands (from repo root)

```bash
# All local dev servers (web + mobile web + GameFi dApp)
npm run start:all

# Individual games
npm run web              # Realm Conquest → :8080
npm run web:server       # Realm Conquest online matchmaking → :8090
npm run pc               # Neon Drift (Pygame desktop)
npm run phone:web        # Shadow Strike → :8082
npm run phone:ios        # Shadow Strike iOS (Expo)
npm run phone:android    # Shadow Strike Android (Expo)

# Marketing
npm run site             # Portfolio website → :3000

# Chain Loot (reference — already deployed)
npm run gamefi           # dApp dev server → :5173

# First-time setup
npm run install:all      # shadow-strike + neon-drift deps + gamefi
```

---

## Promotion content

Pre-generated **90 days × 4 games** of tweets, Telegram posts, emails, and meme SVGs.

```bash
node promotion/scripts/generate-90-day-content.js   # Regenerate
```

Folders: `promotion/chain-loot/`, `promotion/realm-conquest/`, `promotion/neon-drift/`, `promotion/shadow-strike/`

---

## Design principle

Each game is **standalone** — separate lore, art, platform, and codebase. Chain Loot is a fourth product in the same repo, not a hub that the other three games plug into. When updating Realm Conquest, Neon Drift, or Shadow Strike, leave `gamefi/` unchanged.
