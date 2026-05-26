const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { upgrades } = hre;

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const GameToken = await hre.ethers.getContractFactory("GameToken");
  const token = await GameToken.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log("GameToken (LOOT):", tokenAddr);

  const GameHero = await hre.ethers.getContractFactory("GameHero");
  const hero = await GameHero.deploy(deployer.address, tokenAddr, deployer.address);
  await hero.waitForDeployment();
  const heroAddr = await hero.getAddress();
  console.log("GameHero (CLOOT):", heroAddr);

  const GameWeapon = await hre.ethers.getContractFactory("GameWeapon");
  const weapon = await GameWeapon.deploy(deployer.address, tokenAddr, deployer.address);
  await weapon.waitForDeployment();
  const weaponAddr = await weapon.getAddress();
  console.log("GameWeapon (WLOOT):", weaponAddr);

  const ZombieSiegeUpgradeable = await hre.ethers.getContractFactory("ZombieSiegeUpgradeable");
  const siegeProxy = await upgrades.deployProxy(
    ZombieSiegeUpgradeable,
    [deployer.address, tokenAddr, heroAddr, weaponAddr],
    { kind: "uups", initializer: "initialize" }
  );
  await siegeProxy.waitForDeployment();
  const siegeAddr = await siegeProxy.getAddress();
  const siegeImpl = await upgrades.erc1967.getImplementationAddress(siegeAddr);
  console.log("ZombieSiege (UUPS proxy):", siegeAddr);
  console.log("ZombieSiege implementation:", siegeImpl);

  const GameStaking = await hre.ethers.getContractFactory("GameStaking");
  const staking = await GameStaking.deploy(deployer.address, tokenAddr, tokenAddr);
  await staking.waitForDeployment();
  const stakingAddr = await staking.getAddress();
  console.log("GameStaking:", stakingAddr);

  const GameRewards = await hre.ethers.getContractFactory("GameRewards");
  const rewards = await GameRewards.deploy(deployer.address, tokenAddr);
  await rewards.waitForDeployment();
  const rewardsAddr = await rewards.getAddress();
  console.log("GameRewards (signed P2E — no faucet):", rewardsAddr);

  const LootAirdrop = await hre.ethers.getContractFactory("LootAirdrop");
  const airdrop = await LootAirdrop.deploy(deployer.address, tokenAddr);
  await airdrop.waitForDeployment();
  const airdropAddr = await airdrop.getAddress();
  console.log("LootAirdrop:", airdropAddr);

  const GameMarketplace = await hre.ethers.getContractFactory("GameMarketplace");
  const market = await GameMarketplace.deploy(tokenAddr, deployer.address);
  await market.waitForDeployment();
  const marketAddr = await market.getAddress();
  console.log("GameMarketplace:", marketAddr);

  const MINTER = await token.MINTER_ROLE();
  for (const addr of [airdropAddr, stakingAddr, siegeAddr]) {
    const tx = await token.grantRole(MINTER, addr);
    await tx.wait();
    await new Promise(r => setTimeout(r, 3000));
  }

  const txApprove = await token.approve(stakingAddr, hre.ethers.parseEther("1000000"));
  await txApprove.wait();
  await new Promise(r => setTimeout(r, 3000));
  const txFund = await staking.fundRewards(hre.ethers.parseEther("500000"));
  await txFund.wait();

  const addresses = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    GameToken: tokenAddr,
    GameHero: heroAddr,
    GameWeapon: weaponAddr,
    ZombieSiege: siegeAddr,
    ZombieSiegeImplementation: siegeImpl,
    upgradeable: true,
    proxyKind: "UUPS",
    GameStaking: stakingAddr,
    GameRewards: rewardsAddr,
    LootAirdrop: airdropAddr,
    GameMarketplace: marketAddr,
    deployedAt: new Date().toISOString(),
  };

  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${hre.network.name}.json`), JSON.stringify(addresses, null, 2));

  const dappAbiDir = path.join(__dirname, "..", "dapp", "src", "abis");
  fs.mkdirSync(dappAbiDir, { recursive: true });
  const names = ["GameToken", "GameHero", "GameWeapon", "GameStaking", "GameRewards", "LootAirdrop", "GameMarketplace"];
  for (const name of names) {
    const artifact = await hre.artifacts.readArtifact(name);
    fs.writeFileSync(path.join(dappAbiDir, `${name}.json`), JSON.stringify(artifact, null, 2));
  }
  const siegeArtifact = await hre.artifacts.readArtifact("ZombieSiegeUpgradeable");
  fs.writeFileSync(path.join(dappAbiDir, "ZombieSiege.json"), JSON.stringify(siegeArtifact, null, 2));
  fs.writeFileSync(path.join(dappAbiDir, "addresses.json"), JSON.stringify(addresses, null, 2));

  console.log("\nDeployment saved. Proxy address used by dApp as ZombieSiege.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
