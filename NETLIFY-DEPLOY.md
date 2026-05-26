# Game Portfolio — Master Deploy Reference

**Developer:** Dicky Hui · **Email:** dickhui912@gmail.com  
**GitHub:** https://github.com/samkan113096

---

## Quick commands (from repo root)

```bash
npm run deploy:realm              # Realm Conquest → Netlify
npm run deploy:chainloot-dapp     # Chain Loot dApp → Netlify
npm run deploy:chainloot-site     # Chain Loot landing → Netlify
npm run deploy:shadow-strike-site # Shadow Strike marketing → Netlify
npm run deploy:all-sites          # All three above
npm run deploy:render             # Realm Conquest matchmaking → Render
```

---

## Shadow Strike (Android)

| Item | Detail |
|------|--------|
| Package | `com.ShadowStrike.myapp` |
| EAS project | `@dickhui912/shadow-strike` |
| Build | `cd shadow-strike-mobile && npm run build:android` |
| Download AAB | `npm run play:download-aab` |
| Play Console | https://play.google.com/console |
| Marketing site | https://heartfelt-youtiao-7e3960.netlify.app/ |
| Full guide | `shadow-strike-mobile/DEPLOY.md` |

**First publish:** needs 12 testers × 14 days internal testing before Production opens.  
**Future updates:** build → download AAB → upload in Play Console.

---

## Realm Conquest (browser)

| Item | Detail |
|------|--------|
| Live game | https://majestic-mandazi-fe5bd6.netlify.app |
| Matchmaking API | https://realm-conquest-api.onrender.com/api/health |
| GitHub (game) | https://github.com/samkan113096/realm-conquest |
| GitHub (API) | https://github.com/samkan113096/realm-conquest-api |
| Redeploy game | `npm run deploy:realm` |
| Redeploy API | `npm run deploy:render` (needs `RENDER_API_KEY`) |
| Full guide | `realm-conquest-browser/DEPLOY.md` |

---

## Chain Loot (Web3 / GameFi)

| Item | Detail |
|------|--------|
| dApp | https://tourmaline-naiad-7f3ed0.netlify.app |
| Landing site | https://golden-haupia-52c7c5.netlify.app |
| Network | Sepolia testnet |
| Redeploy dApp | `npm run deploy:chainloot-dapp` |
| Redeploy site | `npm run deploy:chainloot-site` |

> ⚠️ Chain Loot contracts are frozen. Do not modify unless explicitly required.

---

## Neon Drift (PC)

| Item | Detail |
|------|--------|
| Run locally | `npm run pc` |
| Distribution | Manual zip / itch.io — not on app stores |

---

## Render API key

Stored locally. If key expires, create a new one:  
https://dashboard.render.com/u/settings#api-keys

```bash
export RENDER_API_KEY=rnd_your_new_key
npm run deploy:render
```

---

## Netlify

All sites are auto-linked (no login needed for redeploy):

```bash
npm run deploy:realm
npm run deploy:all-sites
```

---

## Git push

```bash
git add -A && git commit -m "your message" && git push origin main
# origin = https://github.com/samkan113096/realm-conquest
```
