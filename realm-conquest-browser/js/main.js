import { generateMap, getNeighbors, countArmy } from './map.js';
import { GameState } from './game.js';
import { Renderer } from './renderer.js';
import { UI } from './ui.js';
import { playEnemyTurnAnimation } from './turnAnim.js';
import {
  initAuth, loginAsGuest, getCurrentUser, logout, isGoogleUser, googleSetupMessage, setupGoogleButton,
} from './auth.js';
import {
  connectOnline, joinMatchQueue, leaveMatchQueue, disconnectOnline,
  emitTurnEnd, joinRoom, isOnlineConnected,
} from './online.js';

let gameState;
let renderer;
let turnBusy = false;
const ui = new UI();

function refreshView() {
  if (!gameState) return;
  ui.updateResources(gameState);
  ui.updateTerritoryPanel(gameState.selectedTerritory, gameState);
  ui.updateTargetChooser(gameState);
  ui.updateModeBanner(gameState);
  renderer.render(gameState.map, gameState.selectedTerritory, getRenderHints());
}

function getRenderHints() {
  if (!gameState) return {};
  const hints = { moveTargets: [], attackTargets: [], moveSource: null };

  if (gameState.moveMode && gameState.moveSource) {
    hints.moveSource = gameState.moveSource;
    hints.moveTargets = gameState.getMoveTargets();
  } else if (gameState.attackMode && gameState.selectedTerritory) {
    hints.attackTargets = gameState.getAttackTargets();
  }

  return hints;
}

function init() {
  const canvas = document.getElementById('game-canvas');
  renderer = new Renderer(canvas);

  document.getElementById('btn-solo')?.addEventListener('click', startSoloGame);
  document.getElementById('btn-online-lobby')?.addEventListener('click', openOnlineLobby);
  document.getElementById('btn-find-match')?.addEventListener('click', findMatch);
  document.getElementById('btn-lobby-back')?.addEventListener('click', () => {
    leaveMatchQueue();
    disconnectOnline();
    ui.showSplash();
  });
  document.getElementById('btn-main-menu')?.addEventListener('click', goMainMenu);
  ui.els.btnEndTurn.addEventListener('click', endTurn);

  document.getElementById('btn-tutorial')?.addEventListener('click', showTutorial);
  document.getElementById('tutorial-close')?.addEventListener('click', hideTutorial);
  document.getElementById('btn-help')?.addEventListener('click', showTutorial);

  initAuth((user) => {
    if (user?.setupRequired) {
      ui.toast(googleSetupMessage(), 'error');
      return;
    }
    ui.updateAuthBar(user);
    const lobbyBtn = document.getElementById('btn-online-lobby');
    if (lobbyBtn) lobbyBtn.disabled = !isGoogleUser();
  });

  canvas.addEventListener('click', onMapClick);
  canvas.addEventListener('mousemove', (e) => {
    if (!gameState) return;
    const territory = renderer.getTerritoryAt(gameState.map, e.clientX, e.clientY);
    renderer.hoverId = territory?.id ?? null;
    renderer.render(gameState.map, gameState.selectedTerritory, getRenderHints());
  });

  document.querySelectorAll('.btn-action').forEach(btn => {
    btn.addEventListener('click', () => handleAction(btn.dataset.action));
  });

  document.getElementById('target-chooser')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-target-id]');
    if (!btn || !gameState || turnBusy) return;
    const id = Number(btn.dataset.targetId);
    const territory = gameState.map.territories.find(t => t.id === id);
    if (!territory) return;
    if (gameState.moveMode) {
      const result = gameState.moveArmy(territory);
      ui.toast(result.msg, result.ok ? 'success' : 'error');
      refreshView();
    } else if (gameState.attackMode) {
      const result = gameState.attack(territory);
      ui.toast(result.msg, result.ok ? 'success' : 'error');
      if (result.ok) gameState.selectTerritory(gameState.selectedTerritory);
      refreshView();
    }
  });
}

function goMainMenu() {
  if (gameState && !gameState.gameOver && !confirm('Return to main menu? Unsaved progress will be lost.')) return;
  disconnectOnline();
  gameState = null;
  turnBusy = false;
  ui.showSplash();
}

function setLobbyFindMatchEnabled(enabled) {
  const btn = document.getElementById('btn-find-match');
  if (btn) btn.disabled = !enabled;
}

function openOnlineLobby() {
  if (!isGoogleUser()) {
    ui.toast('Online play requires Google sign-in.', 'error');
    setupGoogleButton();
    return;
  }
  ui.showLobby(getCurrentUser());
  setLobbyFindMatchEnabled(false);

  connectOnline({
    onConnected: () => {
      setLobbyFindMatchEnabled(true);
      document.getElementById('lobby-status').textContent = 'Connected — click Find Match';
    },
    onDisconnected: () => {
      setLobbyFindMatchEnabled(false);
      document.getElementById('lobby-status').textContent = 'Disconnected — reconnecting…';
    },
    onLobbyUpdate: (data) => {
      document.getElementById('lobby-count').textContent = data.count;
      const list = document.getElementById('lobby-players');
      list.innerHTML = (data.players || []).map(p =>
        `<li>${p.picture ? `<img src="${p.picture}" alt="">` : '👤'} ${p.name}</li>`
      ).join('');
    },
    onQueueStatus: (data) => {
      const status = document.getElementById('lobby-status');
      if (data.matched) return;
      if (data.queued) {
        status.textContent = data.waitingForOpponent
          ? 'Waiting for another lord to join the queue…'
          : `Searching… (queue #${data.position})`;
      } else {
        status.textContent = isOnlineConnected()
          ? 'Connected — click Find Match'
          : 'Connecting…';
      }
    },
    onMatchFound: (data) => {
      leaveMatchQueue();
      ui.hideLobby();
      startOnlineGame(data);
    },
    onTurnChange: (data) => {
      if (!gameState) return;
      const me = getCurrentUser()?.id;
      gameState.isMyTurn = data.activePlayerId === me;
      ui.updateModeBanner(gameState);
      if (gameState.isMyTurn) ui.toast('Your turn!', 'info');
      else ui.toast('Opponent is playing…', 'info');
    },
    onError: (msg) => {
      document.getElementById('lobby-status').textContent = msg;
      ui.toast(msg, 'error');
    },
  });
}

