import { GAME } from '../constants';
import { createBullet } from './Bullet';

let nextId = 1;

export function createPlayer(x, y) {
  return {
    id: nextId++,
    x,
    y,
    hp: GAME.PLAYER_HP,
    maxHp: GAME.PLAYER_HP,
    radius: 20,
    facing: 1,
    fireCooldown: 0,
    bombCooldown: 0,
    invincible: false,
    combo: 0,
    comboTimer: 0,
    lastMoveAngle: -Math.PI / 2,
    aimAngle: -Math.PI / 2,
    vx: 0,
    vy: 0,
  };
}

export function findNearestEnemy(player, enemies, maxRange = GAME.AIM_RANGE) {
  let nearest = null;
  let bestDist = Infinity;
  for (const e of enemies) {
    if (!e.alive) continue;
    const d = Math.hypot(e.x - player.x, e.y - player.y);
    if (d < bestDist && d <= maxRange) {
      bestDist = d;
      nearest = e;
    }
  }
  return nearest;
}

export function updatePlayer(player, input, dt) {
  player.invincible = player.invincibleUntil && Date.now() < player.invincibleUntil;

  player.vx = input.x * GAME.PLAYER_SPEED;
  player.vy = input.y * GAME.PLAYER_SPEED;

  if (input.x !== 0 || input.y !== 0) {
    player.lastMoveAngle = Math.atan2(input.y, input.x);
    if (input.x !== 0) player.facing = input.x > 0 ? 1 : -1;
  }

  player.x = Math.max(player.radius, Math.min(GAME.ARENA_WIDTH - player.radius, player.x + player.vx));
  player.y = Math.max(player.radius, Math.min(GAME.ARENA_HEIGHT - player.radius, player.y + player.vy));

  if (player.fireCooldown > 0) player.fireCooldown -= dt;
  if (player.bombCooldown > 0) player.bombCooldown -= dt;
  if (player.comboTimer > 0) {
    player.comboTimer -= dt;
    if (player.comboTimer <= 0) player.combo = 0;
  }
}

export function playerShoot(player, enemies = []) {
  if (player.fireCooldown > 0) return null;
  player.fireCooldown = GAME.FIRE_COOLDOWN;

  const nearest = findNearestEnemy(player, enemies);
  let targetX;
  let targetY;

  if (nearest) {
    targetX = nearest.x;
    targetY = nearest.y;
    player.aimAngle = Math.atan2(targetY - player.y, targetX - player.x);
    player.facing = targetX >= player.x ? 1 : -1;
  } else {
    player.aimAngle = player.lastMoveAngle;
    targetX = player.x + Math.cos(player.aimAngle) * 300;
    targetY = player.y + Math.sin(player.aimAngle) * 300;
  }

  const spawnX = player.x + Math.cos(player.aimAngle) * 22;
  const spawnY = player.y + Math.sin(player.aimAngle) * 22;
  const damage = GAME.BULLET_DAMAGE * (1 + player.combo * GAME.COMBO_MULTIPLIER);

  return createBullet(spawnX, spawnY, targetX, targetY, damage);
}

export function playerBomb(player) {
  if (player.bombCooldown > 0) return null;
  player.bombCooldown = GAME.BOMB_COOLDOWN;
  return {
    x: player.x,
    y: player.y,
    radius: GAME.BOMB_RADIUS,
    damage: GAME.BOMB_DAMAGE,
  };
}

export function damagePlayer(player, amount) {
  if (player.invincible) return false;
  player.hp -= amount;
  player.invincibleUntil = Date.now() + 450;
  player.combo = 0;
  return true;
}
