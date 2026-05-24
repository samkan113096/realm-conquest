/**
 * Online lobby & matchmaking — Socket.IO client.
 */
import { CONFIG } from './config.js';
import { getCurrentUser, isGoogleUser } from './auth.js';

let socket = null;
let callbacks = {};
let connected = false;
let connecting = false;

export function isOnlineConnected() {
  return connected && socket?.connected;
}

export function connectOnline(cb) {
  callbacks = cb || {};
  connected = false;

  if (!isGoogleUser()) {
    callbacks.onError?.('Sign in with Google to play online.');
    return null;
  }

  if (socket?.connected) {
    connected = true;
    callbacks.onConnected?.();
    return socket;
  }

  if (connecting) return socket;

  if (typeof io === 'undefined') {
    callbacks.onError?.('Online server script failed to load.');
    return null;
  }

  connecting = true;
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  socket = io(CONFIG.SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 8,
    timeout: 12000,
  });

  socket.on('connect', () => {
    connecting = false;
    connected = true;
    const user = getCurrentUser();
    socket.emit('lobby:join', user);
    callbacks.onConnected?.();
  });

  socket.on('disconnect', () => {
    connected = false;
    callbacks.onDisconnected?.();
  });

  socket.on('connect_error', (err) => {
    connecting = false;
    connected = false;
    const msg = CONFIG.SOCKET_URL.includes('localhost')
      ? 'Cannot reach online server. Run: npm run web:server'
      : 'Cannot reach online server. It may be waking up — try again in 30s.';
    callbacks.onError?.(msg);
    console.warn('Socket connect_error', err?.message);
  });

  socket.on('lobby:update', (data) => callbacks.onLobbyUpdate?.(data));
  socket.on('queue:status', (data) => callbacks.onQueueStatus?.(data));
  socket.on('match:found', (data) => callbacks.onMatchFound?.(data));
  socket.on('turn:change', (data) => callbacks.onTurnChange?.(data));
  socket.on('error', (data) => callbacks.onError?.(data.msg || data));

  return socket;
}

export function joinMatchQueue() {
  if (!socket?.connected) return false;
  socket.emit('queue:join');
  return true;
}

export function leaveMatchQueue() {
  socket?.emit('queue:leave');
}

export function disconnectOnline() {
  leaveMatchQueue();
  connected = false;
  connecting = false;
  socket?.disconnect();
  socket = null;
}

export function emitTurnEnd(roomId) {
  socket?.emit('turn:end', { roomId });
}

export function joinRoom(roomId) {
  socket?.emit('room:join', { roomId });
}
