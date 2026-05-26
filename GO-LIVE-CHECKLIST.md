# Go-Live Checklist — Dicky Hui / Game Portfolio

**Developer:** Dicky Hui · **Support:** dickhui912@gmail.com  
**Last audit:** May 2026

---

## Shadow Strike (Google Play) — PRIMARY

### Code & build — verified

| Check | Status |
|-------|--------|
| Web bundle exports (`npx expo export --web`) | ✅ Pass |
| Shooter gameplay (SHOOT + BOMB, auto-aim) | ✅ In codebase |
| Story skip / never show again | ✅ |
| Tutorial + AsyncStorage | ✅ |
| EAS project linked | ✅ `@dickhui912/shadow-strike` |
| Android keystore (Expo) | ✅ Created on EAS |
| EAS production build (`com.shadowstrike.myapp`) | ⏳ [Latest builds](https://expo.dev/accounts/dickhui912/projects/shadow-strike/builds) |

### Store assets — ready (`shadow-strike-mobile/google-play/`)

- [x] `feature-graphic.png` (1024×500)
- [x] Screenshots ×4 (1920×1080)
- [x] App icon `assets/icon.png`
- [x] Copy: `promotion/shadow-strike/STORE-LISTINGS.md`

### Live web — verified

| URL | Status |
|-----|--------|
| https://heartfelt-youtiao-7e3960.netlify.app/ | ✅ 200 |
| https://heartfelt-youtiao-7e3960.netlify.app/privacy.html | ✅ 200, email correct |

### You still need (Google Play)

1. [ ] **App in Play Console** — package `com.shadowstrike.myapp` (you created this ✅)
2. [ ] **Store listing** — copy from `promotion/shadow-strike/ASO-GOOGLE-PLAY.md`, graphics from `google-play/`
3. [ ] **Content rating** + **Data safety** (no data collected)
4. [ ] **Upload `.aab`** — run `npm run play:download-aab` after EAS build finishes, or `npm run submit:android` if service account JSON is in place
5. [ ] **Internal test** → then **Production** → Send for review

---

## Realm Conquest (browser)

| Check | Status |
|-------|--------|
| Live game | ✅ https://majestic-mandazi-fe5bd6.netlify.app |
| Solo vs AI (guest) | ✅ |
| Online PvP | ⚠️ Deploy Render API — `npm run deploy:render` or [one-click](https://render.com/deploy?repo=https://github.com/samkan113096/realm-conquest-api) |

**You need:** Render deploy OR keep Mac + tunnel running for online play.

---

## Neon Drift (PC)

| Check | Status |
|-------|--------|
| Playable locally | ✅ `npm run pc` |
| Store listing copy | ✅ `promotion/neon-drift/STORE-LISTINGS.md` |
| “Live” distribution | itch.io / GitHub release — manual zip, not app stores |

---

## Chain Loot (Web3)

| Check | Status |
|-------|--------|
| dApp + landing | ✅ URLs in `promotion/chain-loot/STORE-LISTINGS.md` |
| Frozen / reference | ✅ No further work unless requested |

---

## Portfolio website (`website/`)

| Check | Status |
|-------|--------|
| Hub + game pages | ✅ Built |
| Shadow Strike landing | ✅ Deployed (separate Netlify site) |
| Deploy hub | Run `npm run site` + Netlify if you want public portfolio URL |

---

## What to send me (optional automation)

| Item | Enables |
|------|---------|
| EAS build finished | I can guide submit / verify `.aab` |
| `google-play-service-account.json` | Auto-upload via `eas submit` |
| Render URL for Realm Conquest | I can update `SOCKET_URL` + redeploy |

---

## Quick commands

```bash
# Shadow Strike — check build
cd shadow-strike-mobile && npx eas-cli build:list --platform android --limit 1

# Shadow Strike — submit after .aab + service account
npm run submit:android

# Regenerate store screenshots (need game on :8082)
npm run web   # other terminal
npm run assets:store
```
