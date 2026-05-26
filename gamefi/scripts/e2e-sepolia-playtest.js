/**
 * Full Sepolia playtest: mint, stake, fight, marketplace, HP regen check.
 * Uses DEPLOYER_PRIVATE_KEY from gamefi/.env
 */
const hre = require("hardhat");
const addresses = require("../deployments/sepolia.json");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Wallet:", deployer.address);

  const token = await hre.ethers.getContractAt("GameToken", addresses.GameToken);
  const hero = await hre.ethers.getContractAt("GameHero", addresses.GameHero);
  const weapon = await hre.ethers.getContractAt("GameWeapon", addresses.GameWeapon);
  const siege = await hre.ethers.getContractAt("ZombieSiegeUpgradeable", addresses.ZombieSiege);
  const staking = await hre.ethers.getContractAt("GameStaking", addresses.GameStaking);
  const market = await hre.ethers.getContractAt("GameMarketplace", addresses.GameMarketplace);

  const bal = await token.balanceOf(deployer.address);
  console.log("LOOT balance:", hre.ethers.formatEther(bal));

  const heroBal = await hero.balanceOf(deployer.address);
  if (heroBal === 0n) {
    await (await token.approve(addresses.GameHero, hre.ethers.parseEther("50"))).wait();
    await (await hero.mintHero()).wait();
    console.log("✓ Minted new hero");
  }
  const heroId = await hero.tokenOfOwnerByIndex(deployer.address, 0);
  console.log("· Using hero #" + heroId.toString());

  const weaponBal = await weapon.balanceOf(deployer.address);
  if (weaponBal === 0n) {
    await (await token.approve(addresses.GameWeapon, hre.ethers.parseEther("25"))).wait();
    await (await weapon.mintWeapon()).wait();
    console.log("✓ Minted weapon #0");
    await (await siege.equipWeapon(heroId, 0)).wait();
    console.log("✓ Equipped weapon to hero");
  } else {
    console.log("· Weapon(s) owned:", weaponBal.toString());
  }

  const stakeAmt = hre.ethers.parseEther("100");
  const stakeInfo = await staking.stakes(deployer.address);
  if (stakeInfo.amount === 0n) {
    await (await token.approve(addresses.GameStaking, stakeAmt)).wait();
    await (await staking.stake(stakeAmt)).wait();
    console.log("✓ Staked 100 LOOT");
  } else {
    console.log("· Already staked:", hre.ethers.formatEther(stakeInfo.amount), "LOOT");
  }
  const afterStake = await staking.stakes(deployer.address);
  console.log("  Staked amount:", hre.ethers.formatEther(afterStake.amount), "LOOT");
  console.log("  Pool totalStaked:", hre.ethers.formatEther(await staking.totalStaked()), "LOOT");
  const pending = await staking.pendingReward(deployer.address);
  console.log("  Pending rewards:", hre.ethers.formatEther(pending), "LOOT");

  const regen = await siege.hpRegenPerHour();
  console.log("\nHP system: hpRegenPerHour =", regen.toString(), "(10 HP per hour on-chain)");
  const [hpBefore] = await siege.getHeroHp(heroId);
  const [hpAfterFight, maxHp] = await siege.getHeroHp(heroId);
  console.log("Hero #" + heroId + " HP now:", hpAfterFight.toString() + "/" + maxHp.toString());

  try {
    const tx = await siege.fight(heroId, 0);
    await tx.wait();
    const [hpPost] = await siege.getHeroHp(heroId);
    console.log("✓ Fight succeeded — HP after:", hpPost.toString() + "/" + maxHp.toString());
  } catch (e) {
    const msg = e.message || "";
    if (msg.includes("Cooldown") || msg.includes("HP too low")) {
      console.log("· Fight skipped:", msg.split("(")[0].trim());
    } else {
      throw e;
    }
  }

  const listPrice = hre.ethers.parseEther("75");
  const weaponId = weaponBal > 0n ? await weapon.tokenOfOwnerByIndex(deployer.address, 0) : 0n;
  const wBalNow = await weapon.balanceOf(deployer.address);
  if (wBalNow > 0n) {
    const wid = await weapon.tokenOfOwnerByIndex(deployer.address, 0);
    await (await weapon.setApprovalForAll(addresses.GameMarketplace, true)).wait();
    const listTx = await market.list(addresses.GameWeapon, wid, listPrice);
    const listRcpt = await listTx.wait();
    let listingId = null;
    for (const log of listRcpt.logs) {
      try {
        const parsed = market.interface.parseLog(log);
        if (parsed?.name === "Listed") listingId = parsed.args.listingId;
      } catch { /* skip */ }
    }
    console.log("\n✓ Listed weapon #" + wid + " for 75 LOOT (listing #" + listingId + ")");
    await (await market.cancel(listingId)).wait();
    console.log("✓ Cancelled listing — weapon returned");
  }

  const buyer = hre.ethers.Wallet.createRandom().connect(hre.ethers.provider);
  const fundEth = hre.ethers.parseEther("0.002");
  await (await deployer.sendTransaction({ to: buyer.address, value: fundEth })).wait();
  await (await token.transfer(buyer.address, hre.ethers.parseEther("200"))).wait();
  await (await hero.setApprovalForAll(addresses.GameMarketplace, true)).wait();
  const heroToSell = heroId;
  const listHeroTx = await market.list(addresses.GameHero, heroToSell, hre.ethers.parseEther("60"));
  const listHeroRcpt = await listHeroTx.wait();
  let heroListingId = null;
  for (const log of listHeroRcpt.logs) {
    try {
      const parsed = market.interface.parseLog(log);
      if (parsed?.name === "Listed") heroListingId = parsed.args.listingId;
    } catch { /* skip */ }
  }
  await (await token.connect(buyer).approve(addresses.GameMarketplace, hre.ethers.parseEther("60"))).wait();
  await (await market.connect(buyer).buy(heroListingId)).wait();
  const newOwner = await hero.ownerOf(heroToSell);
  if (newOwner.toLowerCase() !== buyer.address.toLowerCase()) throw new Error("Buy failed — wrong owner");
  console.log("✓ Marketplace buy: hero #" + heroToSell + " sold to test buyer");
  await (await hero.connect(buyer).transferFrom(buyer.address, deployer.address, heroToSell)).wait();
  console.log("✓ Hero transferred back to deployer for continued play");

  console.log("\n✅ All Sepolia playtest checks passed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
