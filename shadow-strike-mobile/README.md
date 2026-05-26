# Shadow Strike — Mobile Arena Shooter

Expo (React Native) top-down shooter for **iOS**, **Android**, and **web preview**. Play as **Kira Ashida (Shadow Strike)** and fight through Neo-Tokyo's underground circuit — similar feel to Neon Drift, but on foot in a pit arena.

---

## How it plays

| Control | Action |
|---------|--------|
| **Left joystick** | Move Kira around the arena to **evade** chasing enemies |
| **SHOOT (hold)** | Fire energy blasts — **auto-aims at the nearest enemy** (gold ring = target) |
| **BOMB** | Area blast that clears nearby foes (4s cooldown) |

**Enemies chase you.** If they get close, they damage you. Keep moving with the left stick while holding SHOOT to kite and survive.

Hold the phone in **landscape** for the best experience.

---

## Quick start

```bash
cd shadow-strike-mobile
npm install
npm run assets:generate   # first time / if images missing
npm run web               # browser preview → http://localhost:8082
npm start                 # Expo dev menu (scan QR with Expo Go)
npm run ios               # iOS simulator (Mac + Xcode)
npm run android           # Android emulator
```

From the repo root:

```bash
npm run phone:web
npm run phone:ios
npm run phone:android
```

---

## Gameplay

- Clear all enemies on a floor to advance
- **Boss fight + story dialogue every 5 floors** (skippable)
- Kill streak multiplier for consecutive takedowns
- Tutorial on first launch (skip or “never show again”)
- Story cutscenes can be skipped or disabled permanently
- +20 HP heal between floors

---

## Deploy to Android & iOS

Shadow Strike uses [EAS Build](https://docs.expo.dev/build/introduction/) — no native code changes required for a standard store build.

### One-time setup

```bash
npm install -g eas-cli
cd shadow-strike-mobile
eas login
eas init                  # links project on expo.dev — updates app.json projectId
eas build:configure       # if prompted
```

### Build

```bash
# Production (App Store / Google Play)
npm run build:ios
npm run build:android

# Internal testing (APK + iOS simulator build)
npm run build:preview:android
npm run build:preview:ios
```

### Submit to stores

```bash
eas submit --platform ios
eas submit --platform android
```

### App identifiers (already configured)

| Platform | ID |
|----------|-----|
| iOS bundle ID | `com.shadowstrike.myapp` |
| Android package | `com.shadowstrike.myapp` |
| Orientation | Landscape only |

You will need Apple Developer and Google Play Console accounts for store submission. Replace the placeholder `projectId` in `app.json` with your real EAS project ID after running `eas init`.

### Test on a real device (no store build)

1. Install **Expo Go** on your phone
2. Run `npm start` and scan the QR code
3. Same Wi‑Fi as your dev machine

---

## Project structure

```
shadow-strike-mobile/
├── App.js                 # Menu, tutorial flow, game over
├── index.js               # Entry point
├── app.json               # iOS / Android / web config
├── eas.json               # EAS build profiles (dev / preview / production)
├── public/index.html      # Web shell (dark background while JS loads)
├── scripts/generate-assets.py
└── src/
    ├── components/        # GameScreen, Tutorial, StoryOverlay
    ├── entities/          # Player, Enemy, Bullet
    ├── systems/Combat.js  # Spawning, bomb hits
    ├── story/chapters.js  # Dialogue & tutorial steps
    ├── storage.js         # AsyncStorage / localStorage prefs
    └── constants.js       # Colors, sprites, game tuning
```

---

## Troubleshooting

**White screen on web?**
1. Run `npm run assets:generate` — corrupt assets break the Metro bundler
2. Hard refresh (Cmd+Shift+R)
3. Clear cache: `npm run web` (already passes `--clear`)

**In-app error message?** The error boundary shows the exact failure — share it for debugging.

**Shooting not hitting?** Hold SHOOT — bullets auto-aim at the nearest enemy within range. Use the left stick to keep distance while firing.

---

## Tech

- Expo SDK 52, React Native 0.76
- Works in **Expo Go** for development
- **AsyncStorage** for tutorial/story preferences on iOS & Android
- Landscape-only on mobile
- Web preview via Metro (`react-native-web`)
