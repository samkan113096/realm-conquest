import { HERO_NAMES, WEAPON_NAMES, HERO_COUNT, WEAPON_COUNT } from './nftCatalog';
import { CLASSES, WEAPON_TYPES, RARITY } from './config';

export function heroNameIndex(nameSeed, tokenId) {
  const seed = Number(nameSeed ?? 0);
  const id = Number(tokenId ?? 0);
  return (seed + id * 7) % HERO_COUNT;
}

export function weaponNameIndex(tokenId, weaponType = 0, nameSeed) {
  const seed = Number(nameSeed ?? 0);
  const id = Number(tokenId ?? 0);
  const t = Number(weaponType ?? 0);
  return (seed + id * 13 + t * 17) % WEAPON_COUNT;
}

export function getHeroName(stats, tokenId) {
  if (!stats) return `Hero #${tokenId}`;
  const nameSeed = stats.length > 6 ? stats[6] : tokenId;
  const idx = heroNameIndex(nameSeed, tokenId);
  return HERO_NAMES[idx];
}

export function getWeaponName(stats, tokenId) {
  if (!stats) return `Weapon #${tokenId}`;
  const weaponType = Number(stats[0] ?? 0);
  const nameSeed = stats.length > 4 ? stats[4] : tokenId;
  const idx = weaponNameIndex(tokenId, weaponType, nameSeed);
  return WEAPON_NAMES[idx];
}

export function getHeroArtPath(stats, tokenId) {
  const idx = heroNameIndex(stats?.length > 6 ? stats[6] : tokenId, tokenId);
  return `/nft/heroes/hero-${String(idx).padStart(2, '0')}.svg`;
}

export function getWeaponArtPath(stats, tokenId) {
  const nameSeed = stats?.length > 4 ? stats[4] : tokenId;
  const idx = weaponNameIndex(tokenId, stats?.[0], nameSeed);
  return `/nft/weapons/weapon-${String(idx).padStart(3, '0')}.svg`;
}

export function formatHeroLabel(stats, tokenId) {
  if (!stats) return `#${tokenId}`;
  const name = getHeroName(stats, tokenId);
  const cls = CLASSES[Number(stats[0])] ?? 'Hero';
  const rarity = RARITY[Number(stats[5])] ?? 'Common';
  return `${name} · ${rarity} ${cls}`;
}

export function formatWeaponLabel(stats, tokenId) {
  if (!stats) return `#${tokenId}`;
  const name = getWeaponName(stats, tokenId);
  const type = WEAPON_TYPES[Number(stats[0])] ?? 'Weapon';
  const rarity = RARITY[Number(stats[3])] ?? 'Common';
  return `${name} · ${rarity} ${type}`;
}
