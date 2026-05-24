/**
 * Google Sign-In — required for online multiplayer.
 */
import { CONFIG, hasGoogleAuth } from './config.js';

const STORAGE_KEY = 'rc_player_session';

let currentUser = null;
let googleInitialized = false;
let onAuthChange = null;

export function getCurrentUser() {
  if (currentUser) return currentUser;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) currentUser = JSON.parse(raw);
  } catch (_) { /* ignore */ }
  return currentUser;
}

export function isGuest() {
  const u = getCurrentUser();
  return u?.provider === 'guest';
}

export function isGoogleUser() {
  const u = getCurrentUser();
  return u?.provider === 'google';
}

function saveUser(user) {
  currentUser = user;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function loginAsGuest() {
  const user = {
    id: `guest_${Date.now()}`,
    name: 'Guest Lord',
    email: null,
    picture: null,
    provider: 'guest',
    mode: 'solo',
    loggedInAt: Date.now(),
  };
  saveUser(user);
  onAuthChange?.(user);
  return user;
}

export function logout() {
  currentUser = null;
  localStorage.removeItem(STORAGE_KEY);
  if (window.google?.accounts?.id) {
    window.google.accounts.id.disableAutoSelect();
  }
  onAuthChange?.(null);
}

export function initAuth(onUserChange) {
  onAuthChange = onUserChange;
  const existing = getCurrentUser();
  if (existing) onUserChange?.(existing);
  setupGoogleButton();
}

export function setupGoogleButton() {
  const placeholder = document.getElementById('google-signin-btn');
  const hint = document.getElementById('google-setup-hint');

  if (!hasGoogleAuth()) {
    if (hint) hint.classList.remove('hidden');
    if (placeholder) {
      placeholder.innerHTML = '';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-google-fallback';
      btn.textContent = 'Sign in with Google';
      btn.onclick = () => onAuthChange?.({ setupRequired: true });
      placeholder.appendChild(btn);
    }
    return;
  }

  if (hint) hint.classList.add('hidden');

  const tryInit = () => {
    if (!window.google?.accounts?.id || googleInitialized) return;
    googleInitialized = true;
    window.google.accounts.id.initialize({
      client_id: CONFIG.GOOGLE_CLIENT_ID,
      callback: (response) => handleGoogleCredential(response.credential),
      auto_select: false,
    });
    renderGoogleButton('google-signin-btn');
    renderGoogleButton('google-signin-online');
  };

  if (window.google?.accounts?.id) tryInit();
  else window.addEventListener('load', () => setTimeout(tryInit, 500));
}

function handleGoogleCredential(jwt) {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    const user = {
      id: payload.sub,
      name: payload.name || 'Commander',
      email: payload.email,
      picture: payload.picture,
      provider: 'google',
      mode: 'online',
      loggedInAt: Date.now(),
    };
    saveUser(user);
    onAuthChange?.(user);
  } catch (e) {
    console.error('Google sign-in failed', e);
  }
}

export function renderGoogleButton(elementId) {
  const el = document.getElementById(elementId);
  if (!el || !hasGoogleAuth() || !window.google?.accounts?.id) return;
  el.innerHTML = '';
  window.google.accounts.id.renderButton(el, {
    theme: 'filled_blue',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
    width: Math.min(320, el.clientWidth || 320),
  });
}

export function googleSetupMessage() {
  return 'Add your Google OAuth Client ID in js/config.js (or ?google_client_id=... in the URL). Enable Google Identity Services and allow http://localhost:8080 as an origin.';
}
