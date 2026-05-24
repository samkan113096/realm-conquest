import { BUILDINGS, UNITS, getBuilding, getUnit, getArmyCap } from './units.js';
import { getNeighbors, getArmyPower, countArmy, getTerrainDefense } from './map.js';
import { CONFIG } from './config.js';

export const MAX_ATTACKS_PER_TURN = CONFIG.MAX_ATTACKS_PER_TURN;

function mergeUnitsInto(target, unitsToAdd) {
  for (const u of unitsToAdd) {
    if (u.count <= 0) continue;
    const existing = target.units.find(x => x.type === u.type);
    if (existing) existing.count += u.count;
    else target.units.push({ type: u.type, count: u.count });
  }
}

function territoryArmyCap(territory) {
  const cap = getArmyCap(territory);
  return cap > 0 ? cap : 12;
}

export class GameState {
  constructor(map) {
    this.map = map;
    this.turn = 1;
    this.selectedTerritory = null;
    this.playerGold = 80;
    this.playerFood = 40;
    this.gameOver = false;
    this.winner = null;
    this.playerTerritories = 1;
    this.totalTerritories = map.territories.length;
    this.attacksThisTurn = 0;
    this.moveMode = false;
    this.moveSource = null;
    this.attackMode = false;
    this.mode = 'solo';
    this.localFaction = 'player';
    this.isMyTurn = true;
    this.opponentName = null;
    this.onlineRoom = null;
  }

  isMine(territory) {
    return territory?.owner === this.localFaction;
  }

  get playerArmy() {
    return this.map.territories
      .filter(t => t.owner === this.localFaction)
      .reduce((sum, t) => sum + countArmy(t), 0);
  }

  selectTerritory(territory) {
    this.selectedTerritory = territory;
  }

  canAfford(cost) {
    return this.playerGold >= (cost.gold || 0) && this.playerFood >= (cost.food || 0);
  }

  spend(cost) {
    this.playerGold -= cost.gold || 0;
    this.playerFood -= cost.food || 0;
  }

  build(action) {
    const territory = this.selectedTerritory;
    if (!territory || !this.isMine(territory)) return { ok: false, msg: 'Select your territory' };

    const buildingKey = { 'build-farm': 'farm', 'build-barracks': 'barracks', 'build-market': 'market' }[action];
    const building = BUILDINGS[buildingKey];
    if (!building) return { ok: false, msg: 'Unknown building' };
    if (territory.buildings.includes(buildingKey)) return { ok: false, msg: 'Already built here' };
    if (!this.canAfford(building.cost)) return { ok: false, msg: 'Not enough resources' };

    this.spend(building.cost);
    territory.buildings.push(buildingKey);
    return { ok: true, msg: `Built ${building.name}!` };
  }

  recruit(action) {
    const territory = this.selectedTerritory;
    if (!territory || !this.isMine(territory)) return { ok: false, msg: 'Select your territory' };
    if (!territory.buildings.includes('barracks')) return { ok: false, msg: 'Need barracks first' };

    const unitKey = { 'recruit-warrior': 'warrior', 'recruit-archer': 'archer' }[action];
    const unit = UNITS[unitKey];
    if (!unit) return { ok: false, msg: 'Unknown unit' };
    if (!this.canAfford(unit.cost)) return { ok: false, msg: 'Not enough resources' };

    const cap = getArmyCap(territory);
    if (countArmy(territory) >= cap) return { ok: false, msg: 'Army at capacity' };

    this.spend(unit.cost);
    const existing = territory.units.find(u => u.type === unitKey);
    if (existing) existing.count++;
    else territory.units.push({ type: unitKey, count: 1 });

    return { ok: true, msg: `Recruited ${unit.name}!` };
  }

  attacksRemaining() {
    return Math.max(0, MAX_ATTACKS_PER_TURN - this.attacksThisTurn);
  }

  cancelMoveMode() {
    this.moveMode = false;
    this.moveSource = null;
  }

