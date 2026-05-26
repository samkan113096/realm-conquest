# Shadow Strike — Upload to Google Play NOW

**Package:** `com.shadowstrike.myapp`  
**Developer:** Dicky Hui · **Email:** dickhui912@gmail.com

---

## Step 1 — Get the correct `.aab`

**Do not use old builds** — they used package `com.gamedev.shadowstrike`.

When this build is **finished**:

https://expo.dev/accounts/dickhui912/projects/shadow-strike/builds/b9bf5735-f1d3-4434-8de7-d20746ea98ab

Run:

```bash
cd shadow-strike-mobile
npm run play:download-aab
```

File saved as: `google-play/shadow-strike-release.aab`

---

## Step 2 — Play Console (15 minutes)

Open: https://play.google.com/console

### A. Store listing
**Grow → Store presence → Main store listing**

| Field | Paste / upload |
|-------|----------------|
| App name | Shadow Strike |
| Short description | From `../promotion/shadow-strike/ASO-GOOGLE-PLAY.md` |
| Full description | Same file |
| App icon | `assets/icon.png` |
| Feature graphic | `google-play/feature-graphic.png` |
| Screenshots | `google-play/screenshots/` (01, 04, 03, 02) |
| Website | https://heartfelt-youtiao-7e3960.netlify.app/ |
| Privacy policy | https://heartfelt-youtiao-7e3960.netlify.app/privacy.html |
| Email | dickhui912@gmail.com |

### B. Policy (required once)
- **Policy → App content → Content rating** — fantasy violence, not for kids under 13
- **Policy → Data safety** — **No** data collected

### C. Upload build
1. **Testing → Internal testing → Create new release**
2. **Upload** → choose `google-play/shadow-strike-release.aab`
3. Release name: `1.0.0 (3)`
4. **Save** → **Review release** → **Start rollout to Internal testing**
5. Add your Gmail as tester → install on phone from opt-in link
6. When ready: **Production → Create new release** → promote or upload same AAB → **Send for review**

---

## Automated upload (optional)

Place Google service account JSON here:

```
shadow-strike-mobile/google-play-service-account.json
```

Then:

```bash
npm run submit:android
```

Or upload the same JSON at:  
https://expo.dev/accounts/dickhui912/projects/shadow-strike/credentials

---

## After approval

Play Store link (live when published):

https://play.google.com/store/apps/details?id=com.shadowstrike.myapp

Update marketing site: already set in `website/shadow-strike/index.html`.
