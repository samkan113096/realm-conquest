import { BUILDINGS, UNITS, FACTIONS } from './units.js';
import { getNeighbors, getArmyPower, countArmy, getTerrainDefense } from './map.js';

const MAX_AI_ATTACKS = 3;

function canAffordAI(gold, food, cost) {
  return gold >= (cost.gold || 0) && food >= (cost.food || 0);
}

function getFactionResources(map, factionId) {
  let gold = 60 + Math.floor(Math.random() * 30);
  let food = 30 + Math.floor(Math.random() * 20);
  const territories = map.territories.filter(t => t.owner === factionId);
  for (const t of territories) {
    gold += t.gold;
    food += t.food;
    for (const b of t.buildings) {
      if (BUILDINGS[b]?.goldPerTurn) gold += BUILDINGS[b].goldPerTurn;
      if (BUILDINGS[b]?.foodPerTurn) food += BUILDINGS[b].foodPerTurn;
    }
  }
  return { gold, food, territories };
}

function aiBuild(territory, resources) {
  const priorities = ['farm', 'barracks', 'market'];
  for (const key of priorities) {
    const building = BUILDINGS[key];
    if (territory.buildings.includes(key)) continue;
    if (canAffordAI(resources.gold, resources.food, building.cost)) {
      territory.buildings.push(key);
      resources.gold -= building.cost.gold || 0;
      resources.food -= building.cost.food || 0;
      return { ok: true, building: building.name };
    }
  }
  return { ok: false };
}

function aiRecruit(territory, resources) {
  if (!territory.buildings.includes('barracks')) return { ok: false };
  if (countArmy(territory) >= 8) return { ok: false };

  const unitKey = Math.random() > 0.4 ? 'warrior' : 'archer';
  const unit = UNITS[unitKey];
  if (!canAffordAI(resources.gold, resources.food, unit.cost)) return { ok: false };

  resources.gold -= unit.cost.gold || 0;
  resources.food -= unit.cost.food || 0;
  const existing = territory.units.find(u => u.type === unitKey);
  if (existing) existing.count++;
  else territory.units.push({ type: unitKey, count: 1 });
  return { ok: true, unit: unit.name };
}

function aiAttack(territory, map, factionId) {
  if (countArmy(territory) === 0) return { ok: false };

  const neighbors = getNeighbors(territory, map);
  const targets = neighbors.filter(n => n.owner !== factionId);
  if (targets.length === 0) return { ok: false };

  const target = targets.sort((a, b) => getArmyPower(a) - getArmyPower(b))[0];
  const atkPower = getArmyPower(territory) + Math.floor(Math.random() * 2);
  const defPower = getArmyPower(target) + getTerrainDefense(target) + Math.floor(Math.random() * 2);

  if (atkPower > defPower) {
    target.owner = factionId;
    target.units = territory.units.map(u => ({ ...u, count: Math.max(1, Math.floor(u.count / 2)) }));
    territory.units = territory.units.map(u => ({ ...u, count: Math.ceil(u.count / 2) }));
    return { ok: true, conquered: true, target, from: territory };
  }

  territory.units = territory.units.map(u => ({ ...u, count: Math.max(0, u.count - 1) }));
  territory.units = territory.units.filter(u => u.count > 0);
  return { ok: true, conquered: false, target, from: territory };
}

export function* runAITurnSteps(gameState) {
  const factions = gameState.mode === 'online' ? [] : ['enemy1', 'enemy2'];
  const factionLabel = (id) => FACTIONS[id]?.name || id;

  for (const factionId of factions) {
    const resources = getFactionResources(gameState.map, factionId);
    const territories = [...resources.territories];

    for (const territory of territories) {
      if (Math.random() > 0.6) {
        const built = aiBuild(territory, resources);
        if (built.ok) {
          yield {
            faction: factionId,
            kind: 'build',
            territoryId: territory.id,
            message: `${factionLabel(factionId)} built a ${built.building} in ${territory.name}`,
          };
        }
      }
      if (Math.random() > 0.5) {
        const recruited = aiRecruit(territory, resources);
        if (recruited.ok) {
          yield {
            faction: factionId,
            kind: 'recruit',
            territoryId: territory.id,
            message: `${factionLabel(factionId)} recruited ${recruited.unit}s in ${territory.name}`,
          };
        }
      }
    }

    const attackCandidates = territories.filter(t => countArmy(t) > 0);
    attackCandidates.sort(() => Math.random() - 0.5);

    for (const territory of attackCandidates.slice(0, MAX_AI_ATTACKS)) {
      const result = aiAttack(territory, gameState.map, factionId);
      if (!result.ok) continue;
      if (result.conquered) {
        yield {
          faction: factionId,
          kind: 'conquer',
          territoryId: result.target.id,
          message: `${factionLabel(factionId)} conquered ${result.target.name}!`,
        };
      } else {
        yield {
          faction: factionId,
          kind: 'attack-fail',
          territoryId: result.target.id,
          message: `${factionLabel(factionId)} failed to take ${result.target.name}`,
        };
      }
    }
  }
}

export function runAITurn(gameState) {
  const events = [];
  for (const step of runAITurnSteps(gameState)) {
    if (step.kind === 'conquer') events.push({ faction: step.faction, type: 'conquer' });
  }
  return events;
}
