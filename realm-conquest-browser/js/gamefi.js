/**
 * GameFi integration — submit scores for REALM token rewards on Optimism.
 * Requires GameFi signer server running (gamefi/server/signer.js).
 */

const GAMEFI_SIGNER = 'http://localhost:3001';
const GAMEFI_DAPP = 'http://localhost:5173';
const GAME_ID = 0; // Realm Conquest

export function trackGameResult(gameState) {
  if (gameState.winner !== 'player') return null;
  const score = gameState.playerTerritories * 100 + gameState.turn * 50 + gameState.playerGold;
  localStorage.setItem('realm_last_score', JSON.stringify({ gameId: GAME_ID, score, at: Date.now() }));
  return score;
}

export function showGameFiPrompt(score) {
  const banner = document.createElement('div');
  banner.className = 'gamefi-banner';
  banner.innerHTML = `
    <p>🏆 Victory! Score: <strong>${score}</strong></p>
    <p>Claim <strong>REALM</strong> tokens on Optimism</p>
    <a href="${GAMEFI_DAPP}" target="_blank" class="btn-primary">Open GameFi Dashboard →</a>
    <button id="gamefi-dismiss" class="btn-action">Dismiss</button>
  `;
  banner.style.cssText = `
    position:fixed;bottom:80px;right:20px;background:#141425;border:1px solid #00ffc8;
    border-radius:12px;padding:1.25rem;z-index:300;max-width:280px;text-align:center;
  `;
  document.body.appendChild(banner);
  document.getElementById('gamefi-dismiss')?.addEventListener('click', () => banner.remove());
}

export async function requestClaimSignature(playerAddress, score) {
  const res = await fetch(`${GAMEFI_SIGNER}/sign-claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player: playerAddress, gameId: GAME_ID, score, nonce: Date.now() }),
  });
  return res.json();
}
