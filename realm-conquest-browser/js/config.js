/**
 * App configuration
 * Set GOOGLE_CLIENT_ID below, or pass ?google_client_id=YOUR_ID in the URL.
 * Create credentials: https://console.cloud.google.com/apis/credentials
 * Authorized origins: your Netlify URL + http://localhost:8080
 */
const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

function resolveSocketUrl() {
  if (typeof window !== 'undefined' && window.RC_CONFIG?.SOCKET_URL) {
    return window.RC_CONFIG.SOCKET_URL;
  }
  if (params?.get('socket_url')) return params.get('socket_url');
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:8090';
  }
  // Production matchmaking server (Render). Override via ?socket_url= if needed.
  return 'https://realm-conquest-api.onrender.com';
}

export const CONFIG = {
  GOOGLE_CLIENT_ID: params?.get('google_client_id') || '336722102-tetocp64aavg1hhglo079aeqh5l0ijp9.apps.googleusercontent.com',
  SOCKET_URL: resolveSocketUrl(),
  ENABLE_MULTIPLAYER: true,
  MAX_ATTACKS_PER_TURN: 3,
};

export function hasGoogleAuth() {
  return Boolean(CONFIG.GOOGLE_CLIENT_ID);
}
