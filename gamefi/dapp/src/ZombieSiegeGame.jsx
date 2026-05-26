import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { parseEther, formatEther, decodeEventLog } from 'viem';
import addresses from './abis/addresses.json';
import GameHeroAbi from './abis/GameHero.json';
import GameWeaponAbi from './abis/GameWeapon.json';
import GameTokenAbi from './abis/GameToken.json';
import ZombieSiegeAbi from './abis/ZombieSiege.json';
import { RARITY, CLASSES, WEAPON_TYPES, ZOMBIE_TIERS } from './config';
import { drawBattleBackground, drawChibiHero, drawChibiZombie, drawWeaponFx } from './siegeArt';
import { approveAndMint, simulateAndWrite, formatContractError } from './mintHelpers';
import { getHeroName } from './nftMeta';
import { NftPortrait, HeroStatsLoader, WeaponStatsLoader } from './NftPortrait';

const HERO = addresses.GameHero;
const WEAPON = addresses.GameWeapon;
const TOKEN = addresses.GameToken;
const SIEGE = addresses.ZombieSiege;

export default function ZombieSiegeGame({ onStatus, initialHeroId, onHeroSelected }) {
  const { address, isConnected, chain } = useAccount();
  const targetChainId = Number(addresses.chainId);
  const wrongNetwork = isConnected && chain?.id !== targetChainId;
  const canvasRef = useRef(null);
  const arenaRef = useRef(null);
  const [selectedHero, setSelectedHero] = useState(null);
  const [selectedWeapon, setSelectedWeapon] = useState(null);
  const [selectedTier, setSelectedTier] = useState(0);
  const [heroIds, setHeroIds] = useState([]);
  const [weaponIds, setWeaponIds] = useState([]);
  const [battleLog, setBattleLog] = useState([]);
  const [animating, setAnimating] = useState(false);
  const [lastBattle, setLastBattle] = useState(null);
  const overlayRef = useRef(0);

  const { data: heroBal } = useReadContract({
    address: HERO, abi: GameHeroAbi.abi, functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && HERO !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: weaponBal } = useReadContract({
    address: WEAPON, abi: GameWeaponAbi.abi, functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && WEAPON !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: totalHeroesMinted } = useReadContract({
    address: HERO, abi: GameHeroAbi.abi, functionName: 'totalMinted',
    query: { enabled: HERO !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: heroPower } = useReadContract({
    address: SIEGE, abi: ZombieSiegeAbi.abi, functionName: 'getHeroPower',
    args: selectedHero !== null ? [BigInt(selectedHero)] : undefined,
    query: { enabled: selectedHero !== null && SIEGE !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: heroHpData, refetch: refetchHp } = useReadContract({
    address: SIEGE, abi: ZombieSiegeAbi.abi, functionName: 'getHeroHp',
    args: selectedHero !== null ? [BigInt(selectedHero)] : undefined,
    query: {
      enabled: selectedHero !== null && SIEGE !== '0x0000000000000000000000000000000000000000',
      refetchInterval: 30_000,
    },
  });

  const { data: hpRegenPerHour } = useReadContract({
    address: SIEGE, abi: ZombieSiegeAbi.abi, functionName: 'hpRegenPerHour',
    query: { enabled: SIEGE !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: minHpToFight } = useReadContract({
    address: SIEGE, abi: ZombieSiegeAbi.abi, functionName: 'minHpToFight',
    query: { enabled: SIEGE !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: previewLoot } = useReadContract({
    address: SIEGE, abi: ZombieSiegeAbi.abi, functionName: 'previewReward',
    args: selectedHero !== null ? [BigInt(selectedHero), selectedTier] : undefined,
    query: { enabled: selectedHero !== null && SIEGE !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: heroStats } = useReadContract({
    address: HERO, abi: GameHeroAbi.abi, functionName: 'heroStats',
    args: selectedHero !== null ? [BigInt(selectedHero)] : undefined,
    query: { enabled: selectedHero !== null && HERO !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: playerKills } = useReadContract({
    address: SIEGE, abi: ZombieSiegeAbi.abi, functionName: 'totalKills',
    args: address ? [address] : undefined,
    query: { enabled: !!address && SIEGE !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: playerLootEarned } = useReadContract({
    address: SIEGE, abi: ZombieSiegeAbi.abi, functionName: 'totalLootEarned',
    args: address ? [address] : undefined,
    query: { enabled: !!address && SIEGE !== '0x0000000000000000000000000000000000000000' },
  });

  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isSuccess: txSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const publicClient = usePublicClient();
  const [battleBusy, setBattleBusy] = useState(false);

  const loadInventory = useCallback(async () => {
    if (!isConnected || !address || heroBal === undefined || !publicClient) return;
    const hIds = [];
    const wIds = [];
    const hb = Number(heroBal || 0);
    const wb = Number(weaponBal || 0);
    for (let i = 0; i < hb; i++) {
      const id = await publicClient.readContract({
        address: HERO, abi: GameHeroAbi.abi, functionName: 'tokenOfOwnerByIndex', args: [address, BigInt(i)],
      });
      hIds.push(Number(id));
    }
    for (let i = 0; i < wb; i++) {
      const id = await publicClient.readContract({
        address: WEAPON, abi: GameWeaponAbi.abi, functionName: 'tokenOfOwnerByIndex', args: [address, BigInt(i)],
      });
      wIds.push(Number(id));
    }
    setHeroIds(hIds);
    setWeaponIds(wIds);
    if (hIds.length && selectedHero === null) setSelectedHero(hIds[0]);
  }, [address, heroBal, weaponBal, isConnected, publicClient, selectedHero]);

  useEffect(() => {
    loadInventory().catch(() => {});
  }, [loadInventory, txSuccess]);

  useEffect(() => {
    if (initialHeroId !== null && initialHeroId !== undefined) {
      setSelectedHero(initialHeroId);
      onHeroSelected?.();
    }
  }, [initialHeroId, onHeroSelected]);

  useEffect(() => {
    if (selectedHero === null) return;
    const id = setInterval(() => refetchHp(), 30000);
    return () => clearInterval(id);
  }, [selectedHero, refetchHp]);

  const heroClass = heroStats ? Number(heroStats[0]) : 0;
  const heroRarity = heroStats ? Number(heroStats[5]) : 0;

  const drawScene = useCallback((frame = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    drawBattleBackground(ctx, w, h, frame);

    const hx = w * 0.24;
    const zx = w * 0.76;
    const cy = h * 0.52;

    drawChibiHero(ctx, hx, cy, frame, heroClass, animating);
    drawChibiZombie(ctx, zx, cy, frame, selectedTier, animating);
    drawWeaponFx(ctx, hx, zx, cy, frame, animating);

    if (selectedHero !== null) {
      ctx.textAlign = 'center';
      ctx.font = 'bold 13px Orbitron, Inter';
      ctx.fillStyle = '#ffc940';
      const heroLabel = heroStats ? getHeroName(heroStats, selectedHero) : `Hero #${selectedHero}`;
      ctx.fillText(heroLabel, hx, cy - 72);
      ctx.font = '11px Inter';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`${RARITY[heroRarity] ?? 'Hero'} ${CLASSES[heroClass] ?? ''}`, hx, cy - 58);
    }

    if (animating && !lastBattle) {
      const pulse = 0.7 + Math.sin(frame * 0.12) * 0.3;
      ctx.fillStyle = `rgba(255, 200, 64, ${0.12 * pulse})`;
      ctx.fillRect(0, 0, w, h);
      ctx.font = 'bold 22px Orbitron, Inter';
      ctx.fillStyle = '#ffc940';
      ctx.shadowColor = '#ffc940';
      ctx.shadowBlur = 16;
      ctx.fillText('⚔ FIGHT! ⚔', w / 2, 36);
      ctx.shadowBlur = 0;
      ctx.font = '13px Inter';
      ctx.fillStyle = '#00ffc8';
      ctx.fillText(`vs ${ZOMBIE_TIERS[selectedTier]?.name ?? 'Zombie'}`, w / 2, 58);
    }

    if (lastBattle && overlayRef.current > 0) {
      const alpha = Math.min(1, overlayRef.current / 30);
      ctx.fillStyle = lastBattle.victory
        ? `rgba(0, 180, 120, ${0.15 * alpha})`
        : `rgba(180, 40, 60, ${0.15 * alpha})`;
      ctx.fillRect(0, 0, w, h);

      ctx.textAlign = 'center';
      ctx.font = 'bold 28px Orbitron, Inter';
      ctx.fillStyle = lastBattle.victory ? '#4ade80' : '#ff4466';
      ctx.shadowColor = lastBattle.victory ? '#4ade80' : '#ff4466';
      ctx.shadowBlur = 20;
      ctx.fillText(lastBattle.victory ? 'VICTORY!' : 'DEFEAT', w / 2, h * 0.35);
      ctx.shadowBlur = 0;

      if (lastBattle.victory) {
        ctx.font = 'bold 22px Inter';
        ctx.fillStyle = '#ffc940';
        ctx.fillText(`+${formatEther(lastBattle.reward)} LOOT earned`, w / 2, h * 0.48);
        ctx.font = '14px Inter';
        ctx.fillStyle = '#aaa';
        ctx.fillText('Mint better heroes & weapons to earn more', w / 2, h * 0.58);
      } else {
        ctx.font = '14px Inter';
        ctx.fillStyle = '#aaa';
        ctx.fillText('Upgrade gear and try again', w / 2, h * 0.48);
      }
    }
  }, [animating, selectedTier, heroClass, heroRarity, selectedHero, lastBattle, heroStats]);

  useEffect(() => {
    let f = 0;
    let raf;
    const loop = () => {
      if (overlayRef.current > 0) overlayRef.current--;
      drawScene(f++);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [drawScene]);

  const parseBattleFromReceipt = (receipt) => {
    if (!receipt?.logs) return null;
    for (const log of receipt.logs) {
      if (log.address?.toLowerCase() !== SIEGE.toLowerCase()) continue;
      try {
        const decoded = decodeEventLog({
          abi: ZombieSiegeAbi.abi,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === 'BattleResult') {
          return {
            victory: decoded.args.victory,
            reward: decoded.args.reward,
            power: decoded.args.power,
            tier: Number(decoded.args.tier),
            hpRemaining: decoded.args.hpRemaining,
            maxHp: decoded.args.maxHp,
          };
        }
      } catch {
        /* not BattleResult */
      }
    }
    return null;
  };

  const finishBattle = useCallback((receipt) => {
    setAnimating(false);
    setBattleBusy(false);
    const result = parseBattleFromReceipt(receipt);
    if (result) {
      setLastBattle(result);
      overlayRef.current = 180;
      const lootStr = result.victory ? ` +${formatEther(result.reward)} LOOT` : '';
      setBattleLog(l => [
        `${result.victory ? 'Victory' : 'Defeat'} vs ${ZOMBIE_TIERS[result.tier]?.name}${lootStr} · HP ${result.hpRemaining}/${result.maxHp}`,
        ...l,
      ].slice(0, 8));
      refetchHp();
      onStatus?.(result.victory
        ? `Victory! +${formatEther(result.reward)} LOOT. Hero HP: ${result.hpRemaining}/${result.maxHp}.`
        : `Defeat. Hero HP: ${result.hpRemaining}/${result.maxHp} — rest or use another hero.`);
    } else {
      setBattleLog(l => ['Battle tx confirmed', ...l].slice(0, 8));
      onStatus?.('Battle resolved on-chain.');
    }
  }, [onStatus, refetchHp]);

  const equipWeapon = async () => {
    if (selectedHero === null || !publicClient || !address) return;
    if (wrongNetwork) {
      onStatus?.('Switch MetaMask to Sepolia first.');
      return;
    }
    try {
      await simulateAndWrite({
        publicClient,
        writeContractAsync,
        account: address,
        onStatus,
        label: 'Equip weapon — confirm in MetaMask…',
        request: {
          address: SIEGE,
          abi: ZombieSiegeAbi.abi,
          functionName: 'equipWeapon',
          args: [BigInt(selectedHero), BigInt(selectedWeapon || 0)],
        },
      });
      onStatus?.('Weapon equipped on-chain!');
    } catch (e) {
      onStatus?.(formatContractError(e));
    }
  };

  const fight = async () => {
    if (selectedHero === null || !publicClient || !address) return;
    if (wrongNetwork) {
      onStatus?.('Switch MetaMask to Sepolia (chain 11155111) first.');
      return;
    }
    setBattleBusy(true);
    setAnimating(true);
    setLastBattle(null);
    arenaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    try {
      const { receipt } = await simulateAndWrite({
        publicClient,
        writeContractAsync,
        account: address,
        onStatus,
        label: 'Confirm fight in MetaMask…',
        request: {
          address: SIEGE,
          abi: ZombieSiegeAbi.abi,
          functionName: 'fight',
          args: [BigInt(selectedHero), selectedTier],
        },
      });
      onStatus?.('Battle confirmed — showing result…');
      finishBattle(receipt);
    } catch (e) {
      setAnimating(false);
      setBattleBusy(false);
      onStatus?.(formatContractError(e));
    }
  };

  const mintHero = async () => {
    if (!publicClient || !address) return;
    if (wrongNetwork) {
      onStatus?.('Switch MetaMask to Sepolia first.');
      return;
    }
    try {
      await approveAndMint({
        publicClient,
        writeContractAsync,
        account: address,
        tokenAddress: TOKEN,
        tokenAbi: GameTokenAbi.abi,
        spender: HERO,
        amount: parseEther('50'),
        targetAddress: HERO,
        targetAbi: GameHeroAbi.abi,
        mintFunctionName: 'mintHero',
        onStatus,
      });
      await loadInventory();
      onStatus?.('Hero minted!');
    } catch (e) { onStatus?.(formatContractError(e)); }
  };

  const mintWeapon = async () => {
    if (!publicClient || !address) return;
    if (wrongNetwork) {
      onStatus?.('Switch MetaMask to Sepolia first.');
      return;
    }
    try {
      await approveAndMint({
        publicClient,
        writeContractAsync,
        account: address,
        tokenAddress: TOKEN,
        tokenAbi: GameTokenAbi.abi,
        spender: WEAPON,
        amount: parseEther('25'),
        targetAddress: WEAPON,
        targetAbi: GameWeaponAbi.abi,
        mintFunctionName: 'mintWeapon',
        onStatus,
      });
      await loadInventory();
      onStatus?.('Weapon minted!');
    } catch (e) { onStatus?.(formatContractError(e)); }
  };

  const tier = ZOMBIE_TIERS[selectedTier];
  const power = heroPower ? Number(heroPower) : 0;
  const currentHp = heroHpData ? Number(heroHpData[0]) : 0;
  const maxHp = heroHpData ? Number(heroHpData[1]) : 0;
  const minHp = minHpToFight ? Number(minHpToFight) : 15;
  const regenRate = hpRegenPerHour ? Number(hpRegenPerHour) : 10;
  const hpPct = maxHp > 0 ? Math.round((currentHp / maxHp) * 100) : 0;
  const hpMissing = Math.max(0, minHp - currentHp);
  const regenHours = hpMissing > 0 && regenRate > 0 ? Math.ceil(hpMissing / regenRate) : 0;
  const hasEnoughHp = currentHp >= minHp && currentHp >= tier.hpCost;
  const canFight = power >= tier.minPower && hasEnoughHp && selectedHero !== null;
  const potentialLoot = previewLoot ? formatEther(previewLoot) : tier.reward;

  return (
    <section className="grid">
      {wrongNetwork && (
        <p className="warn card-wide">Wrong network — switch MetaMask to <strong>Sepolia</strong> (chain {targetChainId}).</p>
      )}
      <div className="card card-wide siege-header">
        <h2>🧟 Zombie Siege — Play to Earn</h2>
        <p className="muted">
          Defeat zombies with your hero NFT, earn <strong>LOOT</strong> on-chain. Better heroes & weapons → higher tiers → bigger rewards.
        </p>
        <div className="p2e-loop">
          <span>Mint Hero</span><span className="p2e-arrow">→</span>
          <span>Equip Weapon</span><span className="p2e-arrow">→</span>
          <span>Fight Zombie</span><span className="p2e-arrow">→</span>
          <span className="p2e-loot">Earn LOOT</span>
        </div>
        <div className="siege-stats">
          <span>Heroes minted: <strong>{totalHeroesMinted?.toString() ?? '—'}</strong> / 10,000</span>
          <span>Your kills: <strong>{playerKills?.toString() ?? '0'}</strong></span>
          <span>LOOT earned: <strong>{playerLootEarned ? formatEther(playerLootEarned) : '0'}</strong></span>
          <span>Combat power: <strong>{power || '—'}</strong></span>
          {selectedHero !== null && heroStats && (
            <span className={`rarity rarity-${heroRarity}`}>{RARITY[heroRarity]} {CLASSES[heroClass]}</span>
          )}
          {selectedHero !== null && maxHp > 0 && (
            <span>Hero HP: <strong>{currentHp}/{maxHp}</strong></span>
          )}
        </div>
        {selectedHero !== null && maxHp > 0 && (
          <div className="hp-bar-wrap">
            <div className="hp-bar">
              <div className="hp-bar-fill" style={{ width: `${hpPct}%` }} />
            </div>
            <span className="hp-bar-label">
              {hpPct}% · −{tier.hpCost} HP per fight · regen {regenRate} HP/hr
              {regenHours > 0 && ` · ~${regenHours}h to fight again`}
            </span>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Your Heroes ({heroIds.length})</h3>
        {!heroIds.length && <p className="muted">No heroes — mint one to start earning.</p>}
        <div className="nft-grid nft-grid-select">
          {heroIds.map(id => (
            <HeroStatsLoader key={id} heroId={id}>
              {(stats) => (
                <NftPortrait
                  kind="hero"
                  tokenId={id}
                  stats={stats}
                  selected={selectedHero === id}
                  onClick={() => setSelectedHero(id)}
                  compact
                />
              )}
            </HeroStatsLoader>
          ))}
        </div>
        <button className="btn btn-secondary" onClick={mintHero} disabled={!isConnected || isPending || battleBusy}>Mint Hero (50 LOOT)</button>
      </div>

      <div className="card">
        <h3>Weapons ({weaponIds.length})</h3>
        <p className="weapon-hint muted">
          Mint a <strong>WLOOT</strong> weapon (25 LOOT), pick it below, then <strong>Equip to Hero</strong>.
          Weapons add bonus damage to combat power on-chain.
        </p>
        <div className="nft-grid nft-grid-select">
          <button type="button" className={`select-item ${selectedWeapon === null ? 'active' : ''}`} onClick={() => setSelectedWeapon(null)}>None</button>
          {weaponIds.map(id => (
            <WeaponStatsLoader key={id} weaponId={id}>
              {(stats) => (
                <NftPortrait
                  kind="weapon"
                  tokenId={id}
                  stats={stats}
                  selected={selectedWeapon === id}
                  onClick={() => setSelectedWeapon(id)}
                  compact
                />
              )}
            </WeaponStatsLoader>
          ))}
        </div>
        <button className="btn btn-ghost" onClick={equipWeapon} disabled={!isConnected || selectedHero === null || isPending || battleBusy}>Equip to Hero</button>
        <button className="btn btn-secondary" onClick={mintWeapon} disabled={!isConnected || isPending || battleBusy}>Mint Weapon (25 LOOT)</button>
      </div>

      <div className="card card-wide">
        <h3>Choose Zombie Tier</h3>
        <div className="tier-grid">
          {ZOMBIE_TIERS.map(t => (
            <button key={t.id} className={`tier-btn tier-${t.id} ${selectedTier === t.id ? 'active' : ''} ${power < t.minPower ? 'locked' : ''}`}
              onClick={() => setSelectedTier(t.id)} disabled={battleBusy}>
              <strong>{t.name}</strong>
              <span>Min power: {t.minPower}</span>
              <span>HP cost: {t.hpCost}</span>
              <span>Reward: {t.reward} LOOT</span>
            </button>
          ))}
        </div>

        <div ref={arenaRef} className="battle-arena">
          <div className="battle-arena-header">
            {selectedHero !== null && heroStats ? (
              <div className="battle-hero-chip">
                <strong>{getHeroName(heroStats, selectedHero)}</strong>
                <span className={`rarity rarity-${heroRarity}`}>{RARITY[heroRarity]} {CLASSES[heroClass]}</span>
                <span>⚔ {power} power</span>
                {maxHp > 0 && <span>❤ {currentHp}/{maxHp} HP</span>}
              </div>
            ) : (
              <span className="muted">Select or mint a hero to fight</span>
            )}
            <span className="battle-vs">vs <strong>{tier.name}</strong> · up to {potentialLoot} LOOT</span>
          </div>
          <canvas ref={canvasRef} width={720} height={340} className="siege-canvas" />
          {battleBusy && (
            <div className="battle-overlay">
              <div className="battle-sparks" />
              <span className="battle-overlay-text">⚔ Battle in progress</span>
              <span className="battle-overlay-sub">
                {isPending ? 'Confirm in MetaMask…' : 'Resolving on Sepolia…'}
              </span>
            </div>
          )}
        </div>

        <button className="btn btn-primary btn-lg" onClick={fight} disabled={!isConnected || !canFight || battleBusy || isPending || selectedHero === null}>
          {battleBusy
            ? (isPending ? 'Confirm in MetaMask…' : 'Fighting on-chain…')
            : `Fight ${tier.name} — Earn up to ${potentialLoot} LOOT`}
        </button>
        {!canFight && selectedHero !== null && power < tier.minPower && (
          <p className="warn">Need {tier.minPower} power — mint a rarer hero or equip a weapon.</p>
        )}
        {!canFight && selectedHero !== null && power >= tier.minPower && !hasEnoughHp && (
          <p className="warn">Hero HP too low ({currentHp}/{maxHp}). Rest ~{regenHours || 1}h or switch to another hero. Rarer/Tank heroes have more HP.</p>
        )}
        <p className="muted" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>Each hero rests 30 seconds between fights (on-chain cooldown).</p>
      </div>

      {battleLog.length > 0 && (
        <div className="card card-wide">
          <h3>Battle Log</h3>
          <ul className="battle-log">{battleLog.map((l, i) => <li key={i}>{l}</li>)}</ul>
        </div>
      )}
    </section>
  );
}

function HeroCard({ heroId }) {
  const { data: stats } = useReadContract({
    address: HERO, abi: GameHeroAbi.abi, functionName: 'heroStats', args: [BigInt(heroId)],
    query: { enabled: heroId !== null },
  });
  if (!stats) return null;
  const [heroClass, power, speed, defense, luck, rarity] = stats;
  return (
    <div className="hero-card">
      <span className={`rarity rarity-${rarity}`}>{RARITY[rarity]}</span>
      <strong>{CLASSES[heroClass]}</strong>
      <span>⚔ {power} 🛡 {defense} ⚡ {speed}</span>
    </div>
  );
}

export { HeroCard, RARITY, CLASSES, WEAPON_TYPES };
