/**
 * Deploy LootAirdrop on existing network, grant MINTER, revoke GameRewards minter (disables faucet).
 * Updates deployments/*.json and dapp/src/abis/addresses.json
 */
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Admin:", deployer.address);

  const depPath = path.join(__dirname, "..", "deployments", `${hre.network.name}.json`);
  const addresses = JSON.parse(fs.readFileSync(depPath, "utf8"));

  const token = await hre.ethers.getContractAt("GameToken", addresses.GameToken);
  const MINTER = await token.MINTER_ROLE();

  if (addresses.LootAirdrop) {
    console.log("LootAirdrop already deployed:", addresses.LootAirdrop);
  } else {
    const LootAirdrop = await hre.ethers.getContractFactory("LootAirdrop");
    const airdrop = await LootAirdrop.deploy(deployer.address, addresses.GameToken);
    await airdrop.waitForDeployment();
    addresses.LootAirdrop = await airdrop.getAddress();
    console.log("LootAirdrop deployed:", addresses.LootAirdrop);

    if (!(await token.hasRole(MINTER, addresses.LootAirdrop))) {
      await (await token.grantRole(MINTER, addresses.LootAirdrop)).wait();
      console.log("✓ Granted MINTER to LootAirdrop");
    }
  }

  if (addresses.GameRewards && (await token.hasRole(MINTER, addresses.GameRewards))) {
    await (await token.revokeRole(MINTER, addresses.GameRewards)).wait();
    console.log("✓ Revoked MINTER from GameRewards — daily faucet disabled on-chain");
  }

  addresses.airdropNote = "Admin sets EOA allocations via setAllocations; distribute with airdropBatch or users claim()";
  addresses.updatedAt = new Date().toISOString();

  fs.writeFileSync(depPath, JSON.stringify(addresses, null, 2));

  const dappAbiDir = path.join(__dirname, "..", "dapp", "src", "abis");
  const artifact = await hre.artifacts.readArtifact("LootAirdrop");
  fs.writeFileSync(path.join(dappAbiDir, "LootAirdrop.json"), JSON.stringify(artifact, null, 2));
  fs.writeFileSync(path.join(dappAbiDir, "addresses.json"), JSON.stringify(addresses, null, 2));

  console.log("\n✓ Saved addresses. Run campaigns with scripts/airdrop-campaign.js");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
