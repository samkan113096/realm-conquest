/**
 * Generates 10 full Chain Loot blog posts + index.
 */
const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'site', 'blog');

const posts = [
  {
    slug: 'zombie-siege-guide',
    title: 'Zombie Siege — On-Chain Combat Guide',
    date: 'May 24, 2026',
    iso: '2026-05-24',
    desc: 'Complete guide to Chain Loot Zombie Siege — mint heroes, equip weapons, fight zombies on-chain, earn LOOT.',
    excerpt: 'How on-chain zombie combat works in Chain Loot.',
    body: `
<p><strong>Zombie Siege</strong> is Chain Loot's exclusive play-to-earn game. Unlike score-based systems, every battle is a smart contract transaction — no external games, no oracle signatures.</p>
<h2>Setup</h2>
<ol>
  <li>Mint a CLOOT hero (50 LOOT) — rolls class, rarity, and stats</li>
  <li>Mint a WLOOT weapon (25 LOOT) — optional but boosts combat power</li>
  <li>Call <code>equipWeapon(heroId, weaponId)</code> in the dApp Play tab</li>
</ol>
<h2>Combat Power</h2>
<p>Power = hero Power + Defense/2 + Speed/3 + Luck/5 + rarity bonus + class bonus + weapon damage. Check power in the dApp before picking a tier.</p>
<h2>Zombie Tiers</h2>
<ul>
  <li>Shambler (40 power) → 2 LOOT</li>
  <li>Runner (70) → 5 LOOT</li>
  <li>Brute (110) → 10 LOOT</li>
  <li>Elite (160) → 20 LOOT</li>
  <li>Necromancer (220) → 40 LOOT</li>
</ul>
<h2>Fighting</h2>
<p>Click <strong>Fight On-Chain</strong>. The contract rolls win chance from your power vs zombie tier. Wins mint LOOT. 30-second cooldown per hero. Epic/Legendary heroes get bonus rewards.</p>
<p>Read the full <a href="../tutorial.html">tutorial</a> or <a href="../audit.html">audit report</a>.</p>`,
  },
  {
    slug: 'what-is-chain-loot',
    title: 'What Is Chain Loot?',
    date: 'May 20, 2026',
    iso: '2026-05-20',
    desc: 'Chain Loot explained — standalone GameFi on Optimism with Zombie Siege, hero NFTs, and weapon gear.',
    excerpt: 'Everything you need to know about Chain Loot — independent GameFi on Optimism.',
    body: `
<p>Chain Loot is a <strong>standalone</strong> GameFi platform on Optimism. It is not tied to Realm Conquest, Neon Drift, Shadow Strike, or any other game — it has its own ecosystem built around <strong>Zombie Siege</strong>.</p>
<h2>Core Features</h2>
<ul>
  <li><strong>LOOT Token</strong> — ERC-20 with 1 billion max supply</li>
  <li><strong>Hero NFTs (CLOOT)</strong> — 5 classes, 5 rarities, 10,000 max</li>
  <li><strong>Weapon NFTs (WLOOT)</strong> — equippable gear, 20,000 max</li>
  <li><strong>Zombie Siege</strong> — on-chain zombie combat, LOOT rewards on win</li>
  <li><strong>Staking</strong> — passive LOOT emissions</li>
  <li><strong>Daily Faucet</strong> — 10 LOOT every 24 hours</li>
</ul>
<h2>Getting Started</h2>
<p>Connect MetaMask, open the <a href="http://localhost:5173">dApp</a>, claim daily LOOT, mint a hero, and fight zombies. See our <a href="../tutorial.html">tutorial</a>.</p>`,
  },
  {
    slug: 'how-to-stake-loot',
    title: 'How to Stake LOOT Tokens',
    date: 'May 18, 2026',
    iso: '2026-05-18',
    desc: 'Step-by-step guide to staking LOOT on Chain Loot. Deposit, earn passive rewards, and claim on Optimism.',
    excerpt: 'Passive income guide: stake LOOT and claim rewards on Optimism.',
    body: `
<p>Staking is the simplest way to grow your LOOT balance without grinding gameplay. Chain Loot uses a classic reward-per-share model — the more LOOT you stake, the larger your slice of emissions.</p>
<h2>Before You Stake</h2>
<ul>
  <li>Connect MetaMask to the Chain Loot dApp</li>
  <li>Hold LOOT in your wallet (claim the daily faucet or earn from gameplay first)</li>
  <li>Ensure you have a small amount of ETH on Optimism for gas</li>
</ul>
<h2>Step 1: Approve LOOT</h2>
<p>In the dApp <strong>Staking</strong> tab, enter the amount you want to stake. The first transaction approves the staking contract to spend your LOOT. Confirm in MetaMask.</p>
<h2>Step 2: Stake</h2>
<p>Click <strong>Stake</strong>. Your LOOT moves into the vault and starts accruing rewards immediately. The dashboard shows your staked balance and pending rewards in real time.</p>
<h2>Step 3: Claim Rewards</h2>
<p>Rewards accumulate continuously. When you are ready, click <strong>Claim Rewards</strong> — LOOT transfers to your wallet in one transaction. You can claim without unstaking.</p>
<h2>Unstaking</h2>
<p>To withdraw principal, use <strong>Unstake</strong> with the amount to release. Partial unstakes are supported. Your remaining stake continues earning.</p>
<h2>Tips</h2>
<ul>
  <li>Stake after claiming daily faucet to compound faster</li>
  <li>Check pending rewards weekly — gas is cheap on Optimism</li>
  <li>The treasury must fund the reward pool via <code>fundRewards()</code> — emissions depend on pool size</li>
</ul>`,
  },
  {
    slug: 'play-to-earn-guide',
    title: 'Play-to-Earn in Zombie Siege',
    date: 'May 15, 2026',
    iso: '2026-05-15',
    desc: 'Earn LOOT by fighting zombies on-chain in Chain Loot Zombie Siege. Hero rarity and weapons determine rewards.',
    excerpt: 'On-chain play-to-earn — fight zombies, earn LOOT.',
    body: `
<p>Chain Loot play-to-earn happens entirely in <strong>Zombie Siege</strong>. No external games, no score signers — you call <code>fight(heroId, tier)</code> and the smart contract resolves the battle and mints LOOT on victory.</p>
<h2>How It Works</h2>
<ol>
  <li>Mint or own a CLOOT hero NFT</li>
  <li>Optionally mint and equip a WLOOT weapon for higher combat power</li>
  <li>Select a zombie tier matching your power threshold</li>
  <li>Confirm the fight transaction in MetaMask</li>
  <li>Receive LOOT instantly on win</li>
</ol>
<h2>Reward Tiers</h2>
<p>Shambler 2 LOOT → Necromancer 40 LOOT. Epic and Legendary heroes earn bonus multipliers on top.</p>
<h2>Cooldown</h2>
<p>Each hero rests 30 seconds between fights — enforced on-chain to prevent spam.</p>
<p>See the <a href="zombie-siege-guide.html">Zombie Siege guide</a> for full details.</p>`,
  },
  {
    slug: 'hero-nft-rarity',
    title: 'Hero NFT Rarity Explained',
    date: 'May 12, 2026',
    iso: '2026-05-12',
    desc: 'Common to Legendary — how Chain Loot hero NFT stats, rarity tiers, and mint mechanics work on-chain.',
    excerpt: 'Common to Legendary — how Chain Loot hero stats work on-chain.',
    body: `
<p>Hero NFTs are ERC-721 tokens with on-chain metadata generated at mint time. Each hero has combat stats that may unlock future gameplay bonuses and marketplace value.</p>
<h2>Rarity Tiers</h2>
<ul>
  <li><strong>Common</strong> (60%) — base stats, entry-level collectibles</li>
  <li><strong>Uncommon</strong> (25%) — +10% stat boost</li>
  <li><strong>Rare</strong> (10%) — +25% stat boost</li>
  <li><strong>Epic</strong> (4%) — +50% stat boost</li>
  <li><strong>Legendary</strong> (1%) — +100% stat boost, unique visual traits</li>
</ul>
<h2>Stats</h2>
<p>Each hero rolls four attributes on mint:</p>
<ul>
  <li><strong>Power</strong> — offensive strength</li>
  <li><strong>Defense</strong> — damage reduction</li>
  <li><strong>Speed</strong> — action priority</li>
  <li><strong>Luck</strong> — bonus reward probability</li>
</ul>
<h2>Minting</h2>
<p>Mint costs 50 LOOT plus gas. Approve the GameHero contract, click <strong>Mint Hero</strong> in the dApp, and your NFT appears in the Heroes tab. Rarity is determined by on-chain randomness at mint — no pre-sale, no whitelist.</p>
<h2>Future Utility</h2>
<p>Heroes will boost play-to-earn multipliers when staked alongside LOOT. Legendary heroes may grant exclusive cosmetic skins in linked games. All utility is optional — games remain fully playable without NFTs.</p>`,
  },
  {
    slug: 'optimism-gamefi-2026',
    title: 'Why Optimism for GameFi in 2026',
    date: 'May 10, 2026',
    iso: '2026-05-10',
    desc: 'Low fees, fast finality, and OP Stack ecosystem — why Chain Loot chose Optimism for play-to-earn.',
    excerpt: 'Low fees, fast finality — why we built Chain Loot on OP Chain.',
    body: `
<p>GameFi lives or dies on transaction economics. If claiming a 10 LOOT daily reward costs $5 in gas, the model breaks. Chain Loot chose <strong>Optimism</strong> because L2 fees make micro-rewards viable.</p>
<h2>Fee Comparison</h2>
<p>On Ethereum mainnet, a simple ERC-20 transfer can cost $2–15. On Optimism, the same operation typically costs under $0.01. For games with frequent claims — daily faucets, score submissions, marketplace trades — L2 is essential.</p>
<h2>OP Stack Ecosystem</h2>
<p>Optimism's Superchain vision means Chain Loot can eventually bridge to Base, Mode, and other OP Stack chains without rewriting contracts. One deployment, multiple audiences.</p>
<h2>Developer Experience</h2>
<p>Hardhat, Foundry, and OpenZeppelin all support Optimism out of the box. Chain Loot contracts compile with Solidity 0.8.26 and deploy to Optimism Sepolia for testnet, then mainnet when ready.</p>
<h2>Security Model</h2>
<p>Optimism's fault-proof system inherits Ethereum security. Player funds on L2 are as safe as the rollup's implementation — and Optimism has years of mainnet battle-testing.</p>
<h2>What's Next</h2>
<p>We are targeting Optimism Sepolia for public testnet, then Optimism mainnet launch. Follow our <a href="../audit.html">security audit</a> and tutorial for launch milestones.</p>`,
  },
  {
    slug: 'daily-faucet-tips',
    title: 'Maximize Your Daily LOOT Faucet',
    date: 'May 8, 2026',
    iso: '2026-05-08',
    desc: 'Tips to grow your LOOT balance with the daily faucet. Timing, gas savings, and compounding strategies.',
    excerpt: 'Tips to grow your LOOT balance without spending gas.',
    body: `
<p>The daily faucet gives every wallet <strong>10 LOOT once per UTC day</strong>. It is the fastest way to bootstrap your balance before staking or minting heroes.</p>
<h2>How to Claim</h2>
<ol>
  <li>Connect wallet to the Chain Loot dApp</li>
  <li>Open the <strong>Dashboard</strong> or <strong>Play-to-Earn</strong> tab</li>
  <li>Click <strong>Claim Daily</strong></li>
  <li>Confirm the transaction in MetaMask</li>
</ol>
<p>The contract tracks claims by day index (<code>block.timestamp / 1 days</code>). Attempting a second claim reverts with "Already claimed today."</p>
<h2>Maximization Tips</h2>
<ul>
  <li><strong>Set a daily alarm</strong> — missing a day is lost LOOT forever</li>
  <li><strong>Stake immediately</strong> — 10 LOOT in the vault starts earning on day one</li>
  <li><strong>Batch with other actions</strong> — claim daily + check staking rewards in one session to save wallet opens</li>
  <li><strong>Use Optimism</strong> — gas is cents, not dollars</li>
</ul>
<h2>30-Day Projection</h2>
<p>Claiming every day for 30 days yields 300 LOOT from faucet alone — enough for 6 hero mints or a meaningful stake. Combine with play-to-earn for 500+ LOOT monthly on active play.</p>
<h2>Common Errors</h2>
<p>"Already claimed today" — wait until UTC midnight. "Insufficient funds for gas" — add a tiny amount of ETH to your Optimism wallet.</p>`,
  },
  {
    slug: 'wallet-setup-hardhat',
    title: 'Local Wallet Setup for Testing',
    date: 'May 5, 2026',
    iso: '2026-05-05',
    desc: 'Connect MetaMask to Hardhat local chain and test Chain Loot contracts without spending real ETH.',
    excerpt: 'Connect MetaMask to Hardhat and test Chain Loot locally.',
    body: `
<p>Before touching testnet ETH, develop locally with Hardhat. Chain Loot's full stack — contracts, signer, dApp — runs on your machine in minutes.</p>
<h2>Prerequisites</h2>
<ul>
  <li>Node.js 18+</li>
  <li>MetaMask browser extension</li>
  <li>Git clone of the gamefi folder</li>
</ul>
<h2>Step 1: Start Hardhat Node</h2>
<pre><code>cd gamefi
npx hardhat node</code></pre>
<p>This starts a local blockchain on <code>http://127.0.0.1:8545</code> with 20 pre-funded accounts.</p>
<h2>Step 2: Deploy Contracts</h2>
<pre><code>npm run deploy:local</code></pre>
<p>Addresses write to <code>dapp/src/abis/addresses.json</code>.</p>
<h2>Step 3: Add Hardhat Network to MetaMask</h2>
<ul>
  <li>Network name: <strong>Hardhat Local</strong></li>
  <li>RPC URL: <code>http://127.0.0.1:8545</code></li>
  <li>Chain ID: <strong>31337</strong></li>
  <li>Currency: ETH</li>
</ul>
<h2>Step 4: Import Test Account</h2>
<p>Hardhat account #0 private key (public test key, never use on mainnet):</p>
<pre><code>0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80</code></pre>
<h2>Step 5: Start Services</h2>
<pre><code>node server/signer.js   # port 3001
cd dapp && npm run dev  # port 5173</code></pre>
<p>Open <a href="http://localhost:5173">localhost:5173</a>, click Connect Wallet, and test every feature gas-free.</p>`,
  },
  {
    slug: 'marketplace-preview',
    title: 'NFT Marketplace Preview',
    date: 'May 3, 2026',
    iso: '2026-05-03',
    desc: 'Trade hero NFTs for LOOT on Chain Loot marketplace. Listing, buying, and settlement walkthrough.',
    excerpt: 'Trade hero NFTs for LOOT — marketplace walkthrough.',
    body: `
<p>The Chain Loot marketplace lets players trade hero NFTs peer-to-peer using LOOT as settlement currency. No ETH price floors — everything runs on the game's native token.</p>
<h2>Listing a Hero</h2>
<ol>
  <li>Go to the <strong>Market</strong> tab in the dApp</li>
  <li>Select a hero from your collection</li>
  <li>Set a LOOT price</li>
  <li>Approve the marketplace contract (one-time per collection)</li>
  <li>Confirm the list transaction</li>
</ol>
<h2>Buying a Hero</h2>
<p>Browse active listings, click <strong>Buy</strong>, approve LOOT spend if needed, and confirm. The NFT transfers to your wallet and LOOT goes to the seller atomically — no escrow risk.</p>
<h2>Fees</h2>
<p>A 2.5% protocol fee applies to each sale, paid in LOOT to the treasury. This funds ongoing reward pool emissions and development.</p>
<h2>Price Discovery</h2>
<p>Legendary heroes with high Power + Luck stats command premium prices. Commons typically trade near mint cost (50 LOOT). Check recent sales before listing.</p>
<h2>Safety</h2>
<p>Only buy through the official dApp contract. Never send LOOT directly to strangers promising NFT transfers — that is a scam pattern.</p>`,
  },
  {
    slug: 'security-best-practices',
    title: 'Web3 Gaming Security Tips',
    date: 'May 1, 2026',
    iso: '2026-05-01',
    desc: 'Protect your wallet while playing play-to-earn games. Phishing, approvals, and safe signing habits.',
    excerpt: 'Protect your wallet while playing play-to-earn games.',
    body: `
<p>GameFi attracts players and scammers alike. Follow these rules to keep your LOOT and NFTs safe.</p>
<h2>Wallet Hygiene</h2>
<ul>
  <li>Use a dedicated gaming wallet — not your main savings wallet</li>
  <li>Never share your seed phrase with anyone, including "support"</li>
  <li>Store seed phrases offline — paper or hardware, never cloud screenshots</li>
</ul>
<h2>Transaction Safety</h2>
<ul>
  <li>Read every MetaMask popup before signing</li>
  <li>Verify contract addresses match official deployments</li>
  <li>Revoke unlimited token approvals periodically via revoke.cash</li>
  <li>Be wary of "free airdrop" links in Discord or Telegram</li>
</ul>
<h2>Chain Loot Specific</h2>
<ul>
  <li>Official dApp: <code>localhost:5173</code> (dev) or chainloot.io (prod)</li>
  <li>Official site: port 3001 / chainloot.io — never enter keys on fake clones</li>
  <li>Play-to-earn via Zombie Siege — confirm fight txs in MetaMask, never send ETH to "unlock" rewards</li>
</ul>
<h2>Phishing Red Flags</h2>
<ul>
  <li>Urgent "your account will be deleted" messages</li>
  <li>URLs with typos: chain-loot.com, chainloot.net</li>
  <li>DMs offering to "double your LOOT"</li>
</ul>
<p>Report scams to <a href="mailto:support@chainloot.io">support@chainloot.io</a> and warn the community on <a href="https://t.me/chainloot">Telegram</a>.</p>`,
  },
  {
    slug: 'smart-contract-audit-2026',
    title: 'Smart Contract Audit Results',
    date: 'May 23, 2026',
    iso: '2026-05-23',
    desc: 'May 2026 security review of Chain Loot contracts. UUPS upgradeable Zombie Siege, P2E LOOT rewards, supply caps — no critical issues.',
    excerpt: 'May 2026 security review — UUPS upgradeable P2E, no critical issues.',
    body: `
<p>We completed a full security review of all seven Chain Loot smart contracts including the upgradeable Zombie Siege play-to-earn combat system.</p>
<h2>Contracts Reviewed</h2>
<ul>
  <li>GameToken.sol — ERC-20 LOOT with MAX_SUPPLY</li>
  <li>GameHero.sol — CLOOT hero NFTs</li>
  <li>GameWeapon.sol — WLOOT weapon NFTs</li>
  <li>ZombieSiegeUpgradeable.sol — UUPS proxy; fight(), previewReward(), LOOT on victory</li>
  <li>GameStaking.sol — staking vault</li>
  <li>GameRewards.sol — daily faucet</li>
  <li>GameMarketplace.sol — NFT marketplace</li>
</ul>
<h2>Upgradeability</h2>
<p>Zombie Siege uses an ERC-1967 UUPS proxy so gameplay can evolve without migrating NFTs. UPGRADER_ROLE gates implementation upgrades; a 39-slot storage gap preserves layout for future features.</p>
<h2>Test Results</h2>
<p>Hardhat suite: <strong>6/6 passing</strong> — hero mint, weapon equip, zombie fight + LOOT mint, UUPS upgrade, daily faucet, staking rewards.</p>
<h2>Key Passes</h2>
<ul>
  <li>Custom nonReentrant on upgradeable Zombie Siege</li>
  <li>AccessControl for minter and UPGRADER roles</li>
  <li>On-chain P2E — victory mints LOOT via MINTER_ROLE on proxy</li>
  <li>Hero/weapon supply caps enforced (10k / 20k)</li>
  <li>1 billion LOOT max supply cap</li>
</ul>
<h2>Findings</h2>
<p><strong>Low:</strong> Centralized admin / UPGRADER keys — recommend Gnosis Safe multisig.<br>
<strong>Low:</strong> Each UUPS upgrade must preserve storage layout.<br>
<strong>Info:</strong> Fight randomness uses block.prevrandao — consider Chainlink VRF for mainnet.</p>
<h2>Full Report</h2>
<p>Read the complete audit at <a href="../audit.html">audit.html</a> including recommendations for third-party review before mainnet launch.</p>`,
  },
];

