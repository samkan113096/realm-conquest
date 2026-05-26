# Shadow Strike — Complete Deployment & Publish Guide

**Developer:** Dicky Hui · **Email:** dickhui912@gmail.com  
**Package:** `com.ShadowStrike.myapp`  
**EAS Project:** `@dickhui912/shadow-strike`  
**GitHub:** https://github.com/samkan113096

---

## One-command shortcuts

```bash
# From shadow-strike-mobile/
npm run build:android          # New EAS cloud build (~30–60 min)
npm run play:download-aab      # Download finished AAB to google-play/
npm run play:open-console      # Open Play Console in browser
npm run assets:store           # Regenerate screenshots + feature graphic
npm run assets:promo           # Regenerate 15s promo clip
```

---

## Part 1 — Build

```bash
cd shadow-strike-mobile
npm run build:android
```

- Builds on EAS cloud (~30–60 min free tier)
- Track: https://expo.dev/accounts/dickhui912/projects/shadow-strike/builds
- Package: `com.ShadowStrike.myapp`
- Keystore: Expo-managed (stored securely on EAS)

When finished:

```bash
npm run play:download-aab
# → saves: google-play/shadow-strike-release.aab
```

---

## Part 2 — Google Play: First-time setup (one-time)

### 2a. Store listing
Play Console → **Shadow Strike** → **Grow → Store presence → Main store listing**

| Field | Value / source |
|-------|----------------|
| App name | Shadow Strike |
| Short description | Copy from `../promotion/shadow-strike/ASO-GOOGLE-PLAY.md` |
| Full description | Same file |
| App icon | `assets/icon.png` (1024×1024) |
| Feature graphic | `google-play/feature-graphic.png` (1024×500) |
| Screenshots | `google-play/screenshots/` — upload 01, 04, 03, 02 in that order |
| Website | https://heartfelt-youtiao-7e3960.netlify.app/ |
| Privacy policy | https://heartfelt-youtiao-7e3960.netlify.app/privacy.html |
| Email | dickhui912@gmail.com |
| Category | Games → Action |

### 2b. Content rating
**Policy → App content → Content rating** → Start questionnaire  
- Violence: mild cartoon/fantasy  
- No blood, no sexual content, no UGC  
- Not for children under 13

### 2c. Data safety
**Policy → App content → Data safety**  
- No data collected  
- No data shared  
- Local storage only (tutorial/story prefs)

### 2d. Target audience
- Not primarily aimed at children under 13

---

## Part 3 — Internal testing (14-day clock)

> ⚠️ Google requires new accounts to run Internal testing for **14 consecutive days with 12+ active testers** before Production access is granted.

1. Play Console → **Shadow Strike** → **Testing → Internal testing → Create new release**
2. **Upload** → select `google-play/shadow-strike-release.aab`
3. Release name: `1.0.0`  
4. **Save → Review → Start rollout to Internal testing**
5. Copy the **opt-in link** and send to 12+ friends/family (they need Android + Gmail)
6. They install → you wait 14 days

---

## Part 4 — Apply for Production (day 14+)

1. Play Console → **Shadow Strike** → **Release → Production**
2. Click **申請正式版發布資格** (Apply for production release eligibility)
3. Google reviews in a few days
4. Once approved → **Create production release** → upload same AAB → **Send for review**
5. Google review: usually a few hours to 3 days

---

## Part 5 — Future updates (easy)

```bash
cd shadow-strike-mobile
npm run build:android           # new build
npm run play:download-aab       # download when finished
# Upload new AAB in Play Console → Production → Create release
```

---

## Live URLs

| Purpose | URL |
|---------|-----|
| Marketing / landing | https://heartfelt-youtiao-7e3960.netlify.app/ |
| Privacy policy | https://heartfelt-youtiao-7e3960.netlify.app/privacy.html |
| Play Store (after live) | https://play.google.com/store/apps/details?id=com.ShadowStrike.myapp |

---

## Store assets location

```
shadow-strike-mobile/
  google-play/
    feature-graphic.png        # 1024×500 — Play feature image
    screenshots/
      01-menu.png              # 1920×1080 landscape
      02-story.png
      03-gameplay.png
      04-combat.png
    promo-15s.mp4              # vertical Shorts clip (optional)
    shadow-strike-release.aab  # created by npm run play:download-aab

  assets/
    icon.png                   # 1024×1024 app icon

promotion/shadow-strike/
  ASO-GOOGLE-PLAY.md           # copy-paste listing text (SEO optimised)
```

---

## ASO keywords (already in listing)

arena shooter · auto aim · sci-fi · boss fights · free · offline · arcade · mobile action · neo-tokyo

---

## Regenerate assets

```bash
# Terminal 1
npm run web                    # starts Expo web on :8082

# Terminal 2
npm run assets:store           # screenshots + feature graphic
npm run assets:promo           # 15s MP4 clip
```
