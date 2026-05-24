import { FACTIONS, BUILDINGS, UNITS, getArmyCap } from './units.js';
import { countArmy, getArmyPower } from './map.js';

export class UI {
  constructor() {
    this.els = {
      splash: document.getElementById('splash'),
      gameContainer: document.getElementById('game-container'),
      btnStart: document.getElementById('btn-start'),
      resGold: document.querySelector('#res-gold span'),
      resFood: document.querySelector('#res-food span'),
      resArmy: document.querySelector('#res-army span'),
      resTurn: document.querySelector('#res-turn span'),
      territoryName: document.getElementById('territory-name'),
      territoryInfo: document.getElementById('territory-info'),
      actionPanel: document.getElementById('action-panel'),
      btnEndTurn: document.getElementById('btn-end-turn'),
      resAttacks: document.querySelector('#res-attacks span'),
      btnGuest: document.getElementById('btn-guest'),
      btnLogout: document.getElementById('btn-logout'),
      btnMultiplayer: document.getElementById('btn-multiplayer'),
      toastContainer: document.getElementById('toast-container'),
      modalOverlay: document.getElementById('modal-overlay'),
      modalTitle: document.getElementById('modal-title'),
      modalBody: document.getElementById('modal-body'),
      modalBtn: document.getElementById('modal-btn'),
    };
  }

  showGame() {
    this.els.splash.classList.add('hidden');
    document.getElementById('lobby-overlay')?.classList.add('hidden');
    this.els.gameContainer.classList.remove('hidden');
  }

  showSplash() {
    this.els.gameContainer.classList.add('hidden');
    document.getElementById('lobby-overlay')?.classList.add('hidden');
    this.els.splash.classList.remove('hidden');
    import('./auth.js').then(m => m.setupGoogleButton());
  }

  showLobby(user) {
    this.els.splash.classList.add('hidden');
    this.els.gameContainer.classList.add('hidden');
    document.getElementById('lobby-overlay')?.classList.remove('hidden');
    document.getElementById('lobby-user').textContent = `Signed in as ${user.name}`;
    document.getElementById('lobby-status').textContent = 'Connecting…';
  }

  hideLobby() {
    document.getElementById('lobby-overlay')?.classList.add('hidden');
  }

  updateModeBanner(gameState) {
    const el = document.getElementById('mode-banner');
    if (!el || !gameState) return;
    if (gameState.mode === 'solo') {
      el.textContent = 'Solo · vs Computer';
      el.className = 'mode-banner mode-banner--solo';
    } else {
      const turn = gameState.isMyTurn ? 'Your turn' : 'Opponent\'s turn';
      el.textContent = `Online vs ${gameState.opponentName || '…'} · ${turn}`;
      el.className = 'mode-banner mode-banner--online';
    }
    if (this.els.btnEndTurn) {
      this.els.btnEndTurn.disabled = gameState.mode === 'online' && !gameState.isMyTurn;
    }
  }

  updateResources(gameState) {
    this.els.resGold.textContent = gameState.playerGold;
    this.els.resFood.textContent = gameState.playerFood;
    this.els.resArmy.textContent = gameState.playerArmy;
    this.els.resTurn.textContent = gameState.turn;
    if (this.els.resAttacks) {
      this.els.resAttacks.textContent = gameState.attacksRemaining();
    }
  }

  updateAuthBar(user) {
    const bar = document.getElementById('auth-bar');
    const splashAuth = document.getElementById('splash-auth');
    if (!bar && !splashAuth) return;

    const name = user?.name || 'Guest';
    const img = user?.picture;
    const provider = user?.provider === 'google' ? 'Google · Online' : 'Guest · vs AI';

    if (bar) {
      bar.innerHTML = user ? `
        ${img ? `<img class="auth-avatar" src="${img}" alt="">` : '<span class="auth-avatar auth-avatar--guest">👑</span>'}
        <span class="auth-name">${name}</span>
        <span class="auth-badge">${provider}</span>
        <button id="btn-logout" class="btn-auth-sm" type="button">Sign out</button>
      ` : '';
      bar.querySelector('#btn-logout')?.addEventListener('click', () => {
        import('./auth.js').then(m => { m.logout(); this.updateAuthBar(null); });
      });
    }

    if (splashAuth) {
      splashAuth.innerHTML = '';
    }
  }

