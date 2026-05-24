export const COLORS = {
  bg: '#0a0612',
  floor: '#120818',
  wall: '#2a1030',
  player: '#ff2266',
  playerHit: '#ff4466',
  enemy: '#ff3366',
  enemyFast: '#ff9933',
  enemyTank: '#9933ff',
  boss: '#ff0066',
  attack: '#ffff00',
  special: '#00ccff',
  dodge: '#cc66ff',
  hp: '#ff4466',
  hpBg: '#331122',
  text: '#e0e0ff',
  textDim: '#666688',
  combo: '#ff66cc',
  gold: '#ffcc00',
};

export const SPRITES = {
  playerIdle: require('../assets/sprites/kira-idle.png'),
  playerAttack: require('../assets/sprites/kira-attack.png'),
  grunt: require('../assets/sprites/enemy-grunt.png'),
  fast: require('../assets/sprites/enemy-striker.png'),
  tank: require('../assets/sprites/enemy-brute.png'),
  boss: require('../assets/sprites/boss-viper.png'),
  arena: require('../assets/backgrounds/arena-pit.jpg'),
  menuHero: require('../assets/backgrounds/menu-hero.jpg'),
  logo: require('../assets/logo.png'),
};

export function getEnemySprite(enemy) {
  if (enemy.isBoss) return SPRITES.boss;
  if (enemy.type === 'fast') return SPRITES.fast;
  if (enemy.type === 'tank') return SPRITES.tank;
  return SPRITES.grunt;
}

export const GAME = {
  ARENA_WIDTH: 800,
  ARENA_HEIGHT: 450,
  PLAYER_SPEED: 5,
  PLAYER_HP: 120,
  BULLET_SPEED: 14,
  BULLET_DAMAGE: 18,
  BULLET_LIFE: 900,
  FIRE_COOLDOWN: 110,
  AIM_RANGE: 500,
  BOMB_DAMAGE: 55,
  BOMB_RADIUS: 130,
  BOMB_COOLDOWN: 4000,
  COMBO_WINDOW: 1200,
  COMBO_MULTIPLIER: 0.15,
  FLOOR_ENEMY_BASE: 3,
  BOSS_EVERY: 5,
};

export const ENEMY_TYPES = {
  grunt: {
    name: 'Grunt',
    hp: 35,
    speed: 1.6,
    damage: 7,
    radius: 18,
    color: COLORS.enemy,
    score: 100,
  },
  fast: {
    name: 'Striker',
    hp: 22,
    speed: 2.8,
    damage: 10,
    radius: 14,
    color: COLORS.enemyFast,
    score: 150,
  },
  tank: {
    name: 'Brute',
    hp: 70,
    speed: 1.0,
    damage: 15,
    radius: 26,
    color: COLORS.enemyTank,
    score: 250,
  },
};

export const BOSS = {
  hp: 300,
  speed: 1.8,
  damage: 25,
  radius: 40,
  color: COLORS.boss,
  score: 1000,
};