  cancelAttackMode() {
    this.attackMode = false;
  }

  cancelActionMode() {
    this.cancelMoveMode();
    this.cancelAttackMode();
  }

  startMoveMode() {
    const from = this.selectedTerritory;
    if (!from || !this.isMine(from)) return { ok: false, msg: 'Select your territory' };
    if (countArmy(from) === 0) return { ok: false, msg: 'No army to move' };

    const neighbors = getNeighbors(from, this.map);
    const friendly = neighbors.filter(n => this.isMine(n) && n.id !== from.id);
    if (friendly.length === 0) return { ok: false, msg: 'No adjacent friendly territory' };

    this.cancelAttackMode();
    this.moveMode = true;
    this.moveSource = from;
    return { ok: true, msg: 'Choose a highlighted hex (map or list) to move your army' };
  }

  startAttackMode() {
    const from = this.selectedTerritory;
    if (!from || !this.isMine(from)) return { ok: false, msg: 'Select your territory' };
    if (countArmy(from) === 0) return { ok: false, msg: 'No army to attack with' };
    if (this.attacksThisTurn >= MAX_ATTACKS_PER_TURN) {
      return { ok: false, msg: `Only ${MAX_ATTACKS_PER_TURN} attacks per turn` };
    }

    const neighbors = getNeighbors(from, this.map);
    const targets = neighbors.filter(n => !this.isMine(n));
    if (targets.length === 0) return { ok: false, msg: 'No adjacent targets' };

    this.cancelMoveMode();
    this.attackMode = true;
    return { ok: true, msg: 'Choose a highlighted hex (map or list) to attack' };
  }

  getMoveTargets() {
    const from = this.moveSource || this.selectedTerritory;
    if (!from || !this.isMine(from)) return [];
    return getNeighbors(from, this.map).filter(n => this.isMine(n) && n.id !== from.id);
  }

  getAttackTargets() {
    const from = this.selectedTerritory;
    if (!from || !this.isMine(from)) return [];
    return getNeighbors(from, this.map).filter(n => !this.isMine(n));
  }

  moveArmy(toTerritory) {
    const from = this.moveSource || this.selectedTerritory;
    if (!from || !this.isMine(from)) return { ok: false, msg: 'Select your territory' };
    if (!toTerritory || !this.isMine(toTerritory) || toTerritory.id === from.id) {
      return { ok: false, msg: 'Select a friendly adjacent territory' };
    }

    const neighbors = getNeighbors(from, this.map);
    if (!neighbors.some(n => n.id === toTerritory.id)) {
      return { ok: false, msg: 'Territories must be adjacent' };
    }
    if (countArmy(from) === 0) return { ok: false, msg: 'No army to move' };

    const cap = territoryArmyCap(toTerritory);
    const space = cap - countArmy(toTerritory);
    if (space <= 0) return { ok: false, msg: `${toTerritory.name} is at army capacity` };

    const moving = from.units.map(u => ({ ...u }));
    let totalMove = Math.min(countArmy(from), space);

    from.units = [];
    let left = totalMove;
    const transferred = [];
    for (const u of moving) {
      if (left <= 0) {
        from.units.push({ ...u });
        continue;
      }
      const take = Math.min(u.count, left);
      if (take > 0) transferred.push({ type: u.type, count: take });
      const remain = u.count - take;
      if (remain > 0) from.units.push({ type: u.type, count: remain });
      left -= take;
    }

    mergeUnitsInto(toTerritory, transferred);
    this.cancelMoveMode();
    this.selectTerritory(toTerritory);
    return { ok: true, msg: `Moved ${totalMove} soldiers to ${toTerritory.name}` };
  }

