# Realm Conquest

Turn-based hex strategy in the Kingdom of Aldoria. Play solo against AI lords or battle real players online with Google sign-in.

**Live game:** https://majestic-mandazi-fe5bd6.netlify.app

---

## Game modes

| Mode | Login | Opponents |
|------|--------|-----------|
| **Solo Campaign** | None (Guest) | Computer — Red Legion & Shadow Court |
| **Online PvP** | Google only | Real players worldwide (matchmaking) |

Online matches use a **3-minute turn timer**. If you do not end your turn in time, play passes to your opponent automatically.

---

## How to play

1. **Select** your territory (blue hexes) on the map.
2. **Build** Farm → Barracks → Market on your tiles.
3. **Recruit** warriors and archers (requires Barracks).
4. **Move Army** — click the action, then pick a highlighted adjacent friendly hex (map or sidebar list).
5. **Attack** — click the action, then pick a highlighted adjacent enemy hex (up to **3 attacks per turn**).
6. **End Turn** — in solo mode, AI factions move with animated battle reports; online, your opponent plays on their timer.
7. **Win** by controlling **70%** of the map.

### Tips

- Build farms before barracks — each soldier costs 2 food per turn.
- Hills and forests give defenders a terrain bonus.
- Neutral territories are easier to conquer and grant loot.

---

## Run locally

From the **repo root**:

```bash
# Terminal 1 — game (port 8080)
npm run web

# Terminal 2 — online matchmaking (port 8090, only needed for Online PvP)
npm run web:server
```

Open http://localhost:8080

Or from this folder:

```bash
npx serve . -l 8080
cd server && npm install && npm start
```

---

## Google sign-in (online)

1. [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Add **Authorized JavaScript origins** (not redirect URIs):
   - `https://majestic-mandazi-fe5bd6.netlify.app`
   - `http://localhost:8080` (optional)
4. Client ID is in `js/config.js`, or pass `?google_client_id=YOUR_ID` in the URL for testing.

See [DEPLOY.md](./DEPLOY.md) for Netlify + Render matchmaking server setup.

---

## Deploy

| Component | Host | Command / link |
|-----------|------|----------------|
| Game (static) | Netlify | `netlify deploy --prod --dir=.` from this folder |
| Matchmaking | Render (recommended) | [Deploy blueprint](https://render.com/deploy?repo=https://github.com/SelfLearnedDev2027/realm-conquest) |

After Render deploy, set `window.RC_CONFIG.SOCKET_URL` in `index.html` to your API URL and redeploy Netlify.

---

## Project structure

```
realm-conquest-browser/
├── index.html
├── css/style.css
├── assets/              # logo, splash art
├── js/
│   ├── main.js          # Entry, solo/online flow, turn timer UI
│   ├── game.js          # Rules, move/attack modes, economy
│   ├── map.js           # Hex map generation
│   ├── units.js         # Buildings, units, factions
│   ├── ai.js            # Solo AI (animated steps)
│   ├── renderer.js      # Canvas map
│   ├── ui.js            # Sidebar, HUD, target picker
│   ├── auth.js          # Google Identity Services
│   ├── online.js        # Socket.IO client
│   ├── turnAnim.js      # End-turn enemy animation (solo)
│   └── config.js        # Client ID, socket URL, turn limit
└── server/
    ├── index.js         # Lobby, matchmaking, 3-min turn enforcement
    └── package.json
```

---

## Configuration (`js/config.js`)

| Setting | Description |
|---------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client for online play |
| `SOCKET_URL` | Matchmaking server (auto: localhost or production) |
| `ONLINE_TURN_MS` | Turn limit (default 180000 = 3 minutes) |
| `MAX_ATTACKS_PER_TURN` | Attack cap per turn (default 3) |

---

## Tech

- Vanilla JavaScript (ES modules), HTML5 Canvas, CSS
- Socket.IO for online lobby and turn sync
- No frontend build step
