export const RARITY = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
export const CLASSES = ['Warrior', 'Ranger', 'Mage', 'Tank', 'Assassin'];
export const WEAPON_TYPES = ['Sword', 'Bow', 'Staff', 'Hammer', 'Dagger'];

export const ZOMBIE_TIERS = [
  { id: 0, name: 'Shambler', minPower: 40, reward: '2', hpCost: 12 },
  { id: 1, name: 'Runner', minPower: 70, reward: '5', hpCost: 18 },
  { id: 2, name: 'Brute', minPower: 110, reward: '10', hpCost: 26 },
  { id: 3, name: 'Elite', minPower: 160, reward: '20', hpCost: 36 },
  { id: 4, name: 'Necromancer', minPower: 220, reward: '40', hpCost: 48 },
];

export const SIGNER_URL = import.meta.env.VITE_SIGNER_URL || 'http://localhost:3001';
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://golden-haupia-52c7c5.netlify.app';
