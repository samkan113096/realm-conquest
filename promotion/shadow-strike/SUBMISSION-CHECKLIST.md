# Shadow Strike — Store Submission Checklist

Everything **you** must provide before the app can go live. I can prepare builds and listing copy; **stores require your accounts and credentials**.

---

## Accounts you must create (one-time)

| Account | Cost | Link |
|---------|------|------|
| **Apple Developer Program** | $99/year | https://developer.apple.com/programs/ |
| **Google Play Console** | $25 one-time | https://play.google.com/console |
| **Expo / EAS** | Free tier works | https://expo.dev — run `eas login` |

---

## What to send / set up (Google Play first)

### 1. Developer access
- [ ] **Google Play Console** developer account active ($25 one-time)
- [ ] Expo account — run `eas login` on your Mac
- [ ] Run once: `cd shadow-strike-mobile && eas init`

### 2. Legal & contact — READY (verify email)
- [x] **Privacy policy URL:** https://heartfelt-youtiao-7e3960.netlify.app/privacy.html
- [x] **Marketing URL:** https://heartfelt-youtiao-7e3960.netlify.app/
- [x] **Developer name:** Dicky Hui
- [ ] **Support email:** dickyhui.dev@gmail.com — *confirm this is your real inbox*

### 3. Store listing assets — READY in `shadow-strike-mobile/google-play/`
- [x] Feature graphic `feature-graphic.png` (1024×500)
- [x] Screenshots `screenshots/01-menu.png` … `04-combat.png` (1920×1080)
- [x] App icon `assets/icon.png` (1024×1024 — verify before upload)

Regenerate assets: `python3 scripts/generate-store-assets.py`

### 4. App Store Connect (Apple)
- [ ] Create new app → name **Shadow Strike**, bundle ID `com.gamedev.shadowstrike`
- [ ] Paste description from `STORE-LISTINGS.md`
- [ ] Upload screenshots
- [ ] Set category: **Games → Action**
- [ ] Age rating questionnaire (see STORE-LISTINGS.md notes)
- [ ] Export compliance: typically **No** for encryption (standard HTTPS only)

### 5. Google Play Console
- [ ] Create app → **Shadow Strike**, default language English
- [ ] Paste short + full description from `STORE-LISTINGS.md`
- [ ] Upload screenshots + feature graphic
- [ ] Content rating (IARC questionnaire — same answers as Apple)
- [ ] Data safety form: **No data collected** (v1.0 — local storage only for tutorial prefs)
- [ ] Target audience: not primarily children under 13

### 6. Build commands (after `eas init` + login)

```bash
cd shadow-strike-mobile
npm run build:ios          # → upload to TestFlight, then submit for review
npm run build:android      # → AAB for Play Store
eas submit --platform ios
eas submit --platform android
```

First iOS build: Apple may ask you to accept agreements in App Store Connect.  
First Android build: Google may ask for app signing — let EAS manage signing (recommended).

---

## What I still need from you (copy-paste friendly)

Reply with:

1. **Apple Developer** — enrolled? (yes/no) + Team ID if yes  
2. **Google Play Console** — enrolled? (yes/no)  
3. **Expo account email** — after you run `eas login`  
4. **Privacy policy URL** — or say "create one for me" (I can draft a simple page)  
5. **Support email** for store listings  
6. **Developer display name** — e.g. "Your Name" or studio name  
7. **Country** — for tax/content forms  
8. **Screenshots** — you'll capture, or ask me to guide simulator capture  

I **cannot** submit without you owning the developer accounts (Apple/Google policy). Once you're enrolled and logged into EAS, I can run builds and walk through submit step-by-step.

---

## Timeline expectation

| Step | Time |
|------|------|
| Create accounts | 1–2 days (Apple approval can take 24–48h) |
| `eas init` + first build | ~20–40 min per platform (cloud build) |
| Store listing + screenshots | 1–2 hours |
| Apple review | 1–3 days typical |
| Google review | Hours to 3 days typical |

**Total:** ~1 week from account setup to live, if no rejections.
