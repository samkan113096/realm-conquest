# Realm Conquest — Deploy

## Live game (Netlify)

**Production URL:** https://majestic-mandazi-fe5bd6.netlify.app

## Google OAuth (required for online)

1. [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create **OAuth 2.0 Client ID** (Web application)
3. **Authorized JavaScript origins:**
   - `https://majestic-mandazi-fe5bd6.netlify.app`
   - `http://localhost:8080` (local dev)
4. Set the Client ID in `js/config.js`:

```js
GOOGLE_CLIENT_ID: 'YOUR_ID.apps.googleusercontent.com',
```

Or use: `https://majestic-mandazi-fe5bd6.netlify.app?google_client_id=YOUR_ID`

Redeploy Netlify after changing `config.js` (or use the URL param for a quick test).

## Online matchmaking server (Render)

The browser game connects to a Socket.IO server. Netlify only hosts static files.

1. Push this repo to GitHub (if not already).
2. [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**
3. Point at repo; Render reads `realm-conquest-browser/render.yaml`
4. Service name: `realm-conquest-api` → URL like `https://realm-conquest-api.onrender.com`
5. First request may take ~30s (free tier cold start).

If your Render URL differs, either:

- Edit `js/config.js` → `resolveSocketUrl()` production return value, or
- Play with `?socket_url=https://your-service.onrender.com`

## Local development

```bash
# Terminal 1 — game
npm run web

# Terminal 2 — online server
npm run web:server
```

Open http://localhost:8080

## Redeploy Netlify

```bash
cd realm-conquest-browser
netlify deploy --prod --dir=.
```
