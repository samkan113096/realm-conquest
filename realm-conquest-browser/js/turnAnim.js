import { FACTIONS } from './units.js';
import { runAITurnSteps } from './ai.js';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export async function playEnemyTurnAnimation(gameState, ui, renderer, refreshView) {
  const overlay = document.getElementById('turn-overlay');
  const titleEl = document.getElementById('turn-overlay-title');
  const detailEl = document.getElementById('turn-overlay-detail');
  if (!overlay) {
    for (const _step of runAITurnSteps(gameState)) { /* apply */ }
    return;
  }

  overlay.classList.remove('hidden');
  ui.els.btnEndTurn.disabled = true;

  const steps = [...runAITurnSteps(gameState)];

  if (steps.length === 0) {
    titleEl.textContent = 'The enemy lords deliberate…';
    detailEl.textContent = 'No major moves this turn';
    await sleep(900);
  }

  let currentFaction = null;
  for (const step of steps) {
    if (step.faction !== currentFaction) {
      currentFaction = step.faction;
      const name = FACTIONS[step.faction]?.name || step.faction;
      titleEl.textContent = `${name} is acting…`;
      await sleep(500);
    }

    detailEl.textContent = step.message;
    if (step.territoryId != null) {
      renderer.pulseTerritoryId = step.territoryId;
      renderer.pulseKind = step.kind || 'action';
      refreshView();
      await sleep(step.kind === 'conquer' ? 900 : 650);
      renderer.pulseTerritoryId = null;
    } else {
      refreshView();
      await sleep(400);
    }
  }

  titleEl.textContent = 'Dawn breaks on Aldoria';
  detailEl.textContent = 'Your turn begins';
  await sleep(700);

  overlay.classList.add('hidden');
  renderer.pulseTerritoryId = null;
  ui.els.btnEndTurn.disabled = false;
}
