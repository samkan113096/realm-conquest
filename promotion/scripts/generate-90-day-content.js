#!/usr/bin/env node
/**
 * Generate 90 days of tweets, Telegram posts, emails, and meme SVGs
 * for each game in the promotion folder.
 *
 * Usage: node promotion/scripts/generate-90-day-content.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DAYS = 90;
const MEME_COUNT = 30; // one meme every 3 days

const GAMES = {
  'chain-loot': {
    name: 'Chain Loot',
    tagline: 'Fight Zombies. Earn LOOT.',
    hashtag: '#ChainLoot #ZombieSiege #GameFi #Web3Gaming #Sepolia',
    url: 'https://tourmaline-naiad-7f3ed0.netlify.app',
    site: 'https://golden-haupia-52c7c5.netlify.app',
    platform: 'Browser dApp · Ethereum Sepolia',
    hooks: [
      'Mint a hero NFT for 50 LOOT',
      'Fight 5 zombie tiers on-chain',
      'Daily faucet: 10 free LOOT',
      'Hero HP + 30s cooldown = real strategy',
      'Equip weapons to boost combat power',
      'Stake LOOT for passive rewards',
      'Epic heroes earn bonus LOOT on wins',
      'Every fight settles on-chain',
    ],
    tips: [
      'Claim the daily faucet before your first mint',
      'Equip a weapon before fighting Brute tier',
      'Tank heroes have more HP — great for grinding',
      'Wait 30 seconds between fights (on-chain cooldown)',
      'Shambler tier needs 40 power — mint + equip early',
      'Check hero HP bar before picking Necromancer tier',
      'Legendary rarity = biggest LOOT bonus on victory',
    ],
    emoji: '🧟💰⚔️',
  },
  'realm-conquest': {
    name: 'Realm Conquest',
    tagline: 'Conquer Aldoria. One hex at a time.',
    hashtag: '#RealmConquest #StrategyGame #IndieGame #BrowserGame',
    url: 'http://localhost:8080',
    site: null,
    platform: 'Browser · Turn-based hex strategy',
    hooks: [
      'Build farms before barracks — army eats food',
      'Control 70% of the map to win',
      'Hills and forests boost defender power',
      'Recruit warriors and archers to expand',
      'AI factions fight back every turn',
      'Neutral territories = easy loot',
      'Medieval hex map, zero install',
      'Lord of House Azurewind awaits your command',
    ],
    tips: [
      'Don\'t spread too thin — AI will counter-attack',
      'Markets generate gold for more recruitment',
      'Attack adjacent territories only',
      'End turn only when your economy is stable',
      'Barracks increase army capacity',
      'Scout neutrals early for quick expansion',
    ],
    emoji: '🏰⚔️🗺️',
  },
  'neon-drift': {
    name: 'Neon Drift',
    tagline: 'Outrun the drones. Chase the high score.',
    hashtag: '#NeonDrift #ArcadeShooter #IndieGame #Roguelike #Cyberpunk',
    url: null,
    site: null,
    platform: 'PC desktop · Pygame arcade shooter',
    hooks: [
      'Chain combos for massive score multipliers',
      'Waves escalate as your score climbs',
      'Collect shield, speed, heal, rapid fire',
      'Enemies appear from wave 2 onward',
      'Neon roguelike in the Orion Belt',
      'High score saved locally — beat your ghost',
      'Asteroids today, corporate drones tomorrow',
      'Cyberpunk arcade — no microtransactions',
    ],
    tips: [
      'Keep moving — standing still is death',
      'Save shield power-ups for enemy waves',
      'Combos reset if you miss — stay aggressive',
      'Rapid fire melts asteroid clusters',
      'Heal pickups are rare — dodge first',
      'Wave 5+ is where runs get legendary',
    ],
    emoji: '🚀💜⚡',
  },
  'shadow-strike': {
    name: 'Shadow Strike',
    tagline: 'Fight the underrealm. Floor by floor.',
    hashtag: '#ShadowStrike #MobileGame #Brawler #IndieGame #Expo',
    url: 'http://localhost:8082',
    site: null,
    platform: 'Mobile web · Expo brawler',
    hooks: [
      'Endless dungeon floors in Neo-Tokyo 2187',
      'Boss every 5 floors — dodge or die',
      'Combo system rewards aggressive melee',
      'Special burst + dodge with i-frames',
      'Left joystick move, tap attack for combos',
      'Kira vs underground syndicates',
      'Dark purple/red urban fight pits',
      'Play in Expo Go — scan and brawl',
    ],
    tips: [
      'Tap attack rapidly to extend combos',
      'Save special for boss armor breaks',
      'Dodge has i-frames — use it, don\'t tank',
      'Clear all enemies to advance the floor',
      'Boss patterns repeat — learn the tell',
      'Aggressive play = higher combo multiplier',
    ],
    emoji: '👊🌃🔥',
  },
};

const WEEK_THEMES = [
  'launch',
  'tip',
  'feature',
  'community',
  'challenge',
  'meme',
  'weekend',
];

function pad(n) {
  return String(n).padStart(3, '0');
}

function dayOfWeek(day) {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][(day - 1) % 7];
}

function pick(arr, seed) {
  return arr[seed % arr.length];
}

function buildTweet(game, day) {
  const theme = WEEK_THEMES[(day - 1) % 7];
  const hook = pick(game.hooks, day);
  const tip = pick(game.tips, day + 3);
  const link = game.url ? `\n\n▶ ${game.url}` : '';
  const site = game.site ? `\n📖 ${game.site}` : '';

  const templates = {
    launch: [
      `Day ${day} of ${game.name} ${game.emoji}\n\n${game.tagline}\n\n${hook}.${link}\n\n${game.hashtag}`,
      `${game.name} — ${game.platform}\n\n${hook}. No install drama. Just play.\n\n${game.tagline}${link}\n\n${game.hashtag}`,
      `Still sleeping on ${game.name}? ${game.emoji}\n\n${hook}\n\n${game.tagline}${link}\n\n${game.hashtag}`,
    ],
    tip: [
      `PRO TIP (${day}/90) ${game.emoji}\n\n${tip}\n\n${game.name} · ${game.tagline}${link}\n\n${game.hashtag}`,
      `${game.name} tip of the day:\n\n→ ${tip}\n\n${hook}${link}\n\n${game.hashtag}`,
    ],
    feature: [
      `Feature spotlight ${game.emoji}\n\n${hook}\n\nBuilt for ${game.platform.toLowerCase()}.\n\n${game.tagline}${link}${site}\n\n${game.hashtag}`,
      `Why players stick with ${game.name}:\n\n✓ ${hook}\n✓ ${pick(game.tips, day)}\n\n${link}\n\n${game.hashtag}`,
    ],
    community: [
      `What's your ${game.name} main strategy? ${game.emoji}\n\nOurs: ${tip}\n\nReply with yours 👇\n\n${game.hashtag}`,
      `Shoutout to everyone grinding ${game.name} this week ${game.emoji}\n\n${hook}\n\n${game.tagline}${link}\n\n${game.hashtag}`,
      `${dayOfWeek(day)} community check-in ${game.emoji}\n\nWho's playing ${game.name} today?\n\n${tip}${link}\n\n${game.hashtag}`,
    ],
    challenge: [
      `CHALLENGE ${game.emoji}\n\n${hook}\n\nCan you beat day ${day}? Post proof.\n\n${game.tagline}${link}\n\n${game.hashtag}`,
      `Week ${Math.ceil(day / 7)} challenge:\n\n${tip}\n\nTag a friend who needs ${game.name}.\n\n${link}\n\n${game.hashtag}`,
    ],
    meme: [
      `POV: you discovered ${game.name} ${game.emoji}\n\n${hook}\n\n(meme in Telegram — see today's drop)\n\n${link}\n\n${game.hashtag}`,
      `Me: I'll play one run\nAlso me at 2am: ${game.tagline} ${game.emoji}\n\n${game.hashtag}`,
    ],
    weekend: [
      `Weekend plan ${game.emoji}\n\n☕ Coffee\n🎮 ${game.name}\n🏆 ${hook}\n\n${link}\n\n${game.hashtag}`,
      `Saturday session loading… ${game.name} ${game.emoji}\n\n${game.tagline}\n\n${tip}${link}\n\n${game.hashtag}`,
    ],
  };

  const pool = templates[theme] || templates.launch;
  return pick(pool, day);
}

function buildTelegram(game, day) {
  const tweet = buildTweet(game, day);
  const memeDay = day % 3 === 0;
  const memeNum = Math.ceil(day / 3);

  let msg = `📢 *${game.name}* — Day ${day}/90\n\n`;
  msg += tweet.replace(/\n\n/g, '\n').replace(/#\w+/g, (m) => m);
  msg += `\n\n`;
  if (memeDay) {
    msg += `🖼 _Today's meme:_ \`memes/meme-${pad(memeNum)}.svg\`\n\n`;
  }
  if (game.url) {
    msg += `🔗 [Play now](${game.url})\n`;
  }
  if (game.site) {
    msg += `📖 [Learn more](${game.site})\n`;
  }
  msg += `\n_${game.platform}_`;
  return msg;
}

function buildEmail(game, day) {
  const theme = WEEK_THEMES[(day - 1) % 7];
  const hook = pick(game.hooks, day);
  const tip = pick(game.tips, day + 5);
  const subjects = {
    launch: `${game.name}: ${game.tagline}`,
    tip: `${game.name} Tip #${day} — ${tip.slice(0, 40)}…`,
    feature: `Inside ${game.name}: ${hook.slice(0, 45)}…`,
    community: `${game.name} community update — Day ${day}`,
    challenge: `Your ${game.name} challenge for ${dayOfWeek(day)}`,
    meme: `${game.emoji} ${game.name} meme drop + quick update`,
    weekend: `Weekend ${game.name} session? ${game.tagline}`,
  };

  const subject = subjects[theme] || subjects.launch;
  const cta = game.url || game.site || '#';
  const ctaLabel = game.url ? 'Play Now' : game.site ? 'Visit Site' : 'Learn More';

  return `# Email — Day ${day}

**Subject:** ${subject}

**Preview text:** ${hook.slice(0, 90)}

---

Hi {{first_name}},

${theme === 'tip' ? `**Quick tip (Day ${day}/90):** ${tip}` : `**${game.tagline}**`}

${hook}

${theme === 'challenge' ? `**Today's challenge:** ${tip} Post your result and tag us.` : ''}
${theme === 'feature' ? `**Why it matters:** ${pick(game.tips, day)}` : ''}
${theme === 'weekend' ? `Perfect weekend for a ${game.name} run. ${tip}` : ''}

**Platform:** ${game.platform}

[${ctaLabel}](${cta})

${game.url && game.site ? `[Tutorial & docs](${game.site})` : ''}

— The ${game.name} Team

---

_Unsubscribe: {{unsubscribe_url}}_
`;
}

function memeSvg(game, index, day) {
  const hook = pick(game.hooks, index + day);
  const formats = index % 4;
  const w = 800;
  const h = 600;
  const bg = {
    'chain-loot': '#0f0f1a',
    'realm-conquest': '#1a1520',
    'neon-drift': '#0a0014',
    'shadow-strike': '#140a18',
  }[Object.keys(GAMES).find((k) => GAMES[k] === game)] || '#111';

  const accent = {
    'chain-loot': '#ffc940',
    'realm-conquest': '#4a90d9',
    'neon-drift': '#ff00ff',
    'shadow-strike': '#ff4466',
  }[Object.keys(GAMES).find((k) => GAMES[k] === game)] || '#00ffc8';

  if (formats === 0) {
    // Drake / two-panel
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <rect x="0" y="0" width="${w}" height="${h / 2}" fill="#1a1a2e"/>
  <rect x="0" y="${h / 2}" width="${w}" height="${h / 2}" fill="#252540"/>
  <text x="420" y="80" fill="#888" font-family="Inter,sans-serif" font-size="22">❌ ${pick(['Pay-to-win mobile trash', 'Another boring shooter', 'Web3 without gameplay'], index)}</text>
  <text x="420" y="380" fill="${accent}" font-family="Inter,sans-serif" font-size="24" font-weight="bold">✅ ${game.name}: ${hook.slice(0, 45)}</text>
  <text x="40" y="560" fill="#666" font-family="Inter,sans-serif" font-size="16">${game.tagline} · Day ${day} meme #${index}</text>
  <text x="40" y="90" font-size="120">${game.emoji.split('')[0] || '🎮'}</text>
  <text x="40" y="390" font-size="120">${game.emoji.split('')[1] || '🔥'}</text>
</svg>`;
  }
  if (formats === 1) {
    // Top/bottom impact
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <rect x="40" y="200" width="720" height="200" rx="12" fill="#252540" stroke="${accent}" stroke-width="3"/>
  <text x="400" y="60" text-anchor="middle" fill="white" font-family="Impact,Arial Black,sans-serif" font-size="42" stroke="black" stroke-width="2">WHEN YOU FINALLY</text>
  <text x="400" y="110" text-anchor="middle" fill="${accent}" font-family="Impact,Arial Black,sans-serif" font-size="38" stroke="black" stroke-width="2">${game.name.toUpperCase()}</text>
  <text x="400" y="310" text-anchor="middle" fill="white" font-family="Inter,sans-serif" font-size="28">${hook}</text>
  <text x="400" y="520" text-anchor="middle" fill="white" font-family="Impact,Arial Black,sans-serif" font-size="36" stroke="black" stroke-width="2">${game.tagline.toUpperCase()}</text>
</svg>`;
  }
  if (formats === 2) {
    // Expanding brain
    const levels = [pick(game.tips, index), hook, `${game.name} ${game.tagline}`, 'Ascended gamer'];
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  ${levels.map((t, i) => `
  <rect x="80" y="${80 + i * 120}" width="640" height="90" rx="8" fill="#${['222', '333', '444', accent.slice(1)][i]}" opacity="0.9"/>
  <text x="400" y="${135 + i * 120}" text-anchor="middle" fill="white" font-family="Inter,sans-serif" font-size="${18 + i * 2}">${t.slice(0, 50)}</text>`).join('')}
  <text x="400" y="580" text-anchor="middle" fill="#666" font-family="Inter,sans-serif" font-size="14">${game.hashtag.split(' ').slice(0, 2).join(' ')}</text>
</svg>`;
  }
  // Quote card
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${bg}"/><stop offset="100%" stop-color="#252540"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <text x="400" y="200" text-anchor="middle" fill="${accent}" font-family="Orbitron,Inter,sans-serif" font-size="48">${game.name}</text>
  <text x="400" y="280" text-anchor="middle" fill="#ccc" font-family="Inter,sans-serif" font-size="24">${game.tagline}</text>
  <text x="400" y="360" text-anchor="middle" fill="white" font-family="Inter,sans-serif" font-size="20">"${hook}"</text>
  <text x="400" y="480" text-anchor="middle" fill="#888" font-family="Inter,sans-serif" font-size="18">${game.emoji} ${game.platform}</text>
  <text x="400" y="540" text-anchor="middle" fill="${accent}" font-family="Inter,sans-serif" font-size="16">Day ${day} · Meme ${index}</text>
</svg>`;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeGame(gameId, game) {
  const base = path.join(ROOT, gameId);
  const dirs = ['tweets', 'telegram', 'emails', 'memes'];
  dirs.forEach((d) => ensureDir(path.join(base, d)));

  const calendar = [];

  for (let day = 1; day <= DAYS; day++) {
    const d = pad(day);
    const tweet = buildTweet(game, day);
    const telegram = buildTelegram(game, day);
    const email = buildEmail(game, day);

    fs.writeFileSync(path.join(base, 'tweets', `day-${d}.txt`), tweet + '\n');
    fs.writeFileSync(path.join(base, 'telegram', `day-${d}.md`), telegram + '\n');
    fs.writeFileSync(path.join(base, 'emails', `day-${d}.md`), email + '\n');

    calendar.push({
      day,
      dateOffset: `Day ${day}`,
      theme: WEEK_THEMES[(day - 1) % 7],
      tweetFile: `tweets/day-${d}.txt`,
      telegramFile: `telegram/day-${d}.md`,
      emailFile: `emails/day-${d}.md`,
      memeFile: day % 3 === 0 ? `memes/meme-${pad(Math.ceil(day / 3))}.svg` : null,
    });
  }

  for (let m = 1; m <= MEME_COUNT; m++) {
    const day = m * 3;
    const svg = memeSvg(game, m, day <= DAYS ? day : DAYS);
    fs.writeFileSync(path.join(base, 'memes', `meme-${pad(m)}.svg`), svg);
  }

  // Combined exports for easy copy-paste
  const allTweets = calendar.map((c) => `=== DAY ${c.day} (${c.theme}) ===\n${fs.readFileSync(path.join(base, c.tweetFile), 'utf8')}`).join('\n');
  const allTelegram = calendar.map((c) => `=== DAY ${c.day} ===\n${fs.readFileSync(path.join(base, c.telegramFile), 'utf8')}`).join('\n');
  fs.writeFileSync(path.join(base, 'ALL-TWEETS-90-DAYS.txt'), allTweets);
  fs.writeFileSync(path.join(base, 'ALL-TELEGRAM-90-DAYS.md'), allTelegram);

  fs.writeFileSync(path.join(base, 'calendar.json'), JSON.stringify({ game: game.name, id: gameId, days: DAYS, schedule: calendar }, null, 2));

  fs.writeFileSync(
    path.join(base, 'README.md'),
    `# ${game.name} — 90-Day Promotion Pack

${game.tagline}

| Channel | Files |
|---------|-------|
| Twitter/X | \`tweets/day-001.txt\` … \`day-090.txt\` · also \`ALL-TWEETS-90-DAYS.txt\` |
| Telegram | \`telegram/day-001.md\` … \`day-090.md\` · also \`ALL-TELEGRAM-90-DAYS.md\` |
| Email | \`emails/day-001.md\` … \`day-090.md\` (subject + body, \`{{first_name}}\` placeholders) |
| Memes | \`memes/meme-001.svg\` … \`meme-030.svg\` (post every 3 days) |

**Platform:** ${game.platform}
${game.url ? `**Play:** ${game.url}` : ''}
${game.site ? `**Site:** ${game.site}` : ''}

**Hashtags:** ${game.hashtag}

## Weekly theme rotation
Mon launch · Tue tip · Wed feature · Thu community · Fri challenge · Sat meme · Sun weekend

See \`calendar.json\` for the full schedule.
`,
  );

  console.log(`✓ ${gameId}: ${DAYS} tweets, ${DAYS} telegram, ${DAYS} emails, ${MEME_COUNT} memes`);
}

// Master README + CSV
function writeMaster() {
  ensureDir(ROOT);
  const rows = [['game', 'day', 'theme', 'tweet', 'telegram', 'email', 'meme']];
  for (const [id, game] of Object.entries(GAMES)) {
    for (let day = 1; day <= DAYS; day++) {
      const d = pad(day);
      rows.push([
        id,
        day,
        WEEK_THEMES[(day - 1) % 7],
        `${id}/tweets/day-${d}.txt`,
        `${id}/telegram/day-${d}.md`,
        `${id}/emails/day-${d}.md`,
        day % 3 === 0 ? `${id}/memes/meme-${pad(Math.ceil(day / 3))}.svg` : '',
      ]);
    }
  }
  fs.writeFileSync(path.join(ROOT, 'MASTER-CALENDAR.csv'), rows.map((r) => r.join(',')).join('\n'));

  fs.writeFileSync(
    path.join(ROOT, 'README.md'),
    `# Promotion — 90-Day Content Calendar

Four games · 90 days each · tweets, Telegram, email, memes.

| Game | Folder | Platform |
|------|--------|----------|
| Chain Loot (Zombie Siege) | [\`chain-loot/\`](chain-loot/) | Web3 dApp · Sepolia |
| Realm Conquest | [\`realm-conquest/\`](realm-conquest/) | Browser strategy |
| Neon Drift | [\`neon-drift/\`](neon-drift/) | PC arcade shooter |
| Shadow Strike | [\`shadow-strike/\`](shadow-strike/) | Mobile brawler |

## Quick start

1. Open a game folder → \`ALL-TWEETS-90-DAYS.txt\` or \`day-001.txt\`
2. Telegram: \`ALL-TELEGRAM-90-DAYS.md\` (Markdown formatting)
3. Email: \`emails/day-NNN.md\` — import to Mailchimp/ConvertKit (replace \`{{first_name}}\`, \`{{unsubscribe_url}}\`)
4. Memes: open \`memes/*.svg\` in browser → export PNG for social

## Regenerate content

\`\`\`bash
node promotion/scripts/generate-90-day-content.js
\`\`\`

## Schedule

- **360** tweet files + 4 combined exports
- **360** Telegram posts
- **360** email templates
- **120** meme SVGs (30 per game, posted every 3 days)

Master index: [\`MASTER-CALENDAR.csv\`](MASTER-CALENDAR.csv)
`,
  );
}

for (const [id, game] of Object.entries(GAMES)) {
  writeGame(id, game);
}
writeMaster();
console.log('\nDone. See promotion/README.md');
