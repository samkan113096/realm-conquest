# Chain Loot GameFi — Zombie Siege on Optimism

Standalone play-to-earn on **Optimism**. Mint hero & weapon NFTs, fight zombies in **Zombie Siege** — all combat and rewards on-chain.

> **Not connected** to Realm Conquest, Neon Drift, or Shadow Strike. Those are separate portfolio games.

## What's Included

| Component | Description |
|-----------|-------------|
| **LOOT Token** | ERC-20 game currency (1B max supply) |
| **CLOOT Heroes** | ERC-721 — 5 classes, 5 rarities, 10k max |
| **WLOOT Weapons** | ERC-721 — equippable gear, 20k max |
| **Zombie Siege** | On-chain `fight()` — earn LOOT per zombie tier |
| **Staking** | Stake LOOT → earn LOOT |
| **Marketplace** | Trade heroes/weapons for LOOT |
| **Daily Faucet** | 10 LOOT / 24h |
| **Landing site** | `site/` on port 3001 |
| **dApp** | React + wagmi on port 5173 |

---

## Quick Start (Local)

```bash
cd gamefi
npm install
npm run compile
npm test

# Terminal 1 — blockchain
npm run node

# Terminal 2 — deploy
npm run deploy:local

# Terminal 3 — landing site + API
npm run signer    # http://localhost:3001

# Terminal 4 — dApp
npm run dapp      # http://localhost:5173
```

MetaMask → **Hardhat Local (31337)**. Import test account #0:
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

---

## Architecture

```
gamefi/
├── contracts/
│   ├── GameToken.sol
│   ├── GameHero.sol      # CLOOT heroes
│   ├── GameWeapon.sol    # WLOOT weapons
│   ├── ZombieSiege.sol   # on-chain combat
│   ├── GameStaking.sol
│   ├── GameRewards.sol   # daily faucet
│   └── GameMarketplace.sol
├── site/                 # Landing, tutorial, blog, audit
├── dapp/                 # Wallet UI + Zombie Siege game
├── server/signer.js      # Site host + health API
├── scripts/deploy.js
└── test/GameFi.test.js   # 5/5 passing
```

## Zombie Siege Flow

1. Mint hero (50 LOOT) + optional weapon (25 LOOT)
2. Equip weapon via `ZombieSiege.equipWeapon()`
3. Select zombie tier (Shambler → Necromancer)
4. Call `fight(heroId, tier)` — win rolls on-chain
5. LOOT minted to wallet on victory

| Tier | Min Power | Reward |
|------|-----------|--------|
| Shambler | 40 | 2 LOOT |
| Runner | 70 | 5 LOOT |
| Brute | 110 | 10 LOOT |
| Elite | 160 | 20 LOOT |
| Necromancer | 220 | 40 LOOT |

---

## dApp Tabs

- **Play** — Zombie Siege canvas + on-chain fight
- **Dashboard** — balance, daily faucet, stats
- **Heroes** — mint CLOOT NFTs
- **Staking** — passive LOOT
- **Market** — NFT marketplace

---

## URLs (Local)

| Service | URL |
|---------|-----|
| Landing page | http://localhost:3001 |
| Tutorial | http://localhost:3001/tutorial.html |
| Blog | http://localhost:3001/blog/ |
| dApp | http://localhost:5173 |
| Health | http://localhost:3001/health |

---

## Tests

```bash
npm test   # 5/5 passing
```

## Regenerate blog posts

```bash
node scripts/generate-blog.js
```
