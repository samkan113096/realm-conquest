import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import addresses from './abis/addresses.json';
import GameHeroAbi from './abis/GameHero.json';
import GameWeaponAbi from './abis/GameWeapon.json';

const HERO = addresses.GameHero;
const WEAPON = addresses.GameWeapon;

export function useOwnedNfts() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [heroIds, setHeroIds] = useState([]);
  const [weaponIds, setWeaponIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!publicClient || !address || HERO === '0x0000000000000000000000000000000000000000') {
      setHeroIds([]);
      setWeaponIds([]);
      return;
    }
    setLoading(true);
    try {
      const hb = Number(await publicClient.readContract({
        address: HERO,
        abi: GameHeroAbi.abi,
        functionName: 'balanceOf',
        args: [address],
      }));
      const wb = Number(await publicClient.readContract({
        address: WEAPON,
        abi: GameWeaponAbi.abi,
        functionName: 'balanceOf',
        args: [address],
      }));
      const hIds = [];
      const wIds = [];
      for (let i = 0; i < hb; i++) {
        const id = await publicClient.readContract({
          address: HERO,
          abi: GameHeroAbi.abi,
          functionName: 'tokenOfOwnerByIndex',
          args: [address, BigInt(i)],
        });
        hIds.push(Number(id));
      }
      for (let i = 0; i < wb; i++) {
        const id = await publicClient.readContract({
          address: WEAPON,
          abi: GameWeaponAbi.abi,
          functionName: 'tokenOfOwnerByIndex',
          args: [address, BigInt(i)],
        });
        wIds.push(Number(id));
      }
      setHeroIds(hIds);
      setWeaponIds(wIds);
    } catch {
      /* keep previous */
    } finally {
      setLoading(false);
    }
  }, [address, publicClient]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  return {
    heroIds,
    weaponIds,
    loading,
    refresh,
    heroCount: heroIds.length,
    weaponCount: weaponIds.length,
  };
}
