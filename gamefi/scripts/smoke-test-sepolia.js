#!/usr/bin/env node
/** Read-only smoke test — Sepolia contracts + RPC reachable */
const hre = require('hardhat');
const addresses = require('../deployments/sepolia.json');

async function main() {
  const deployer = addresses.deployer;
  console.log('Network: Sepolia', addresses.chainId);
  console.log('Deployer:', deployer);

  const token = await hre.ethers.getContractAt('GameToken', addresses.GameToken);
  const hero = await hre.ethers.getContractAt('GameHero', addresses.GameHero);
  const weapon = await hre.ethers.getContractAt('GameWeapon', addresses.GameWeapon);
  const siege = await hre.ethers.getContractAt('ZombieSiegeUpgradeable', addresses.ZombieSiege);
  const MINTER = await token.MINTER_ROLE();

  const symbol = await token.symbol();
  const bal = await token.balanceOf(deployer);
  const heroes = await hero.totalMinted();
  const version = await siege.VERSION();
  const heroPrice = await hero.mintPrice();
  const weaponPrice = await weapon.mintPrice();

  console.log('Token:', symbol, '| deployer balance:', hre.ethers.formatEther(bal));
  console.log('Heroes minted:', heroes.toString(), '| mintPrice:', hre.ethers.formatEther(heroPrice));
  console.log('Weapon mintPrice:', hre.ethers.formatEther(weaponPrice));
  console.log('ZombieSiege VERSION:', version);

  const allowance = await token.allowance(deployer, addresses.GameHero);
  console.log('LOOT allowance for GameHero:', hre.ethers.formatEther(allowance));
  if (allowance >= heroPrice) {
    await hero.mintHero.staticCall({ from: deployer });
    console.log('staticCall mintHero: OK');
  } else {
    console.log('staticCall mintHero: skipped (need approve first — dApp handles this)');
  }

  if (addresses.LootAirdrop) {
    const airdrop = await hre.ethers.getContractAt('LootAirdrop', addresses.LootAirdrop);
    const pending = await airdrop.pending(deployer);
    console.log('LootAirdrop pending (deployer):', hre.ethers.formatEther(pending), 'LOOT');
    console.log('GameRewards has MINTER (faucet):', await token.hasRole(MINTER, addresses.GameRewards));
  }

  console.log('\n✓ Sepolia smoke test passed');
}

main().catch((e) => {
  console.error('✗ Smoke test failed:', e.message);
  process.exit(1);
});
