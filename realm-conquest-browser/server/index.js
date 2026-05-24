/**
 * Realm Conquest online lobby — matchmaking via Socket.IO.
 */
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || process.env.RC_PORT || 8090;
const TURN_MS = Number(process.env.RC_TURN_MS) || 3 * 60 * 1000;

const app = express();
app.use(cors({ origin: '*' }));
app.get('/api/health', (_, res) => res.json({
  ok: true,
  online: lobby.size,
  queue: queue.length,
  turnLimitSec: TURN_MS / 1000,
}));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 60000,
});

/** @type {Map<string, { id, name, picture, provider, socketId }>} */
const lobby = new Map();
/** @type {string[]} */
const queue = [];
/** @type {Map<string, object>} */
const rooms = new Map();

function lobbySnapshot() {
  return [...lobby.values()].map(({ id, name, picture }) => ({ id, name, picture }));
}

function queueStatusFor(userId) {
  const idx = queue.indexOf(userId);
  return {
    queued: idx >= 0,
    position: idx >= 0 ? idx + 1 : 0,
    waitingForOpponent: queue.length === 1,
    queueSize: queue.length,
  };
}

function broadcastLobby() {
  io.emit('lobby:update', { count: lobby.size, players: lobbySnapshot() });
}

function clearRoomTimer(room) {
  if (room.turnTimer) {
    clearTimeout(room.turnTimer);
    room.turnTimer = null;
  }
}

function turnPayload(room, reason = 'ended') {
  return {
    turnIndex: room.turnIndex,
    activePlayerId: room.players[room.turnIndex].id,
    turnDeadline: room.turnDeadline,
    turnLimitMs: TURN_MS,
    reason,
  };
}

function scheduleTurnTimeout(room) {
  clearRoomTimer(room);
  const remaining = Math.max(0, room.turnDeadline - Date.now());
  room.turnTimer = setTimeout(() => {
    if (!rooms.has(room.id)) return;
    room.turnIndex = (room.turnIndex + 1) % 2;
    room.turnDeadline = Date.now() + TURN_MS;
    io.to(room.id).emit('turn:change', turnPayload(room, 'timeout'));
    scheduleTurnTimeout(room);
  }, remaining);
}

function startTurnClock(room) {
  room.turnDeadline = Date.now() + TURN_MS;
  scheduleTurnTimeout(room);
  return room.turnDeadline;
}

function advanceTurn(room, reason = 'ended') {
  room.turnIndex = (room.turnIndex + 1) % 2;
  room.turnDeadline = Date.now() + TURN_MS;
  io.to(room.id).emit('turn:change', turnPayload(room, reason));
  scheduleTurnTimeout(room);
}

function tryMatch() {
  while (queue.length >= 2) {
    const a = queue.shift();
    const b = queue.shift();
    const pa = lobby.get(a);
    const pb = lobby.get(b);
    if (!pa || !pb) continue;

    const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const seed = Date.now();
    const room = {
      id: roomId,
      players: [
        { ...pa, faction: 'player', slot: 0 },
        { ...pb, faction: 'enemy1', slot: 1 },
      ],
      seed,
      turnIndex: 0,
      turnDeadline: 0,
      turnTimer: null,
    };
    rooms.set(roomId, room);
    const turnDeadline = startTurnClock(room);

    io.to(pa.socketId).emit('match:found', {
      roomId,
      seed,
      you: room.players[0],
      opponent: room.players[1],
      yourTurn: true,
      turnDeadline,
      turnLimitMs: TURN_MS,
    });
    io.to(pb.socketId).emit('match:found', {
      roomId,
      seed,
      you: room.players[1],
      opponent: room.players[0],
      yourTurn: false,
      turnDeadline,
      turnLimitMs: TURN_MS,
    });

    io.to(pa.socketId).emit('queue:status', { queued: false, matched: true });
    io.to(pb.socketId).emit('queue:status', { queued: false, matched: true });
  }
}

function playerForSocket(socketId) {
  return [...lobby.values()].find(p => p.socketId === socketId);
}

io.on('connection', (socket) => {
  socket.on('lobby:join', (user) => {
    if (!user?.id) {
      socket.emit('error', { msg: 'Invalid session — sign in with Google.' });
      return;
    }
    if (user.provider !== 'google') {
      socket.emit('error', { msg: 'Google sign-in required for online play.' });
      return;
    }

    const existing = lobby.get(user.id);
    if (existing?.socketId && existing.socketId !== socket.id) {
      const qi = queue.indexOf(user.id);
      if (qi >= 0) queue.splice(qi, 1);
    }

    lobby.set(user.id, { ...user, socketId: socket.id });
    socket.userId = user.id;
    socket.join('lobby');
    broadcastLobby();
    socket.emit('queue:status', queueStatusFor(user.id));
  });

  socket.on('queue:join', () => {
    const entry = playerForSocket(socket.id);
    if (!entry) {
      socket.emit('error', { msg: 'Join the lobby with Google first.' });
      return;
    }
    if (!queue.includes(entry.id)) queue.push(entry.id);
    const status = queueStatusFor(entry.id);
    socket.emit('queue:status', status);
    tryMatch();
    if (queue.length === 1) {
      socket.emit('queue:status', { ...status, waitingForOpponent: true });
    }
  });

  socket.on('queue:leave', () => {
    const entry = playerForSocket(socket.id);
    if (entry) {
      const i = queue.indexOf(entry.id);
      if (i >= 0) queue.splice(i, 1);
    }
    socket.emit('queue:status', { queued: false, waitingForOpponent: false });
  });

  socket.on('room:join', ({ roomId }) => {
    if (roomId) {
      socket.join(roomId);
      const room = rooms.get(roomId);
      if (room) {
        socket.emit('turn:sync', turnPayload(room, 'sync'));
      }
    }
  });

  socket.on('turn:end', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const entry = playerForSocket(socket.id);
    const active = room.players[room.turnIndex];
    if (!entry || entry.id !== active.id) return;
    advanceTurn(room, 'ended');
  });

  socket.on('disconnect', () => {
    const entry = [...lobby.entries()].find(([, v]) => v.socketId === socket.id);
    if (entry) {
      const [uid] = entry;
      lobby.delete(uid);
      const qi = queue.indexOf(uid);
      if (qi >= 0) queue.splice(qi, 1);
    }
    broadcastLobby();
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Realm Conquest online server → port ${PORT} (${TURN_MS / 1000}s turn limit)`);
});