  attack(targetTerritory = null) {
    if (this.attacksThisTurn >= MAX_ATTACKS_PER_TURN) {
      return { ok: false, msg: `Only ${MAX_ATTACKS_PER_TURN} attacks per turn` };
    }

    const from = this.selectedTerritory;
    if (!from || !this.isMine(from)) return { ok: false, msg: 'Select your territory' };
    if (countArmy(from) === 0) return { ok: false, msg: 'No army to attack with' };

    const neighbors = getNeighbors(from, this.map);
    const targets = neighbors.filter(n => !this.isMine(n));
    if (targets.length === 0) return { ok: false, msg: 'No adjacent targets' };

    let target = targetTerritory;
    if (target && !targets.some(t => t.id === target.id)) {
      return { ok: false, msg: 'Target must be adjacent' };
    }
    if (!target) {
      return { ok: false, msg: 'Select an adjacent enemy hex to attack' };
    }

    this.cancelAttackMode();
    this.attacksThisTurn++;

    const atkPower = getArmyPower(from) + Math.floor(Math.random() * 3);
    const defPower = getArmyPower(target) + getTerrainDefense(target) + Math.floor(Math.random() * 3);

    if (atkPower > defPower) {
      const prevOwner = target.owner;
      target.owner = this.localFaction;
      target.units = from.units.map(u => ({ ...u, count: Math.max(1, Math.floor(u.count / 2)) }));
      from.units = from.units.map(u => ({ ...u, count: Math.ceil(u.count / 2) }));

      if (prevOwner !== 'neutral') {
        this.playerGold += 25;
      } else {
        this.playerGold += target.gold;
        this.playerFood += target.food;
      }

      this.playerTerritories = this.map.territories.filter(t => t.owner === this.localFaction).length;
      this.checkWin();
      return { ok: true, msg: `Conquered ${target.name}! (${this.attacksRemaining()} attacks left)`, conquered: target };
    }

    from.units = from.units.map(u => ({ ...u, count: Math.max(0, u.count - 1) }));
    from.units = from.units.filter(u => u.count > 0);
    return { ok: false, msg: `Attack on ${target.name} failed! (${this.attacksRemaining()} left)`, failed: true };
  }

  processTurnIncome() {
    for (const t of this.map.territories.filter(t => t.owner === this.localFaction)) {
      for (const b of t.buildings) {
        const building = BUILDINGS[b];
        if (building?.goldPerTurn) this.playerGold += building.goldPerTurn;
        if (building?.foodPerTurn) this.playerFood += building.foodPerTurn;
      }
    }
    this.playerFood -= this.playerArmy * 2;
    if (this.playerFood < 0) {
      this.playerFood = 0;
      this.starving = true;
      this._applyStarvation();
    } else {
      this.starving = false;
    }
  }

  _applyStarvation() {
    const owned = this.map.territories.filter(t => t.owner === this.localFaction && countArmy(t) > 0);
    if (owned.length === 0) return;
    const t = owned[Math.floor(Math.random() * owned.length)];
    const u = t.units.find(u => u.count > 0);
    if (u) {
      u.count--;
      if (u.count === 0) t.units = t.units.filter(x => x.count > 0);
    }
  }

  endTurn(aiCallback) {
    this.attacksThisTurn = 0;
    this.cancelActionMode();
    this.processTurnIncome();
    if (aiCallback) aiCallback(this);
    this.turn++;
    this.checkWin();
    this.checkLose();
    return this;
  }

  checkWin() {
    const playerCount = this.map.territories.filter(t => t.owner === this.localFaction).length;
    this.playerTerritories = playerCount;
    if (playerCount >= this.totalTerritories * 0.7) {
      this.gameOver = true;
      this.winner = this.localFaction;
    }
  }

  checkLose() {
    const playerCount = this.map.territories.filter(t => t.owner === this.localFaction).length;
    if (playerCount === 0) {
      this.gameOver = true;
      this.winner = 'enemy';
    }
    if (this.mode === 'solo' && this.turn > 30 && playerCount < 3) {
      this.gameOver = true;
      this.winner = 'enemy';
    }
  }
}

export { getBuilding, getUnit, BUILDINGS, UNITS };
