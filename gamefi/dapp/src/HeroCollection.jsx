import { useAccount, useReadContract } from 'wagmi';
import addresses from './abis/addresses.json';
import ZombieSiegeAbi from './abis/ZombieSiege.json';
import { NftPortrait, HeroStatsLoader, WeaponStatsLoader } from './NftPortrait';
import { useOwnedNfts } from './useOwnedNfts';
import { CLASSES } from './config';

const SIEGE = addresses.ZombieSiege;

function HeroHpBar({ heroId }) {
  const { data: heroHpData } = useReadContract({
    address: SIEGE,
    abi: ZombieSiegeAbi.abi,
    functionName: 'getHeroHp',
    args: [BigInt(heroId)],
    query: { enabled: SIEGE !== '0x0000000000000000000000000000000000000000', refetchInterval: 60_000 },
  });
  const { data: hpRegenPerHour } = useReadContract({
    address: SIEGE,
    abi: ZombieSiegeAbi.abi,
    functionName: 'hpRegenPerHour',
  });

  const currentHp = heroHpData ? Number(heroHpData[0]) : null;
  const maxHp = heroHpData ? Number(heroHpData[1]) : null;
  const regen = hpRegenPerHour ? Number(hpRegenPerHour) : 10;
  const pct = maxHp ? Math.round((currentHp / maxHp) * 100) : 0;

  if (currentHp === null || maxHp === null) return null;

  return (
    <div className="collection-hp">
      <div className="hp-bar">
        <div className="hp-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="collection-hp-label">
        ❤ {currentHp}/{maxHp} HP · regen {regen}/hr
      </span>
    </div>
  );
}

function HeroStatLine({ stats }) {
  if (!stats) return null;
  const cls = CLASSES[Number(stats[0])] ?? 'Hero';
  return (
    <p className="collection-stats muted">
      {cls} · PWR {stats[1]} · SPD {stats[2]} · DEF {stats[3]} · LCK {stats[4]}
    </p>
  );
}

export default function HeroCollection({ onPlay }) {
  const { isConnected } = useAccount();
  const { heroIds, weaponIds, loading, refresh } = useOwnedNfts();

  if (!isConnected) {
    return <p className="muted">Connect your wallet to see your collection.</p>;
  }

  return (
    <div className="collection-panel">
      <div className="collection-header">
        <h3>Your Heroes ({heroIds.length})</h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => refresh()} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {!heroIds.length && !loading && (
        <p className="muted">No heroes yet — mint one below or in the Play tab.</p>
      )}

      <div className="nft-grid collection-grid">
        {heroIds.map((id) => (
          <div key={id} className="collection-card">
            <HeroStatsLoader heroId={id}>
              {(stats) => (
                <>
                  <NftPortrait kind="hero" tokenId={id} stats={stats} />
                  <HeroStatLine stats={stats} />
                  <HeroHpBar heroId={id} />
                  {onPlay && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => onPlay(id)}>
                      Play with hero
                    </button>
                  )}
                </>
              )}
            </HeroStatsLoader>
          </div>
        ))}
      </div>

      <h3 className="collection-weapons-title">Your Weapons ({weaponIds.length})</h3>
      {!weaponIds.length && !loading && (
        <p className="muted">No weapons yet — mint in the Play tab (25 LOOT).</p>
      )}
      <div className="nft-grid collection-grid">
        {weaponIds.map((id) => (
          <WeaponStatsLoader key={id} weaponId={id}>
            {(stats) => <NftPortrait kind="weapon" tokenId={id} stats={stats} compact />}
          </WeaponStatsLoader>
        ))}
      </div>
    </div>
  );
}
