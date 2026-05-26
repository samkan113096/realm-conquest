import { useReadContract } from 'wagmi';
import { getHeroArtPath, getWeaponArtPath, getHeroName, getWeaponName } from './nftMeta';
import { RARITY } from './config';
import GameHeroAbi from './abis/GameHero.json';
import GameWeaponAbi from './abis/GameWeapon.json';
import addresses from './abis/addresses.json';

const HERO = addresses.GameHero;
const WEAPON = addresses.GameWeapon;

export function NftPortrait({ kind, tokenId, stats, selected, onClick, compact }) {
  const isHero = kind === 'hero';
  const art = isHero ? getHeroArtPath(stats, tokenId) : getWeaponArtPath(stats, tokenId);
  const name = isHero ? getHeroName(stats, tokenId) : getWeaponName(stats, tokenId);
  const rarityIdx = isHero ? Number(stats?.[5] ?? 0) : Number(stats?.[3] ?? 0);
  const rarity = RARITY[rarityIdx] ?? 'Common';
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={`nft-card ${selected ? 'nft-card-active' : ''} ${compact ? 'nft-card-compact' : ''}`}
      onClick={onClick}
    >
      <div className={`nft-frame rarity-border-${rarityIdx}`}>
        <img src={art} alt={name} className="nft-img" loading="lazy" />
      </div>
      <div className="nft-card-body">
        <span className={`rarity rarity-${rarityIdx}`}>{rarity}</span>
        <strong className="nft-name">{name}</strong>
        {!compact && <span className="nft-id muted">Token #{tokenId}</span>}
      </div>
    </Tag>
  );
}

export function HeroStatsLoader({ heroId, children }) {
  const { data: stats } = useReadContract({
    address: HERO,
    abi: GameHeroAbi.abi,
    functionName: 'heroStats',
    args: [BigInt(heroId)],
    query: { enabled: heroId !== null && heroId !== undefined },
  });
  return children(stats);
}

export function WeaponStatsLoader({ weaponId, children }) {
  const { data: stats } = useReadContract({
    address: WEAPON,
    abi: GameWeaponAbi.abi,
    functionName: 'weaponStats',
    args: [BigInt(weaponId)],
    query: { enabled: weaponId !== null && weaponId !== undefined },
  });
  return children(stats);
}
