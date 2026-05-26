# Shadow Strike — Publish on Google Play (step-by-step)

You already paid for Play Console. Follow in order. **Automated upload** needs the service account **JSON file** (not a generic API key).

---

## Part A — One-time: service account for `eas submit`

Google Play uses a **service account JSON key**, not a simple “API key” from Google Cloud Console.

1. **Play Console** → **Setup** → **API access**
2. Link a Google Cloud project (or create one)
3. **Create new service account** → opens Google Cloud IAM
4. Create key → **JSON** → download
5. Save as (exact path):
   ```
   shadow-strike-mobile/google-play-service-account.json
   ```
6. Back in Play Console → **Grant access** to that service account → role **Release manager** (minimum)

7. **Create the app** (if not done):
   - **All apps** → **Create app**
   - Name: **Shadow Strike**
   - Default language: English
   - Game / Free
   - Package name: **`com.shadowstrike.myapp`** (must match `app.json`)

---

## Part B — Store listing (copy from ASO file)

Open **`promotion/shadow-strike/ASO-GOOGLE-PLAY.md`** and paste:

- Short + full description  
- Upload assets from **`google-play/`**:
  - `feature-graphic.png`
  - `screenshots/01-menu.png` … `04-combat.png`
- App icon: use **`assets/icon.png`** (1024×1024)

**Paths in console:** Grow → Store presence → Main store listing

| Field | Value |
|-------|--------|
| App name | Shadow Strike |
| Developer | Dicky Hui |
| Website | https://heartfelt-youtiao-7e3960.netlify.app/ |
| Privacy | https://heartfelt-youtiao-7e3960.netlify.app/privacy.html |
| Email | dickhui912@gmail.com |

---

## Part C — Required policies (console forms)

### 1. Content rating
**Policy** → **App content** → **Content rating** → Start questionnaire  
Use answers in `ASO-GOOGLE-PLAY.md` (fantasy violence, no UGC, not for kids under 13).

### 2. Data safety
**Policy** → **Data safety** → No data collected (local storage only for story/tutorial prefs).

### 3. Target audience
Not primarily children under 13.

### 4. Ads
No ads in v1.0.

---

## Part D — Upload the app (automated)

On your Mac:

```bash
cd shadow-strike-mobile
eas login                    # if not already
npm run submit:android       # uploads latest production .aab to Internal testing
```

`eas.json` is set to track **`internal`** first (safe testing). When ready for everyone:

Edit `eas.json` → `"track": "production"` → run `npm run submit:android` again.

**If you never built on this machine:**

```bash
npm run build:android        # wait ~30–60 min on EAS
npm run submit:android
```

---

## Part E — Release to testers, then public

1. **Testing** → **Internal testing** → create release → you should see the uploaded AAB  
2. Add testers (your Gmail) → install via opt-in link on phone  
3. Fix crashes if any  
4. **Production** → **Create new release** → promote from internal OR submit with `track: production`  
5. **Countries** → select all or your markets  
6. **Send for review** — usually hours to 3 days  

---

## What I cannot do without your files

| Item | You provide |
|------|-------------|
| `google-play-service-account.json` | Download from Google (once) |
| `eas login` | Your Expo account in terminal |
| Content rating / Data safety | Play Console forms (5–10 min) |
| First “Create app” | Your Google account |

After the JSON is in `shadow-strike-mobile/`, say **“submit now”** and we run `npm run submit:android` for you.

---

## Promo clip & social

```bash
cd shadow-strike-mobile
chmod +x scripts/generate-promo-clip.sh
./scripts/generate-promo-clip.sh
```

Output: `google-play/promo-15s.mp4` — optional for Play / TikTok / Shorts.

Regenerate screenshots:

```bash
npm run web          # terminal 1 — port 8082
npm run assets:store # terminal 2
```

---

## Checklist

- [ ] App created with package `com.shadowstrike.myapp`
- [ ] Service account JSON in folder + Release manager access
- [ ] Store listing + graphics uploaded
- [ ] Content rating + Data safety complete
- [ ] `npm run submit:android` succeeded
- [ ] Internal test install works
- [ ] Production release submitted for review
