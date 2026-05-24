import { GAME } from '../constants';

let nextId = 1;

export function createBullet(x, y, targetX, targetY, damage) {
  const dx = targetX - x;
  const dy = targetY - y;
  const len = Math.hypot(dx, dy) || 1;
  const speed = GAME.BULLET_SPEED;
  return {
    id: nextId++,
    x,
    y,
    vx: (dx / len) * speed,
    vy: (dy / len) * speed,
    damage,
    life: GAME.BULLET_LIFE,
    radius: 5,
  };
}

export function updateBullets(bullets, dt) {
  const scale = dt * 0.06;
  return bullets
    .map(b => ({
      ...b,
      x: b.x + b.vx * scale,
      y: b.y + b.vy * scale,
      life: b.life - dt,
    }))
    .filter(b =>
      b.life > 0
      && b.x > -10 && b.x < GAME.ARENA_WIDTH + 10
      && b.y > -10 && b.y < GAME.ARENA_HEIGHT + 10
    );
}

export function getBulletHit(bullet, enemy) {
  if (!enemy.alive) return false;
  return Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y) < enemy.radius + bullet.radius + 4;
}
