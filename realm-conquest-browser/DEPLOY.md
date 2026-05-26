# Realm Conquest — Deploy

## Live game (Netlify)

**https://majestic-mandazi-fe5bd6.netlify.app**

## Google OAuth

Your Client ID is configured in `js/config.js`.

**Important:** Realm Conquest uses Google Identity Services (sign-in button). You must add this under **Authorized JavaScript origins** (not only redirect URIs):

- `https://majestic-mandazi-fe5bd6.netlify.app`
- `http://localhost:8080` (optional, local dev)

Adding origins to an existing OAuth client with other project URLs is safe — each origin works independently and does not break your other apps.

Redirect URIs (like `/api/auth/callback`) are for server redirect flows and are **not** used by this game.

## Online matchmaking (Render)

**API URL (after deploy):** `https://realm-conquest-api.onrender.com`

### Option A — CLI (recommended)

1. [Create Render API key](https://dashboard.render.com/u/settings#api-keys)
2. From repo root:
   ```bash
   export RENDER_API_KEY=rnd_your_key_here
   npm run deploy:render
   ```
3. Wait 2–5 min, then check: https://realm-conquest-api.onrender.com/api/health
4. Redeploy game: `npm run deploy:realm`

`index.html` already points `SOCKET_URL` at the Render service.

### Option B — Blueprint (one click)

**Connect GitHub first:** https://dashboard.render.com/u/settings#integrations

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/samkan113096/realm-conquest-api)

GitHub: https://github.com/samkan113096/realm-conquest-api (matchmaking) · https://github.com/samkan113096/realm-conquest (full game)

After Render deploy → `npm run deploy:realm`

## Local development

```bash
npm run web          # game → http://localhost:8080
npm run web:server   # matchmaking → http://localhost:8090
```
