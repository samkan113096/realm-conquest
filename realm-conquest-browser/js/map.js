import { MAP_SIZE, TERRAIN } from './units.js';
import { UNITS } from './units.js';

const TERRAIN_TYPES = ['plains', 'forest', 'hills'];
const NAMES = [
  'Northmarch', 'Eastvale', 'Westhold', 'Southgate', 'Ironkeep',
  'Goldmere', 'Thornwood', 'Stormpeak', 'Ravenscroft', 'Silverford',
  'Darkmoor', 'Sunhaven', 'Frostheim', 'Emberfall', 'Windmere',
  'Stonebridge', 'Mistral', 'Oakenshield', 'Dragonspire', 'Crystalbay',
  'Wolfden', 'Starfall', 'Ashford', 'Brightwater', 'Copperhill',
  'Duskhollow', 'Evergreen', 'Fairwind', 'Grimhold', 'Highcrest',
  'Jade Valley', 'Kingsport', 'Lunaris', 'Moonhaven', 'Nightshade',
  'Oakenheart', 'Palestone', 'Queensbury', 'Riverdale', 'Shadowfen',
  'Tidemark', 'Underhill', 'Verdant', 'Whisperwood', 'Zephyr',
  'Ambergate', 'Blackwood', 'Crownlands', 'Deepwood', 'Eaglecrest',
];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateMap(seed = Date.now(), options = {}) {
  const rand = seededRandom(seed);
  const { cols, rows } = MAP_SIZE;
  const territories = [];
  let nameIdx = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const terrainKey = TERRAIN_TYPES[Math.floor(rand() * TERRAIN_TYPES.length)];
      territories.push({
        id: row * cols + col,
        col,
        row,
        name: NAMES[nameIdx++ % NAMES.length],
        terrain: terrainKey,
        owner: 'neutral',
        buildings: [],
        units: [],
        gold: Math.floor(rand() * 15) + 5,
        food: Math.floor(rand() * 10) + 3,
      });
    }
  }

  const playerStart = (rows - 1) * cols;
  territories[playerStart].owner = 'player';
  territories[playerStart].buildings.push('farm');
  territories[playerStart].units.push({ type: 'warrior', count: 2 });

  territories[0].owner = 'enemy1';
  territories[0].buildings.push('barracks');
  territories[0].units.push({ type: 'warrior', count: 3 });

  if (!options.twoPlayer) {
    territories[cols - 1].owner = 'enemy2';
    territories[cols - 1].buildings.push('barracks');
    territories[cols - 1].units.push({ type: 'archer', count: 2 });
  }

  return { territories, seed, cols, rows };
}

export function getNeighbors(territory, map) {
  const { col, row } = territory;
  const { cols, rows } = map;
  const parity = col & 1;
  const offsets = parity
    ? [[0, -1], [1, -1], [-1, 0], [1, 0], [0, 1], [1, 1]]
    : [[-1, -1], [0, -1], [-1, 0], [1, 0], [-1, 1], [0, 1]];

  return offsets
    .map(([dc, dr]) => {
      const nc = col + dc;
      const nr = row + dr;
      if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) return null;
      return map.territories.find(t => t.col === nc && t.row === nr);
    })
    .filter(Boolean);
}

export function hexToPixel(col, row, hexSize) {
  const x = hexSize * (3 / 2 * col);
  const y = hexSize * (Math.sqrt(3) * (row + 0.5 * (col % 2)));
  return { x, y };
}

export function getTerritoryAt(map, col, row) {
  return map.territories.find(t => t.col === col && t.row === row);
}

export function getArmyPower(territory) {
  return territory.units.reduce((sum, u) => {
    const unitDef = UNITS[u.type];
    return sum + (unitDef?.power || 1) * u.count;
  }, 0);
}

export function countArmy(territory) {
  return territory.units.reduce((sum, u) => sum + u.count, 0);
}

export function getTerrainDefense(territory) {
  return TERRAIN[territory.terrain]?.defense || 0;
}