function shell(title, desc, canonical, body, date, iso) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Chain Loot Blog</title>
  <meta name="description" content="${desc}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://chainloot.io/blog/${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="https://chainloot.io/assets/hero.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="../css/site.css">
  <link rel="icon" href="../assets/logo.png" type="image/png">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Orbitron:wght@700&display=swap" rel="stylesheet">
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"BlogPosting","headline":"${title.replace(/"/g, '\\"')}","datePublished":"${iso}","author":{"@type":"Organization","name":"Chain Loot"},"publisher":{"@type":"Organization","name":"Chain Loot"},"description":"${desc.replace(/"/g, '\\"')}"}
  </script>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <a href="/" class="logo"><img class="logo-mark" src="../assets/logo.png" alt="" width="40" height="40"> Chain Loot</a>
      <nav class="site-nav"><ul>
        <li><a href="../tutorial.html">Tutorial</a></li>
        <li><a href="index.html">Blog</a></li>
        <li><a href="http://localhost:5173" class="btn btn-primary" style="padding:0.35rem 0.85rem;font-size:0.8rem">Launch dApp</a></li>
      </ul></nav>
    </div>
  </header>
  <div class="page-hero container"><h1>${title}</h1><p class="meta">${date} · Chain Loot GameFi</p></div>
  <article class="prose">${body}
    <p style="margin-top:2rem"><a href="index.html">← All blog posts</a> · <a href="../tutorial.html">Tutorial</a> · <a href="http://localhost:5173">Launch dApp</a></p>
  </article>
  <footer class="site-footer">
    <div class="footer-legal"><a href="../privacy.html">Privacy</a><a href="../terms.html">Terms</a></div>
    <div class="social">
      <a href="https://t.me/chainloot" target="_blank" rel="noopener">Telegram</a>
      <a href="https://twitter.com/chainloot" target="_blank" rel="noopener">Twitter</a>
      <a href="mailto:support@chainloot.io">Email</a>
    </div>
    <p class="footer-copy">© 2026 Chain Loot · <a href="/">Home</a></p>
  </footer>
</body>
</html>`;
}

function indexHtml() {
  const cards = posts.map(p => `
    <article class="card blog-card">
      <time datetime="${p.iso}">${p.date}</time>
      <h3><a href="${p.slug}.html">${p.title}</a></h3>
      <p>${p.excerpt}</p>
      <a href="${p.slug}.html">Read more →</a>
    </article>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog — Chain Loot GameFi | Play-to-Earn Guides &amp; News</title>
  <meta name="description" content="Chain Loot blog: Zombie Siege guides, hero NFTs, LOOT staking, Optimism GameFi.">
  <meta name="keywords" content="Chain Loot blog, GameFi guides, play to earn, LOOT token, Optimism gaming">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://chainloot.io/blog/">
  <meta property="og:title" content="Chain Loot Blog">
  <meta property="og:description" content="Guides, updates and play-to-earn tips for Chain Loot on Optimism.">
  <meta property="og:image" content="https://chainloot.io/assets/hero.jpg">
  <link rel="stylesheet" href="../css/site.css">
  <link rel="icon" href="../assets/logo.png" type="image/png">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Orbitron:wght@700&display=swap" rel="stylesheet">
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <a href="/" class="logo"><img class="logo-mark" src="../assets/logo.png" alt="" width="40" height="40"> Chain Loot</a>
      <nav class="site-nav"><ul>
        <li><a href="../tutorial.html">Tutorial</a></li>
        <li><a href="index.html">Blog</a></li>
        <li><a href="../audit.html">Audit</a></li>
        <li><a href="http://localhost:5173" class="btn btn-primary" style="padding:0.35rem 0.85rem;font-size:0.8rem">Launch dApp</a></li>
      </ul></nav>
    </div>
  </header>
  <div class="page-hero container">
    <h1>Chain Loot Blog</h1>
    <p class="meta">${posts.length} articles · Guides, updates &amp; play-to-earn tips</p>
  </div>
  <div class="container section">
    <div class="grid">${cards}
    </div>
  </div>
  <footer class="site-footer">
    <div class="footer-legal"><a href="../privacy.html">Privacy Policy</a><a href="../terms.html">Terms of Service</a></div>
    <div class="social">
      <a href="https://t.me/chainloot" target="_blank" rel="noopener">Telegram</a>
      <a href="https://twitter.com/chainloot" target="_blank" rel="noopener">Twitter</a>
      <a href="mailto:support@chainloot.io">Email</a>
    </div>
    <p class="footer-copy">© 2026 Chain Loot · <a href="/">Home</a></p>
  </footer>
</body>
</html>`;
}

for (const p of posts) {
  const html = shell(p.title, p.desc, `${p.slug}.html`, p.body, p.date, p.iso);
  fs.writeFileSync(path.join(BLOG_DIR, `${p.slug}.html`), html);
}

fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), indexHtml());

console.log(`Generated ${posts.length} blog posts + index in ${BLOG_DIR}`);
