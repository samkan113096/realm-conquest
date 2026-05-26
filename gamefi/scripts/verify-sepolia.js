const hre = require("hardhat");
const addresses = require("../deployments/sepolia.json");

async function main() {
  const [player] = await hre.ethers.getSigners();
  console.log("Deployer:", player.address);

  const token = await hre.ethers.getContractAt("GameToken", addresses.GameToken);
  const hero = await hre.ethers.getContractAt("GameHero", addresses.GameHero);
  const siege = await hre.ethers.getContractAt("ZombieSiegeUpgradeable", addresses.ZombieSiege);
  const rewards = await hre.ethers.getContractAt("GameRewards", addresses.GameRewards);

  const MINTER = await token.MINTER_ROLE();
  console.log("Siege has MINTER:", await token.hasRole(MINTER, addresses.ZombieSiege));
  console.log("Rewards has MINTER:", await token.hasRole(MINTER, addresses.GameRewards));
  console.log("Token symbol:", await token.symbol());
  console.log("Siege VERSION:", await siege.VERSION());
  console.log("hpRegenPerHour:", (await siege.hpRegenPerHour()).toString());

  const bal = await token.balanceOf(player.address);
  console.log("Deployer LOOT:", hre.ethers.formatEther(bal));

  if (bal >= hre.ethers.parseEther("50")) {
    await (await token.approve(addresses.GameHero, hre.ethers.parseEther("50"))).wait();
    await (await hero.mintHero()).wait();
    console.log("Minted test hero #0");
    const [hp] = await siege.getHeroHp(0);
    console.log("Hero HP:", hp.toString());
  }
  console.log("\n✓ Sepolia contracts verified");
}

main().catch(e => { console.error(e); process.exit(1); });
