# Shadow Strike — Google Play Store Package

**Developer:** Dicky Hui  
**Package:** `com.shadowstrike.myapp`

## URLs (after Netlify deploy)

| Purpose | URL |
|---------|-----|
| Marketing / landing | https://heartfelt-youtiao-7e3960.netlify.app/ |
| Privacy policy | https://heartfelt-youtiao-7e3960.netlify.app/privacy.html |
| Support email | dickyhui.dev@gmail.com |

Replace `dickyhui.dev@gmail.com` in `privacy.html` if you use a different address.

## Assets in this folder

| File | Use |
|------|-----|
| `feature-graphic.png` | Google Play feature graphic (1024×500) |
| `screenshots/*.png` | Phone screenshots (1920×1080 landscape) |

Regenerate: `python3 scripts/generate-store-assets.py` (requires Expo web on :8082)

## Deploy landing + privacy to Netlify

```bash
cd website/shadow-strike
npx netlify deploy --prod --dir=.
```

## Google Play Console — paste from

`promotion/shadow-strike/STORE-LISTINGS.md`

### Store listing fields

- **App name:** Shadow Strike
- **Short description:** Auto-aim arena shooter. Move, shoot, bomb. Boss every 5 floors. Neo-Tokyo 2187.
- **Developer name:** Dicky Hui
- **Category:** Game → Action
- **Privacy policy URL:** (see table above)
- **Website:** (marketing URL above)
- **Email:** dickyhui.dev@gmail.com

### Content rating (IARC)

- Fantasy violence, no blood
- No UGC, no online chat
- Not designed for children under 13

### Data safety

- No data collected
- Local storage only (tutorial/story prefs)

## Build AAB for upload

```bash
cd shadow-strike-mobile
eas login
eas init
npm run build:android
```

Upload the `.aab` from EAS to Play Console → Release → Production.