  updateTerritoryPanel(territory, gameState) {
    if (!territory) {
      this.els.territoryName.textContent = 'Select a territory';
      this.els.territoryInfo.innerHTML = '<p>Click a hex on the map to inspect it.</p>';
      this.els.actionPanel.classList.add('hidden');
      return;
    }

    const faction = FACTIONS[territory.owner];
    const isPlayer = territory.owner === gameState.localFaction;
    this.els.territoryName.textContent = territory.name;

    const buildings = territory.buildings.map(b => BUILDINGS[b]?.name || b).join(', ') || 'None';
    const units = territory.units.map(u => `${UNITS[u.type]?.name || u.type} x${u.count}`).join(', ') || 'None';

    this.els.territoryInfo.innerHTML = `
      <div class="stat"><span>Owner</span><span style="color:${faction.color}">${faction.name}</span></div>
      <div class="stat"><span>Terrain</span><span>${territory.terrain}</span></div>
      <div class="stat"><span>Army Power</span><span>${getArmyPower(territory)}</span></div>
      <div class="stat"><span>Buildings</span><span>${buildings}</span></div>
      <div class="stat"><span>Units</span><span>${units}</span></div>
    `;

    if (isPlayer) {
      this.els.actionPanel.classList.remove('hidden');
      this.updateActionButtons(gameState, territory);
    } else {
      this.els.actionPanel.classList.add('hidden');
    }
  }

  updateActionButtons(gameState, territory) {
    const canAct = gameState.isMyTurn !== false;
    document.querySelectorAll('.btn-action').forEach(btn => {
      const action = btn.dataset.action;
      btn.disabled = !canAct;

      if (action.startsWith('build-')) {
        const key = action.replace('build-', '');
        if (territory.buildings.includes(key)) btn.disabled = true;
        const cost = BUILDINGS[key]?.cost;
        if (cost && !gameState.canAfford(cost)) btn.disabled = true;
      }

      if (action.startsWith('recruit-')) {
        if (!territory.buildings.includes('barracks')) btn.disabled = true;
        const key = action.replace('recruit-', '');
        const cost = UNITS[key]?.cost;
        if (cost && !gameState.canAfford(cost)) btn.disabled = true;
        if (countArmy(territory) >= getArmyCap(territory)) btn.disabled = true;
      }

      if (action === 'attack') {
        if (countArmy(territory) === 0) btn.disabled = true;
        if (gameState.attacksRemaining() === 0) btn.disabled = true;
      }

      if (action === 'move-army') {
        if (countArmy(territory) === 0) btn.disabled = true;
      }

      if (action === 'cancel-action') {
        btn.classList.toggle('hidden', !gameState.moveMode && !gameState.attackMode);
      }
    });

    const cancelBtn = document.querySelector('[data-action="cancel-action"]');
    if (cancelBtn) {
      cancelBtn.classList.toggle('hidden', !gameState.moveMode && !gameState.attackMode);
    }
  }

  updateTargetChooser(gameState) {
    const el = document.getElementById('target-chooser');
    if (!el) return;

    if (gameState.moveMode) {
      const targets = gameState.getMoveTargets();
      el.classList.remove('hidden');
      el.innerHTML = `
        <p class="target-chooser-label">Move army to:</p>
        ${targets.map(t => `
          <button type="button" class="target-btn target-btn--move" data-target-id="${t.id}">
            ↔ ${t.name} <span class="target-meta">(${countArmy(t)} troops)</span>
          </button>
        `).join('')}
      `;
      return;
    }

    if (gameState.attackMode) {
      const targets = gameState.getAttackTargets();
      el.classList.remove('hidden');
      el.innerHTML = `
        <p class="target-chooser-label">Attack target:</p>
        ${targets.map(t => {
          const owner = FACTIONS[t.owner]?.name || t.owner;
          return `
            <button type="button" class="target-btn target-btn--attack" data-target-id="${t.id}">
              ⚔ ${t.name} <span class="target-meta">${owner} · power ${getArmyPower(t)}</span>
            </button>
          `;
        }).join('')}
      `;
      return;
    }

    el.classList.add('hidden');
    el.innerHTML = '';
  }

  toast(message, type = 'info') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    this.els.toastContainer.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  showModal(title, body, onClose) {
    this.els.modalTitle.textContent = title;
    this.els.modalBody.textContent = body;
    this.els.modalOverlay.classList.remove('hidden');
    this.els.modalBtn.onclick = () => {
      this.els.modalOverlay.classList.add('hidden');
      onClose?.();
    };
  }
}
