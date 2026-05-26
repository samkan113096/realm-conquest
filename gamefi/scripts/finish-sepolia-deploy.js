/**
 * Finish deployment setup (minter roles + staking fund) after partial deploy.
 */
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const ADDRESSES = {
  network: "sepolia",
  chainId: "11155111",
  deployer: "0x9270209A465b466b7a25865B61e1878953AFE676",
  GameToken: "0xdEd7008da799D3B5d77c4D096890bcE4DC7FAc73",
  GameHero: "0x7a4495DE22911712f35b060A6fC2934d0055956c",
  GameWeapon: "0x1a79160eb794C65D8C96Bb6741Ac39BF2fe806CE",
  ZombieSiege: "0x8851Bb60BCecf8D4460dFfe25E1BA9EF86Ee1833",
  ZombieSiegeImplementation: "0x1917a6a5c61a36d5A6Edb1E13B8c805F3cFd6582",
  upgradeable: true,
  proxyKind: "UUPS",
  GameStaking: "0x696d67AB60b110BDe1e9470D12fe399EfAb577Da",
  GameRewards: "0xE70c5444b7D8FE8A624DcC59Da3c8e8371760081",
  GameMarketplace: "0x07e548c54A0935ae5E3d8944969F9F54452961c8",
};

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const token = await hre.ethers.getContractAt("GameToken", ADDRESSES.GameToken);
  const staking = await hre.ethers.getContractAt("GameStaking", ADDRESSES.GameStaking);
  const MINTER = await token.MINTER_ROLE();

  for (const addr of [ADDRESSES.GameRewards, ADDRESSES.GameStaking, ADDRESSES.ZombieSiege]) {
    if (!(await token.hasRole(MINTER, addr))) {
      const tx = await token.grantRole(MINTER, addr);
      await tx.wait();
      console.log("Granted MINTER to", addr);
      await sleep(4000);
    } else {
      console.log("Already minter:", addr);
    }
  }

  const allowance = await token.allowance(ADDRESSES.deployer, ADDRESSES.GameStaking);
  if (allowance < hre.ethers.parseEther("1000000")) {
    const tx = await token.approve(ADDRESSES.GameStaking, hre.ethers.parseEther("1000000"));
    await tx.wait();
    console.log("Approved staking");
    await sleep(4000);
  }

  const tx = await staking.fundRewards(hre.ethers.parseEther("500000"));
  await tx.wait();
  console.log("Funded staking rewards");

  ADDRESSES.deployedAt = new Date().toISOString();
  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "sepolia.json"), JSON.stringify(ADDRESSES, null, 2));

  const dappAbiDir = path.join(__dirname, "..", "dapp", "src", "abis");
  fs.writeFileSync(path.join(dappAbiDir, "addresses.json"), JSON.stringify(ADDRESSES, null, 2));
  console.log("Saved addresses.json for dApp");
}

main().catch(err => { console.error(err); process.exit(1); });
