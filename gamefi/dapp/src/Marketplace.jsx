import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, usePublicClient } from 'wagmi';
import { parseEther, formatEther, isAddressEqual, maxUint256 } from 'viem';
import addresses from './abis/addresses.json';
import GameMarketplaceAbi from './abis/GameMarketplace.json';
import GameHeroAbi from './abis/GameHero.json';
import GameWeaponAbi from './abis/GameWeapon.json';
import GameTokenAbi from './abis/GameToken.json';
import { simulateAndWrite, formatContractError } from './mintHelpers';
import { useOwnedNfts } from './useOwnedNfts';
import { NftPortrait, HeroStatsLoader, WeaponStatsLoader } from './NftPortrait';

const MARKET = addresses.GameMarketplace;
const HERO = addresses.GameHero;
const WEAPON = addresses.GameWeapon;
const TOKEN = addresses.GameToken;

export default function Marketplace({ onStatus }) {
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync, isPending } = useWriteContract();
  const targetChainId = Number(addresses.chainId);
  const wrongNetwork = isConnected && chain?.id !== targetChainId;

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listKind, setListKind] = useState('hero');
  const [listTokenId, setListTokenId] = useState('');
  const [listPrice, setListPrice] = useState('100');
  const { heroIds: myHeroIds, weaponIds: myWeaponIds, refresh: refreshMyNfts } = useOwnedNfts();

  const { data: nextListingId } = useReadContract({
    address: MARKET,
    abi: GameMarketplaceAbi.abi,
    functionName: 'nextListingId',
    query: { enabled: MARKET !== '0x0000000000000000000000000000000000000000' },
  });

  const loadListings = useCallback(async () => {
    if (!publicClient || nextListingId === undefined) return;
    setLoading(true);
    const count = Number(nextListingId);
    const active = [];
    for (let i = 0; i < count; i++) {
      try {
        const row = await publicClient.readContract({
          address: MARKET,
          abi: GameMarketplaceAbi.abi,
          functionName: 'listings',
          args: [BigInt(i)],
        });
        const [seller, nftContract, tokenId, price, activeFlag] = row;
        if (activeFlag) {
          active.push({
            id: i,
            seller,
            nftContract,
            tokenId: Number(tokenId),
            price,
            isHero: isAddressEqual(nftContract, HERO),
          });
        }
      } catch {
        /* skip */
      }
    }
    setListings(active);
    setLoading(false);
  }, [publicClient, nextListingId]);

  useEffect(() => {
    loadListings().catch(() => setLoading(false));
  }, [loadListings]);

  const buyListing = async (listing) => {
    if (!publicClient || !address || wrongNetwork) return;
    try {
      onStatus?.('Approve LOOT for purchase…');
      const allowance = await publicClient.readContract({
        address: TOKEN,
        abi: GameTokenAbi.abi,
        functionName: 'allowance',
        args: [address, MARKET],
      });
      if (allowance < listing.price) {
        await simulateAndWrite({
          publicClient,
          writeContractAsync,
          account: address,
          onStatus,
          label: 'Approve LOOT in MetaMask…',
          request: {
            address: TOKEN,
            abi: GameTokenAbi.abi,
            functionName: 'approve',
            args: [MARKET, maxUint256],
          },
        });
      }
      await simulateAndWrite({
        publicClient,
        writeContractAsync,
        account: address,
        onStatus,
        label: 'Confirm purchase in MetaMask…',
        request: {
          address: MARKET,
          abi: GameMarketplaceAbi.abi,
          functionName: 'buy',
          args: [BigInt(listing.id)],
        },
      });
      onStatus?.('NFT purchased!');
      await loadListings();
      await refreshMyNfts();
    } catch (e) {
      onStatus?.(formatContractError(e));
    }
  };

  const cancelListing = async (listingId) => {
    if (!publicClient || !address) return;
    try {
      await simulateAndWrite({
        publicClient,
        writeContractAsync,
        account: address,
        onStatus,
        label: 'Cancel listing in MetaMask…',
        request: {
          address: MARKET,
          abi: GameMarketplaceAbi.abi,
          functionName: 'cancel',
          args: [BigInt(listingId)],
        },
      });
      onStatus?.('Listing cancelled — NFT returned to wallet');
      await loadListings();
      await refreshMyNfts();
    } catch (e) {
      onStatus?.(formatContractError(e));
    }
  };

  const createListing = async () => {
    if (!publicClient || !address || wrongNetwork) return;
    const tokenId = Number(listTokenId);
    if (!tokenId && tokenId !== 0) {
      onStatus?.('Pick an NFT to list');
      return;
    }
    const nftContract = listKind === 'hero' ? HERO : WEAPON;
    const price = parseEther(listPrice || '0');
  if (price <= 0n) {
      onStatus?.('Enter a price greater than 0');
      return;
    }
    try {
      const approved = await publicClient.readContract({
        address: nftContract,
        abi: listKind === 'hero' ? GameHeroAbi.abi : GameWeaponAbi.abi,
        functionName: 'getApproved',
        args: [BigInt(tokenId)],
      });
      const approvedAll = await publicClient.readContract({
        address: nftContract,
        abi: listKind === 'hero' ? GameHeroAbi.abi : GameWeaponAbi.abi,
        functionName: 'isApprovedForAll',
        args: [address, MARKET],
      });
      if (!approvedAll && approved?.toLowerCase() !== MARKET.toLowerCase()) {
        await simulateAndWrite({
          publicClient,
          writeContractAsync,
          account: address,
          onStatus,
          label: 'Approve marketplace for NFT…',
          request: {
            address: nftContract,
            abi: listKind === 'hero' ? GameHeroAbi.abi : GameWeaponAbi.abi,
            functionName: 'setApprovalForAll',
            args: [MARKET, true],
          },
        });
      }
      await simulateAndWrite({
        publicClient,
        writeContractAsync,
        account: address,
        onStatus,
        label: 'Confirm listing in MetaMask…',
        request: {
          address: MARKET,
          abi: GameMarketplaceAbi.abi,
          functionName: 'list',
          args: [nftContract, BigInt(tokenId), price],
        },
      });
      onStatus?.('Listed on marketplace!');
      setListTokenId('');
      await loadListings();
      await refreshMyNfts();
    } catch (e) {
      onStatus?.(formatContractError(e));
    }
  };

  const myIds = listKind === 'hero' ? myHeroIds : myWeaponIds;

  return (
    <section className="grid">
      {wrongNetwork && (
        <p className="warn card-wide">Switch to Ethereum Sepolia to use the marketplace.</p>
      )}

      <div className="card card-wide">
        <h2>NFT Marketplace</h2>
        <p className="muted">Buy and sell named CLOOT heroes & WLOOT weapons for LOOT. 2.5% fee to treasury.</p>
      </div>

      <div className="card card-wide">
        <div className="marketplace-header">
          <h3>Active Listings {loading ? '…' : `(${listings.length})`}</h3>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => loadListings()} disabled={loading}>
            Refresh
          </button>
        </div>
        {!listings.length && !loading && (
          <p className="muted">No listings yet — be the first to list a hero or weapon below.</p>
        )}
        <div className="nft-grid">
          {listings.map((l) => (
            <div key={l.id} className="market-listing card">
              {l.isHero ? (
                <HeroStatsLoader heroId={l.tokenId}>
                  {(stats) => (
                    <>
                      <NftPortrait kind="hero" tokenId={l.tokenId} stats={stats} compact />
                      <p className="market-price"><strong>{formatEther(l.price)} LOOT</strong></p>
                      <p className="muted market-seller">Seller {l.seller.slice(0, 6)}…{l.seller.slice(-4)}</p>
                      {address?.toLowerCase() === l.seller.toLowerCase() ? (
                        <button type="button" className="btn btn-ghost" disabled={isPending} onClick={() => cancelListing(l.id)}>Cancel</button>
                      ) : (
                        <button type="button" className="btn btn-primary" disabled={!isConnected || isPending || wrongNetwork} onClick={() => buyListing(l)}>Buy</button>
                      )}
                    </>
                  )}
                </HeroStatsLoader>
              ) : (
                <WeaponStatsLoader weaponId={l.tokenId}>
                  {(stats) => (
                    <>
                      <NftPortrait kind="weapon" tokenId={l.tokenId} stats={stats} compact />
                      <p className="market-price"><strong>{formatEther(l.price)} LOOT</strong></p>
                      <p className="muted market-seller">Seller {l.seller.slice(0, 6)}…{l.seller.slice(-4)}</p>
                      {address?.toLowerCase() === l.seller.toLowerCase() ? (
                        <button type="button" className="btn btn-ghost" disabled={isPending} onClick={() => cancelListing(l.id)}>Cancel</button>
                      ) : (
                        <button type="button" className="btn btn-primary" disabled={!isConnected || isPending || wrongNetwork} onClick={() => buyListing(l)}>Buy</button>
                      )}
                    </>
                  )}
                </WeaponStatsLoader>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card card-wide">
        <h3>List Your NFT</h3>
        <div className="market-list-tabs">
          <button type="button" className={`tab ${listKind === 'hero' ? 'active' : ''}`} onClick={() => { setListKind('hero'); setListTokenId(''); }}>Heroes ({myHeroIds.length})</button>
          <button type="button" className={`tab ${listKind === 'weapon' ? 'active' : ''}`} onClick={() => { setListKind('weapon'); setListTokenId(''); }}>Weapons ({myWeaponIds.length})</button>
        </div>
        {!myIds.length && <p className="muted">Mint NFTs in the Play tab first.</p>}
        <div className="nft-grid nft-grid-select">
          {listKind === 'hero' && myHeroIds.map((id) => (
            <HeroStatsLoader key={id} heroId={id}>
              {(stats) => (
                <NftPortrait
                  kind="hero"
                  tokenId={id}
                  stats={stats}
                  selected={String(listTokenId) === String(id)}
                  onClick={() => setListTokenId(String(id))}
                  compact
                />
              )}
            </HeroStatsLoader>
          ))}
          {listKind === 'weapon' && myWeaponIds.map((id) => (
            <WeaponStatsLoader key={id} weaponId={id}>
              {(stats) => (
                <NftPortrait
                  kind="weapon"
                  tokenId={id}
                  stats={stats}
                  selected={String(listTokenId) === String(id)}
                  onClick={() => setListTokenId(String(id))}
                  compact
                />
              )}
            </WeaponStatsLoader>
          ))}
        </div>
        <div className="market-list-form">
          <input className="input" value={listPrice} onChange={(e) => setListPrice(e.target.value)} placeholder="Price in LOOT" />
          <button type="button" className="btn btn-primary" disabled={!isConnected || isPending || wrongNetwork || listTokenId === ''} onClick={createListing}>
            List for sale
          </button>
        </div>
      </div>
    </section>
  );
}
