import { ENEMY_TYPES, BOSS, GAME } from '../constants';
import { BOSSES } from '../story/chapters';

let nextId = 100;

export function createEnemy(type, x, y) {
  const def = ENEMY_TYPES[type];
  return {
    id: nextId++,
    type,
    x,
    y,
    hp: def.hp,
    maxHp: def.hp,
    speed: def.speed,
    damage: def.damage,
    radius: def.radius,
    color: def.color,
    score: def.score,
    attackCooldown: 0,
    hitFlash: 0,
    alive: true,
    isBoss: false,
  };
}

export function createBoss(x, y, floor) {
  const bossDef = BOSSES[floor] || { name: 'Syndicate Boss', title: 'Enforcer' };
  return {
    id: nextId++,
    type: 'boss',
    name: bossDef.name,
    title: bossDef.title,
    x,
    y,
    hp: BOSS.hp + floor * 50,
    maxHp: BOSS.hp + floor * 50,
    speed: BOSS.speed,
    damage: BOSS.damage,
    radius: BOSS.radius,
    color: BOSS.color,
    score: BOSS.score,
    attackCooldown: 0,
    hitFlash: 0,
    alive: true,
    isBoss: true,
    phase: 0,
  };
}

export function updateEnemy(enemy, playerX, playerY, dt) {
  if (!enemy.alive) return;

  const dx = playerX - enemy.x;
  const dy = playerY - enemy.y;
  const dist = Math.hypot(dx, dy) || 1;

  if (dist > enemy.radius + 25) {
    enemy.x += (dx / dist) * enemy.speed;
    enemy.y += (dy / dist) * enemy.speed;
  }

  enemy.x = Math.max(enemy.radius, Math.min(GAME.ARENA_WIDTH - enemy.radius, enemy.x));
  enemy.y = Math.max(enemy.radius, Math.min(GAME.ARENA_HEIGHT - enemy.radius, enemy.y));

  if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
  if (enemy.hitFlash > 0) enemy.hitFlash -= dt;

  if (enemy.isBoss && enemy.hp < enemy.maxHp * 0.5) {
    enemy.speed = BOSS.speed * 1.5;
    enemy.phase = 1;
  }
}

export function enemyAttack(enemy, player) {
  if (enemy.attackCooldown > 0 || !enemy.alive) return 0;
  const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
  if (dist < enemy.radius + player.radius + 10) {
    enemy.attackCooldown = enemy.isBoss ? 800 : 1200;
    return enemy.damage;
  }
  return 0;
}

export function damageEnemy(enemy, amount) {
  if (!enemy.alive) return false;
  enemy.hp -= amount;
  enemy.hitFlash = 150;
  if (enemy.hp <= 0) {
    enemy.alive = false;
    return true;
  }
  return false;
}

export function getEnemyCountForFloor(floor) {
  return GAME.FLOOR_ENEMY_BASE + Math.floor(floor / 2);
}

export function isBossFloor(floor) {
  return floor % GAME.BOSS_EVERY === 0;
}
