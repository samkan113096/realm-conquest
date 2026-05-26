# Chain Loot — Sepolia Testnet Deployment

**Network:** Ethereum Sepolia (chain ID `11155111`)  
**Deployer:** `0x9270209A465b466b7a25865B61e1878953AFE676`

| Contract | Address |
|----------|---------|
| GameToken (LOOT) | `0xC9527141ECec9E9536F9268a3F79Cd62733DB5b9` |
| GameHero (CLOOT) | `0x8817a2A8EE8db77d8eFCF8FaE6355a49010a37F8` |
| GameWeapon (WLOOT) | `0xe192b156C797a146e6EBB12feFdA985742b33BDd` |
| ZombieSiege (UUPS proxy) | `0xF264752dA4d30a4F22fBA5587A5863B22622f024` |
| GameStaking | `0xb2266dFe74fd1761de2216AA1942CdF79ac7782F` |
| GameRewards | `0x8e95d43DD1BD7787945943A19c94b98d1dA0eD8d` (signed P2E only — **no faucet**) |
| LootAirdrop | `0xDb6233A690022Cf592BF5E26A837659e51605731` |
| GameMarketplace | `0xEf3D922c750eD99648de56Ff15D5690b96c4134b` |

## Live URLs

- **Landing:** https://golden-haupia-52c7c5.netlify.app
- **dApp:** https://tourmaline-naiad-7f3ed0.netlify.app

## Community airdrops (no public faucet)

1. Deploy airdrop + disable old faucet minter (keeps existing NFT addresses):

```bash
cd gamefi
npx hardhat run scripts/setup-airdrop-sepolia.js --network sepolia
```

2. Register campaign allocations (amounts in LOOT):

```bash
RECIPIENTS=0xWallet1:1000,0xWallet2:500 \
  npx hardhat run scripts/airdrop-campaign.js --network sepolia
```

3. Push mint to wallets:

```bash
DROP=0xWallet1,0xWallet2 \
  npx hardhat run scripts/airdrop-campaign.js --network sepolia
```

Or users call `claim()` on LootAirdrop if you use pull-model campaigns.

## Full redeploy (optional)

```bash
npm test
npm run deploy:sepolia
cd dapp && npm run build && netlify deploy --prod --dir=dist
```
