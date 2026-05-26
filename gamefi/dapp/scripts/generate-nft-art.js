#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { HERO_NAMES, WEAPON_NAMES } from '../src/nftCatalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const RARITY_COLORS = [
  { border: '#888', glow: '#666', bg: '#1a1a2e' },
  { border: '#4ade80', glow: '#22c55e', bg: '#0f1f18' },
  { border: '#60a5fa', glow: '#3b82f6', bg: '#0f1528' },
  { border: '#c084fc', glow: '#a855f7', bg: '#1a0f28' },
  { border: '#ffc940', glow: '#f59e0b', bg: '#1f1808' },
];

const CLASS_THEME = [
  { skin: '#ffd4b8', armor: '#e85d4c', accent: '#ffc940' },
  { skin: '#ffd4b8', armor: '#4ade80', accent: '#86efac' },
  { skin: '#ffe8d6', armor: '#818cf8', accent: '#c4b5fd' },
  { skin: '#ffd4b8', armor: '#60a5fa', accent: '#93c5fd' },
  { skin: '#ffe0cc', armor: '#f472b6', accent: '#fbcfe8' },
];

const WEAPON_ICON = ['⚔', '🏹', '🪄', '🔨', '🗡'];

function heroSvg(index, name) {
  const cls = index % 5;
  const rarity = index % 5;
  const rc = RARITY_COLORS[rarity];
  const th = CLASS_THEME[cls];
  const classes = ['Warrior', 'Ranger', 'Mage', 'Tank', 'Assassin'];
  const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="400" viewBox="0 0 320 400">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${rc.bg}"/><stop offset="100%" stop-color="#07070f"/></linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="320" height="400" rx="16" fill="url(#bg)" stroke="${rc.border}" stroke-width="3"/>
  <rect x="12" y="12" width="296" height="376" rx="12" fill="none" stroke="${rc.glow}" stroke-width="1" opacity="0.4"/>
  <text x="160" y="36" text-anchor="middle" fill="${rc.border}" font-family="Orbitron,Inter,sans-serif" font-size="11">${rarities[rarity].toUpperCase()}</text>
  <text x="160" y="58" text-anchor="middle" fill="#e8e8ff" font-family="Inter,sans-serif" font-size="14" font-weight="600">${escapeXml(name.slice(0, 22))}</text>
  <circle cx="160" cy="200" r="72" fill="${th.armor}" opacity="0.15"/>
  <circle cx="160" cy="175" r="48" fill="${th.skin}" stroke="${th.armor}" stroke-width="3"/>
  <ellipse cx="160" cy="155" rx="44" ry="28" fill="${th.armor}" opacity="0.85"/>
  <circle cx="145" cy="172" r="6" fill="#fff"/><circle cx="175" cy="172" r="6" fill="#fff"/>
  <circle cx="146" cy="173" r="3" fill="#333"/><circle cx="176" cy="173" r="3" fill="#333"/>
  <path d="M 150 188 Q 160 196 170 188" fill="none" stroke="#c97a6a" stroke-width="2"/>
  <rect x="128" y="218" width="64" height="70" rx="12" fill="${th.armor}"/>
  <rect x="136" y="228" width="48" height="12" rx="4" fill="${th.accent}"/>
  <text x="160" y="330" text-anchor="middle" fill="${th.accent}" font-family="Orbitron,sans-serif" font-size="13">${classes[cls]}</text>
  <text x="160" y="355" text-anchor="middle" fill="#6666aa" font-family="Inter,sans-serif" font-size="11">CLOOT Hero NFT</text>
  <text x="160" y="378" text-anchor="middle" fill="#444" font-family="Inter,sans-serif" font-size="10">#${index}</text>
</svg>`;
}

function weaponSvg(index, name) {
  const wType = index % 5;
  const rarity = Math.floor(index / 20) % 5;
  const rc = RARITY_COLORS[rarity];
  const types = ['Sword', 'Bow', 'Staff', 'Hammer', 'Dagger'];
  const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="400" viewBox="0 0 320 400">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${rc.bg}"/><stop offset="100%" stop-color="#07070f"/></linearGradient>
  </defs>
  <rect width="320" height="400" rx="16" fill="url(#bg)" stroke="${rc.border}" stroke-width="3"/>
  <text x="160" y="36" text-anchor="middle" fill="${rc.border}" font-family="Orbitron,Inter,sans-serif" font-size="11">${rarities[rarity].toUpperCase()}</text>
  <text x="160" y="58" text-anchor="middle" fill="#e8e8ff" font-family="Inter,sans-serif" font-size="13" font-weight="600">${escapeXml(name.slice(0, 24))}</text>
  <text x="160" y="210" text-anchor="middle" font-size="100" filter="url(#none)">${WEAPON_ICON[wType]}</text>
  <rect x="80" y="240" width="160" height="8" rx="4" fill="${rc.glow}" opacity="0.6"/>
  <rect x="100" y="260" width="120" height="6" rx="3" fill="${rc.border}" opacity="0.4"/>
  <text x="160" y="310" text-anchor="middle" fill="${rc.border}" font-family="Orbitron,sans-serif" font-size="13">${types[wType]}</text>
  <text x="160" y="355" text-anchor="middle" fill="#6666aa" font-family="Inter,sans-serif" font-size="11">WLOOT Weapon NFT</text>
  <text x="160" y="378" text-anchor="middle" fill="#444" font-family="Inter,sans-serif" font-size="10">#${index}</text>
</svg>`;
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

const heroDir = path.join(ROOT, 'public/nft/heroes');
const weaponDir = path.join(ROOT, 'public/nft/weapons');
fs.mkdirSync(heroDir, { recursive: true });
fs.mkdirSync(weaponDir, { recursive: true });

HERO_NAMES.forEach((name, i) => {
  fs.writeFileSync(path.join(heroDir, `hero-${String(i).padStart(2, '0')}.svg`), heroSvg(i, name));
});
WEAPON_NAMES.forEach((name, i) => {
  fs.writeFileSync(path.join(weaponDir, `weapon-${String(i).padStart(3, '0')}.svg`), weaponSvg(i, name));
});

console.log(`Generated ${HERO_NAMES.length} hero + ${WEAPON_NAMES.length} weapon SVGs`);
