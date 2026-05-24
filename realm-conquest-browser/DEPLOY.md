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

## Online matchmaking (Render — recommended)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/SelfLearnedDev2027/realm-conquest)

1. Click the button above (or Render Dashboard → New → Blueprint → connect GitHub repo `SelfLearnedDev2027/realm-conquest`)
2. Service name: `realm-conquest-api` → URL like `https://realm-conquest-api.onrender.com`
3. Update `window.RC_CONFIG.SOCKET_URL` in `index.html` to your Render URL
4. Redeploy Netlify: `cd realm-conquest-browser && netlify deploy --prod --dir=.`

GitHub repo: https://github.com/SelfLearnedDev2027/realm-conquest

## Local development

```bash
npm run web          # game → http://localhost:8080
npm run web:server   # matchmaking → http://localhost:8090
```
