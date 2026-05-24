export const BUILDINGS = {
  farm: { name: 'Farm', cost: { gold: 30 }, foodPerTurn: 8, icon: '🌾', color: '#7cb342' },
  barracks: { name: 'Barracks', cost: { gold: 50 }, armyCap: 10, icon: '🏰', color: '#8d6e63' },
  market: { name: 'Market', cost: { gold: 40 }, goldPerTurn: 12, icon: '🏪', color: '#ffb74d' },
};

export const UNITS = {
  warrior: { name: 'Warrior', cost: { gold: 20, food: 10 }, power: 3, icon: '🗡️' },
  archer: { name: 'Archer', cost: { gold: 25, food: 15 }, power: 2, icon: '🏹', ranged: true },
};

export const FACTIONS = {
  player: { name: 'House Azurewind', color: '#4da6ff', glow: '#1a6fd4', id: 'player' },
  enemy1: { name: 'Red Legion', color: '#ff5252', glow: '#c62828', id: 'enemy1' },
  enemy2: { name: 'Shadow Court', color: '#b388ff', glow: '#7c4dff', id: 'enemy2' },
  neutral: { name: 'Neutral', color: '#90a4ae', glow: '#607d8b', id: 'neutral' },
};

export const TERRAIN = {
  plains: { name: 'Plains', defense: 0, color: '#7ec850', colorLight: '#a8e06a', colorDark: '#5a9a38' },
  forest: { name: 'Forest', defense: 1, color: '#3d8b5a', colorLight: '#5cb87a', colorDark: '#2a6040' },
  hills: { name: 'Hills', defense: 2, color: '#c4a35a', colorLight: '#ddb978', colorDark: '#9a7d3c' },
  water: { name: 'Water', defense: 0, color: '#4a9eff', colorLight: '#7ab8ff', colorDark: '#2566cc', impassable: true },
};

export const MAP_SIZE = { cols: 8, rows: 6 };
export const HEX_SIZE = 48;

export function getBuilding(action) {
  const map = {
    'build-farm': 'farm',
    'build-barracks': 'barracks',
    'build-market': 'market',
  };
  return BUILDINGS[map[action]];
}

export function getArmyCap(territory) {
  if (!territory.buildings.includes('barracks')) return 0;
  return BUILDINGS.barracks.armyCap;
}

export function getUnit(action) {
  const map = {
    'recruit-warrior': 'warrior',
    'recruit-archer': 'archer',
  };
  return UNITS[map[action]];
}
