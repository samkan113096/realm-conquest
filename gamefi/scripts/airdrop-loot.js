/**
 * Send LOOT to a player wallet on Sepolia.
 * Usage: RECIPIENT=0x... AMOUNT=5000 npx hardhat run scripts/airdrop-loot.js --network sepolia
 */
const hre = require("hardhat");
const addresses = require("../deployments/sepolia.json");

async function main() {
  const recipient = process.env.RECIPIENT || "0x9270209A465b466b7a25865B61e1878953AFE676";
  const amount = hre.ethers.parseEther(process.env.AMOUNT || "10000");

  const [deployer] = await hre.ethers.getSigners();
  const token = await hre.ethers.getContractAt("GameToken", addresses.GameToken);

  const balBefore = await token.balanceOf(recipient);
  const tx = await token.transfer(recipient, amount);
  await tx.wait();
  const balAfter = await token.balanceOf(recipient);

  console.log("From:", deployer.address);
  console.log("To:", recipient);
  console.log("Sent:", hre.ethers.formatEther(amount), "LOOT");
  console.log("Balance before:", hre.ethers.formatEther(balBefore));
  console.log("Balance after:", hre.ethers.formatEther(balAfter));
}

main().catch(e => { console.error(e); process.exit(1); });
