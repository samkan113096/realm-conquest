/**
 * Community airdrop campaign tool (admin / DISTRIBUTOR_ROLE).
 *
 * Set allocations (LOOT amounts, not wei — script converts):
 *   RECIPIENTS=0xAbc:1000,0xDef:500 npx hardhat run scripts/airdrop-campaign.js --network sepolia
 *
 * Execute push airdrop for addresses that have allocations:
 *   DROP=0xAbc,0xDef npx hardhat run scripts/airdrop-campaign.js --network sepolia
 *
 * Deploy airdrop + disable old faucet minter (one-time on existing Sepolia):
 *   npx hardhat run scripts/setup-airdrop-sepolia.js --network sepolia
 */
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

function loadAddresses() {
  const p = path.join(__dirname, "..", "deployments", `${hre.network.name}.json`);
  if (!fs.existsSync(p)) throw new Error(`Missing ${p}`);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function parseRecipients(raw) {
  return raw.split(",").map((entry) => {
    const [addr, amountStr] = entry.trim().split(":");
    if (!addr || !amountStr) throw new Error(`Bad entry "${entry}" — use 0xAddr:amount`);
    return { address: addr, amount: hre.ethers.parseEther(amountStr.trim()) };
  });
}

async function main() {
  const addresses = loadAddresses();
  if (!addresses.LootAirdrop) {
    throw new Error("LootAirdrop not deployed — run setup-airdrop-sepolia.js first");
  }

  const [admin] = await hre.ethers.getSigners();
  const airdrop = await hre.ethers.getContractAt("LootAirdrop", addresses.LootAirdrop);

  const setRaw = process.env.RECIPIENTS;
  const dropRaw = process.env.DROP;

  if (setRaw) {
    const rows = parseRecipients(setRaw);
    const addrs = rows.map((r) => r.address);
    const amounts = rows.map((r) => r.amount);
    const tx = await airdrop.setAllocations(addrs, amounts);
    await tx.wait();
    console.log(`✓ Set ${rows.length} allocation(s)`);
    for (const r of rows) {
      console.log(`  ${r.address} → ${hre.ethers.formatEther(r.amount)} LOOT`);
    }
  }

  if (dropRaw) {
    const addrs = dropRaw.split(",").map((a) => a.trim()).filter(Boolean);
    const tx = await airdrop.airdropBatch(addrs);
    await tx.wait();
    console.log(`✓ Airdropped to ${addrs.length} address(es)`);
    const token = await hre.ethers.getContractAt("GameToken", addresses.GameToken);
    for (const a of addrs) {
      const bal = await token.balanceOf(a);
      console.log(`  ${a} balance: ${hre.ethers.formatEther(bal)} LOOT`);
    }
  }

  if (!setRaw && !dropRaw) {
    console.log("Set RECIPIENTS=0xAddr:amount,... and/or DROP=0xAddr,... to run a campaign step.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
