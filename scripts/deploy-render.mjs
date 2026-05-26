#!/usr/bin/env node
/**
 * Deploy Realm Conquest matchmaking to Render (one-time create + deploy).
 *
 * 1. Render Dashboard → Account Settings → API Keys → Create
 * 2. export RENDER_API_KEY=rnd_...
 * 3. npm run deploy:render
 */
const API = 'https://api.render.com/v1';
// Standalone API repo (repo root = server). Link GitHub in Render first if API returns "unfetchable".
const REPO = process.env.RENDER_REPO || 'https://github.com/samkan113096/realm-conquest-api';
const SERVICE_NAME = 'realm-conquest-api';
const ROOT_DIR = process.env.RENDER_ROOT_DIR || '';

const key = process.env.RENDER_API_KEY;
if (!key) {
  console.error(`
Missing RENDER_API_KEY.

Get one: https://dashboard.render.com/u/settings#api-keys
Then run:
  export RENDER_API_KEY=rnd_your_key_here
  npm run deploy:render
`);
  process.exit(1);
}

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: `Bearer ${key}`,
};

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { ...headers, ...opts.headers } });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    throw new Error(`${opts.method || 'GET'} ${path} → ${res.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

async function getOwnerId() {
  const owners = await api('/owners?limit=20');
  const list = Array.isArray(owners) ? owners : owners?.items || [];
  const user = list.find((o) => o.owner?.email) || list[0];
  const id = user?.owner?.id || user?.id;
  if (!id) throw new Error('No Render owner found. Check API key.');
  return id;
}

async function findService() {
  const data = await api('/services?limit=100');
  const items = (data || []).map((row) => row.service || row);
  return items.find((s) => s.name === SERVICE_NAME || s.slug === SERVICE_NAME);
}

async function createService(ownerId) {
  return api('/services', {
    method: 'POST',
    body: JSON.stringify({
      type: 'web_service',
      name: SERVICE_NAME,
      ownerId,
      repo: REPO,
      branch: 'main',
      autoDeploy: 'yes',
      serviceDetails: {
        env: 'node',
        plan: 'free',
        region: 'oregon',
        envSpecificDetails: {
          buildCommand: 'npm install',
          startCommand: 'npm start',
        },
        healthCheckPath: '/api/health',
        ...(ROOT_DIR ? { rootDir: ROOT_DIR } : {}),
      },
    }),
  });
}

async function triggerDeploy(serviceId) {
  return api(`/services/${serviceId}/deploys`, {
    method: 'POST',
    body: JSON.stringify({ clearCache: 'do_not_clear' }),
  });
}

async function main() {
  console.log('Render deploy —', SERVICE_NAME);
  let service = await findService();

  if (!service) {
    const ownerId = await getOwnerId();
    console.log('Creating web service…');
    const created = await createService(ownerId);
    service = created.service || created;
  } else {
    console.log('Service exists:', service.id);
  }

  const id = service.id;
  const url = service.serviceDetails?.url || `https://${SERVICE_NAME}.onrender.com`;
  console.log('Triggering deploy…');
  await triggerDeploy(id);

  console.log(`
Done. Wait 2–5 min for build, then check:
  ${url}/api/health

Update Netlify client + redeploy:
  npm run deploy:realm
(SOCKET_URL in index.html should be ${url})
`);
}

main().catch((e) => {
  const msg = e.message || String(e);
  console.error(msg);
  if (msg.includes('unfetchable')) {
    console.error(`
GitHub is not linked to your Render account.

1. Open https://dashboard.render.com/u/settings#integrations
2. Connect GitHub → grant access to samkan113096
3. Re-run: export RENDER_API_KEY=rnd_... && npm run deploy:render

Or one-click: https://render.com/deploy?repo=https://github.com/samkan113096/realm-conquest-api
`);
  }
  process.exit(1);
});