function findMatch() {
  if (!isOnlineConnected()) {
    ui.toast('Still connecting to the realm server…', 'info');
    openOnlineLobby();
    return;
  }
  if (!joinMatchQueue()) {
    ui.toast('Could not join match queue.', 'error');
  } else {
    document.getElementById('lobby-status').textContent = 'Waiting for another lord to join the queue…';
  }
}

function onMapClick(e) {
  if (!gameState || !gameState.isMyTurn || turnBusy) {
    if (gameState?.mode === 'online' && !gameState.isMyTurn) ui.toast('Wait for your opponent\'s turn', 'info');
    return;
  }
  const territory = renderer.getTerritoryAt(gameState.map, e.clientX, e.clientY);
  if (!territory) return;

  if (gameState.moveMode && gameState.moveSource) {
    const valid = gameState.getMoveTargets().some(t => t.id === territory.id);
    if (!valid) {
      ui.toast('Pick a highlighted friendly hex to move into', 'info');
      return;
    }
    const result = gameState.moveArmy(territory);
    ui.toast(result.msg, result.ok ? 'success' : 'error');
    refreshView();
    return;
  }

  if (gameState.attackMode) {
    const valid = gameState.getAttackTargets().some(t => t.id === territory.id);
    if (!valid) {
      ui.toast('Pick a highlighted enemy hex to attack', 'info');
      return;
    }
    const result = gameState.attack(territory);
    ui.toast(result.msg, result.ok ? 'success' : 'error');
    refreshView();
    return;
  }

  gameState.cancelActionMode();
  gameState.selectTerritory(territory);
  refreshView();
}

function showTutorial() {
  document.getElementById('tutorial-overlay')?.classList.remove('hidden');
}

function hideTutorial() {
  document.getElementById('tutorial-overlay')?.classList.add('hidden');
}

function startSoloGame() {
  logout();
  loginAsGuest();
  ui.updateAuthBar(getCurrentUser());
  const map = generateMap();
  gameState = new GameState(map);
  gameState.mode = 'solo';
  gameState.localFaction = 'player';
  gameState.isMyTurn = true;
  gameState.selectTerritory(map.territories.find(t => t.owner === 'player'));
  ui.showGame();
  refreshView();
  ui.toast('Solo Campaign — you vs computer lords (Red Legion & Shadow Court)', 'info');
}

function startOnlineGame(match) {
  const map = generateMap(match.seed, { twoPlayer: true });
  gameState = new GameState(map);
  gameState.mode = 'online';
  gameState.localFaction = match.you.faction;
  gameState.isMyTurn = match.yourTurn;
  gameState.opponentName = match.opponent.name;
  gameState.onlineRoom = match.roomId;
  joinRoom(match.roomId);

  const start = map.territories.find(t => t.owner === match.you.faction);
  gameState.selectTerritory(start);
  ui.showGame();
  refreshView();
  ui.toast(`Matched vs ${match.opponent.name}! ${match.yourTurn ? 'You move first.' : 'Opponent moves first.'}`, 'success');
}

function handleAction(action) {
  if (!gameState || gameState.gameOver || !gameState.isMyTurn || turnBusy) return;

  let result;
  if (action.startsWith('build-')) {
    gameState.cancelActionMode();
    result = gameState.build(action);
  } else if (action.startsWith('recruit-')) {
    gameState.cancelActionMode();
    result = gameState.recruit(action);
  } else if (action === 'move-army') {
    result = gameState.startMoveMode();
  } else if (action === 'attack') {
    result = gameState.startAttackMode();
  } else if (action === 'cancel-action') {
    gameState.cancelActionMode();
    result = { ok: true, msg: 'Cancelled' };
  }

  if (result) {
    ui.toast(result.msg, result.ok ? 'success' : 'error');
    refreshView();
  }
}

async function endTurn() {
  if (!gameState || gameState.gameOver || !gameState.isMyTurn || turnBusy) return;

  turnBusy = true;
  ui.els.btnEndTurn.disabled = true;

  gameState.endTurn((state) => {
    if (state.mode === 'online') {
      emitTurnEnd(state.onlineRoom);
      state.isMyTurn = false;
    }
  });

  refreshView();

  if (gameState.mode === 'solo') {
    await playEnemyTurnAnimation(gameState, ui, renderer, refreshView);
  }

  turnBusy = false;
  ui.els.btnEndTurn.disabled = false;
  refreshView();

  if (gameState.starving) ui.toast('Starvation! Build more farms.', 'error');

  if (gameState.gameOver) {
    const won = gameState.winner === gameState.localFaction;
    ui.showModal(
      won ? 'Victory!' : 'Defeat',
      won ? `You rule Aldoria in ${gameState.turn} turns!` : 'Your house has fallen.',
      () => goMainMenu(),
    );
  }
}

init();

setInterval(() => {
  const btn = document.getElementById('btn-online-lobby');
  if (btn) btn.disabled = !isGoogleUser();
}, 1000);
