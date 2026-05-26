# Google Play — Automated Upload (optional)

You do **not** have to upload manually forever. After a one-time setup, **`eas submit`** can upload the `.aab` for you.

## What still requires you (one time)

| Step | Why I can't do it alone |
|------|-------------------------|
| `eas login` | Needs your Expo account in the browser |
| Play Console app created | Needs your Google account |
| Service account JSON | Google security — only you can create the key |
| Content rating questionnaire | Play Console web form |
| Store listing first publish | First release often needs human review in console |

## One-time: Google Play API + service account

1. **Play Console** → **Setup** → **API access**
2. **Link** a Google Cloud project (or create one)
3. **Create service account** → Grant access in Play Console as **Release manager** (or Admin)
4. **Download JSON key** → save as:
   ```
   shadow-strike-mobile/google-play-service-account.json
   ```
   ⚠️ **Never commit this file to git** (already in `.gitignore`)

5. In Play Console, create the app **Shadow Strike** with package `com.shadowstrike.myapp` (must exist before submit)

## Configure EAS submit

After the JSON key exists, `eas.json` is already set up to use:

```json
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./google-play-service-account.json",
      "track": "internal"
    }
  }
}
```

Use `"track": "internal"` for testing, `"production"` when ready to go live.

## Commands (after `eas login`)

```bash
cd shadow-strike-mobile
eas init                          # once — real projectId
npm run build:android             # cloud build → .aab
npm run submit:android            # upload .aab via API
```

## What I need from you to automate upload

1. Run **`eas login`** on your Mac (2 minutes)
2. Send or place **`google-play-service-account.json`** in `shadow-strike-mobile/` (or tell me when it's there)
3. Confirm the app exists in Play Console with package **`com.shadowstrike.myapp`**

Then I can run build + submit without you clicking upload in the browser.

## What you still do manually (once)

- Content rating (IARC questionnaire in Play Console)
- Data safety form (answer: no data collected)
- Paste store description + upload screenshots *(or use Play Developer API for listings — advanced)*

---

**Support email:** dickhui912@gmail.com  
**Privacy:** https://heartfelt-youtiao-7e3960.netlify.app/privacy.html
