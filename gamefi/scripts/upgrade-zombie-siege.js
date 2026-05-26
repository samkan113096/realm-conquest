/**
 * Upgrade ZombieSiege UUPS proxy to latest implementation.
 * Usage: npx hardhat run scripts/upgrade-zombie-siege.js --network hardhat
 */
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { upgrades } = hre;

async function main() {
  const net = hre.network.name;
  const deploymentPath = path.join(__dirname, "..", "deployments", `${net}.json`);
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`No deployment at ${deploymentPath}. Run deploy first.`);
  }
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const proxyAddr = deployment.ZombieSiege;
  if (!proxyAddr) throw new Error("ZombieSiege proxy address missing from deployment");

  console.log("Upgrading ZombieSiege proxy:", proxyAddr);
  const Factory = await hre.ethers.getContractFactory("ZombieSiegeUpgradeable");
  const upgraded = await upgrades.upgradeProxy(proxyAddr, Factory, { kind: "uups" });
  await upgraded.waitForDeployment();

  const newImpl = await upgrades.erc1967.getImplementationAddress(proxyAddr);
  console.log("New implementation:", newImpl);

  deployment.ZombieSiegeImplementation = newImpl;
  deployment.upgradedAt = new Date().toISOString();
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));

  const dappAbiDir = path.join(__dirname, "..", "dapp", "src", "abis");
  const artifact = await hre.artifacts.readArtifact("ZombieSiegeUpgradeable");
  fs.writeFileSync(path.join(dappAbiDir, "ZombieSiege.json"), JSON.stringify(artifact, null, 2));
  deployment.ZombieSiege = proxyAddr;
  fs.writeFileSync(path.join(dappAbiDir, "addresses.json"), JSON.stringify(deployment, null, 2));

  console.log("Upgrade complete. Proxy address unchanged — dApp keeps working.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
