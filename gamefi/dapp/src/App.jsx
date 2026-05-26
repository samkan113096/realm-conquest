import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, usePublicClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { TARGET_CHAIN_ID } from './wagmi';
import addresses from './abis/addresses.json';
import GameTokenAbi from './abis/GameToken.json';
import GameHeroAbi from './abis/GameHero.json';
import GameStakingAbi from './abis/GameStaking.json';
import ZombieSiegeGame from './ZombieSiegeGame.jsx';
import Marketplace from './Marketplace.jsx';
import HeroCollection from './HeroCollection.jsx';
import { approveAndMint, simulateAndWrite, formatContractError } from './mintHelpers';
import { maxUint256 } from 'viem';
import { SITE_URL } from './config';

const TOKEN = addresses.GameToken;
const HERO = addresses.GameHero;
const STAKING = addresses.GameStaking;

export default function App() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, error: connectError, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();
  const [tab, setTab] = useState('play');
  const [stakeAmount, setStakeAmount] = useState('100');
  const [unstakeAmount, setUnstakeAmount] = useState('50');
  const [playHeroId, setPlayHeroId] = useState(null);
  const [status, setStatus] = useState('');

  const { data: balance } = useReadContract({
    address: TOKEN, abi: GameTokenAbi.abi, functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && TOKEN !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: heroBalance } = useReadContract({
    address: HERO, abi: GameHeroAbi.abi, functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && HERO !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: totalHeroesMinted } = useReadContract({
    address: HERO, abi: GameHeroAbi.abi, functionName: 'totalMinted',
    query: { enabled: HERO !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: pendingReward } = useReadContract({
    address: STAKING, abi: GameStakingAbi.abi, functionName: 'pendingReward',
    args: address ? [address] : undefined,
    query: { enabled: !!address && STAKING !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: stakedInfo, refetch: refetchStake } = useReadContract({
    address: STAKING, abi: GameStakingAbi.abi, functionName: 'stakes',
    args: address ? [address] : undefined,
    query: { enabled: !!address && STAKING !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: totalStakedPool, refetch: refetchPool } = useReadContract({
    address: STAKING, abi: GameStakingAbi.abi, functionName: 'totalStaked',
    query: { enabled: STAKING !== '0x0000000000000000000000000000000000000000' },
  });

  const stakedLoot = stakedInfo?.[0] ?? 0n;

  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: txLoading } = useWaitForTransactionReceipt({ hash: txHash });
  const publicClient = usePublicClient();

  const contractsReady = TOKEN !== '0x0000000000000000000000000000000000000000';
  const targetChainId = Number(addresses.chainId) || TARGET_CHAIN_ID;
  const networkLabel = chain?.id === 31337 ? 'Hardhat Local' : chain?.name || 'Unknown';
  const wrongNetwork = isConnected && chain?.id !== targetChainId;

  const handleConnect = async () => {
    setStatus('');
    const connector = connectors.find(c => c.id === 'metaMask') || connectors.find(c => c.id === 'injected') || connectors[0];
    if (!connector) { setStatus('Install MetaMask to connect.'); return; }
    connect({ connector, chainId: targetChainId });
  };

  const handleSwitchNetwork = () => {
    setStatus('Switching to Sepolia…');
    switchChain({ chainId: targetChainId });
  };

  const stake = async () => {
    if (!publicClient || !address) return;
    if (wrongNetwork) {
      setStatus('Switch to Ethereum Sepolia first.');
      return;
    }
    try {
      const amount = parseEther(stakeAmount);
      const allowance = await publicClient.readContract({
        address: TOKEN, abi: GameTokenAbi.abi, functionName: 'allowance', args: [address, STAKING],
      });
      if (allowance < amount) {
        await simulateAndWrite({
          publicClient, writeContractAsync, account: address, onStatus: setStatus,
          label: 'Approve LOOT for staking…',
          request: { address: TOKEN, abi: GameTokenAbi.abi, functionName: 'approve', args: [STAKING, maxUint256] },
        });
      }
      await simulateAndWrite({
        publicClient, writeContractAsync, account: address, onStatus: setStatus,
        label: 'Confirm stake in MetaMask…',
        request: { address: STAKING, abi: GameStakingAbi.abi, functionName: 'stake', args: [amount] },
      });
      await refetchStake();
      await refetchPool();
      setStatus(`Staked ${stakeAmount} LOOT!`);
    } catch (e) { setStatus(formatContractError(e)); }
  };

  const unstake = async () => {
    if (!publicClient || !address) return;
    try {
      const amount = parseEther(unstakeAmount);
      await simulateAndWrite({
        publicClient, writeContractAsync, account: address, onStatus: setStatus,
        label: 'Confirm unstake in MetaMask…',
        request: { address: STAKING, abi: GameStakingAbi.abi, functionName: 'unstake', args: [amount] },
      });
      await refetchStake();
      await refetchPool();
      setStatus(`Unstaked ${unstakeAmount} LOOT`);
    } catch (e) { setStatus(formatContractError(e)); }
  };

  const claimStakeRewards = async () => {
    if (!publicClient || !address) return;
    try {
      await simulateAndWrite({
        publicClient, writeContractAsync, account: address, onStatus: setStatus,
        label: 'Claim staking rewards in MetaMask…',
        request: { address: STAKING, abi: GameStakingAbi.abi, functionName: 'claimRewards', args: [] },
      });
      setStatus('Rewards claimed!');
    } catch (e) { setStatus(formatContractError(e)); }
  };

  const mintHero = async () => {
    if (!publicClient || !address) return;
    if (wrongNetwork) {
      setStatus('Switch to Ethereum Sepolia (11155111) first.');
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
        onStatus: setStatus,
      });
      setStatus('Hero minted!');
    } catch (e) { setStatus(formatContractError(e)); }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <img src="/logo.png" alt="Chain Loot" className="logo-img" width="48" height="48" />
          <div><h1>Chain Loot</h1><p>Zombie Siege · On-Chain GameFi</p></div>
        </div>
        <div className="header-right">
          <a href={SITE_URL} className="btn btn-ghost btn-landing" title="Back to Chain Loot landing page">
            ← Landing
          </a>
          {wrongNetwork && (
            <button className="btn btn-secondary" disabled={isSwitchPending} onClick={() => switchChain({ chainId: targetChainId })}>
              Switch to {addresses.network === 'sepolia' ? 'Sepolia' : addresses.network === 'optimismSepolia' ? 'Optimism Sepolia' : 'Hardhat Local'}
            </button>
          )}
          {isConnected ? (
            <>
              <span className="chain-badge">{networkLabel}</span>
              <span className="wallet">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              <button className="btn btn-ghost" onClick={() => disconnect()}>Disconnect</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={handleConnect} disabled={isConnectPending}>
              {isConnectPending ? 'Connecting…' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </header>

      {connectError && <div className="banner banner-warn">{connectError.message}</div>}
      {wrongNetwork && (
        <div className="banner banner-warn banner-network">
          <span>⚠️ Wrong network — use <strong>Ethereum Sepolia</strong> (chain {targetChainId}), not Optimism.</span>
          <button type="button" className="btn btn-secondary" disabled={isSwitchPending} onClick={handleSwitchNetwork}>
            {isSwitchPending ? 'Switching…' : 'Switch to Sepolia'}
          </button>
        </div>
      )}
      {!contractsReady && (
        <div className="banner banner-warn">Run <code>cd gamefi && npm run deploy:local</code> with Hardhat node running.</div>
      )}

      <nav className="tabs">
        {['play', 'dashboard', 'heroes', 'staking', 'market'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'play' ? '🧟 Play' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>

      <main className="main">
        {tab === 'play' && (
          <ZombieSiegeGame
            onStatus={setStatus}
            initialHeroId={playHeroId}
            onHeroSelected={() => setPlayHeroId(null)}
          />
        )}

        {tab === 'dashboard' && (
          <section className="grid">
            <div className="card card-wide hero-banner">
              <img src="/hero.jpg" alt="Chain Loot" className="hero-banner-img" />
              <div className="hero-banner-text">
                <h2>Chain Loot GameFi</h2>
                <p className="muted">Mint heroes, fight zombies, earn LOOT on Sepolia testnet.</p>
              </div>
            </div>
            <StatCard label="LOOT Balance" value={balance ? formatEther(balance) : '—'} unit="LOOT" accent />
            <StatCard label="Your Heroes" value={heroBalance?.toString() ?? '—'} unit="NFTs" />
            <StatCard label="Heroes Minted (global)" value={totalHeroesMinted?.toString() ?? '—'} unit="/ 10k" />
            <StatCard label="Staked" value={stakedLoot ? formatEther(stakedLoot) : '0'} unit="LOOT" />
            <StatCard label="Pending Rewards" value={pendingReward ? formatEther(pendingReward) : '—'} unit="LOOT" />
            <div className="card card-wide">
              <h2>How to get LOOT</h2>
              <p className="muted">No free faucet — earn LOOT by fighting zombies in <strong>Play</strong>, trade on the <strong>Market</strong>, or receive a <strong>community airdrop</strong> when campaigns go live.</p>
              <div className="actions">
                <button className="btn btn-primary" onClick={() => setTab('play')}>Play Zombie Siege</button>
                <button className="btn btn-secondary" onClick={() => setTab('market')}>Marketplace</button>
              </div>
            </div>
          </section>
        )}

        {tab === 'heroes' && (
          <section className="grid">
            <div className="card card-wide">
              <HeroCollection
                onPlay={(id) => {
                  setPlayHeroId(id);
                  setTab('play');
                }}
              />
            </div>
            <div className="card">
              <img src="/hero-nft.png" alt="Hero NFT" className="nft-preview" />
              <h2>Mint Hero NFT</h2>
              <p className="muted">5 classes · 5 rarity tiers · named CLOOT heroes with on-chain stats</p>
              <p className="muted">{totalHeroesMinted?.toString() ?? 0} / 10,000 minted globally</p>
              <button className="btn btn-primary btn-lg" onClick={mintHero} disabled={!isConnected || isPending || wrongNetwork}>
                Mint for 50 LOOT
              </button>
            </div>
          </section>
        )}

        {tab === 'staking' && (
          <section className="grid">
            <div className="card card-accent">
              <h2>Your Stake</h2>
              <div className="staking-summary">
                <div className="staking-stat">
                  <span className="stat-label">You have staked</span>
                  <span className="stat-value staking-big">{formatEther(stakedLoot)}</span>
                  <span className="stat-unit">LOOT</span>
                </div>
                <div className="staking-stat">
                  <span className="stat-label">Pending rewards</span>
                  <span className="stat-value">{pendingReward ? formatEther(pendingReward) : '0'}</span>
                  <span className="stat-unit">LOOT</span>
                </div>
                <div className="staking-stat">
                  <span className="stat-label">Total pool staked</span>
                  <span className="stat-value">{totalStakedPool ? formatEther(totalStakedPool) : '0'}</span>
                  <span className="stat-unit">LOOT</span>
                </div>
              </div>
              <button className="btn btn-secondary" onClick={claimStakeRewards} disabled={!isConnected || isPending || wrongNetwork}>
                Claim Rewards
              </button>
            </div>
            <div className="card">
              <h2>Stake more LOOT</h2>
              <p className="muted">Stake LOOT to earn passive rewards from the pool.</p>
              <input className="input" value={stakeAmount} onChange={e => setStakeAmount(e.target.value)} placeholder="Amount to stake" />
              <button className="btn btn-primary" onClick={stake} disabled={!isConnected || isPending || wrongNetwork}>Stake</button>
            </div>
            <div className="card">
              <h2>Unstake</h2>
              <p className="muted">Withdraw staked LOOT back to your wallet.</p>
              <input className="input" value={unstakeAmount} onChange={e => setUnstakeAmount(e.target.value)} placeholder="Amount to unstake" />
              <button className="btn btn-ghost" onClick={unstake} disabled={!isConnected || isPending || wrongNetwork || stakedLoot === 0n}>
                Unstake
              </button>
            </div>
          </section>
        )}

        {tab === 'market' && <Marketplace onStatus={setStatus} />}

        {(status || isPending || txLoading) && (
          <div className="status-bar">
            {isPending && !status ? 'Waiting for MetaMask…' : status || (txLoading ? 'Confirming on-chain…' : '')}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Chain Loot · Zombie Siege · Sepolia Testnet</p>
        <a href={SITE_URL} className="footer-link">← Back to landing page</a>
      </footer>
    </div>
  );
}

function StatCard({ label, value, unit, accent, inline }) {
  return (
    <div className={`card ${inline ? 'card-inline' : ''} ${accent ? 'card-accent' : ''}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {unit && <span className="stat-unit">{unit}</span>}
    </div>
  );
}
