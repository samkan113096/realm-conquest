import { GAME } from '../constants';
import { createEnemy, createBoss, isBossFloor, getEnemyCountForFloor } from '../entities/Enemy';

const ENEMY_POOL = ['grunt', 'grunt', 'fast', 'tank'];

export function spawnFloor(floor) {
  const enemies = [];
  const isBoss = isBossFloor(floor);

  if (isBoss) {
    enemies.push(createBoss(GAME.ARENA_WIDTH / 2, GAME.ARENA_HEIGHT / 2 - 50, floor));
    const adds = Math.floor(floor / 5);
    for (let i = 0; i < adds; i++) {
      enemies.push(createEnemy('grunt', 100 + i * 150, 100 + (i % 2) * 200));
    }
  } else {
    const count = getEnemyCountForFloor(floor);
    for (let i = 0; i < count; i++) {
      const type = ENEMY_POOL[Math.floor(Math.random() * ENEMY_POOL.length)];
      const side = i % 4;
      let x, y;
      if (side === 0) { x = 50; y = 50 + Math.random() * (GAME.ARENA_HEIGHT - 100); }
      else if (side === 1) { x = GAME.ARENA_WIDTH - 50; y = 50 + Math.random() * (GAME.ARENA_HEIGHT - 100); }
      else if (side === 2) { x = 50 + Math.random() * (GAME.ARENA_WIDTH - 100); y = 50; }
      else { x = 50 + Math.random() * (GAME.ARENA_WIDTH - 100); y = GAME.ARENA_HEIGHT - 50; }
      enemies.push(createEnemy(type, x, y));
    }
  }

  return enemies;
}

export function checkBombHit(bomb, enemies) {
  return enemies.filter(e => {
    if (!e.alive) return false;
    return Math.hypot(bomb.x - e.x, bomb.y - e.y) < bomb.radius + e.radius;
  });
}
