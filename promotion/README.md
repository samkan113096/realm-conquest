# Promotion — 90-Day Content Calendar

Four games · 90 days each · tweets, Telegram, email, memes.

| Game | Folder | Platform |
|------|--------|----------|
| Chain Loot (Zombie Siege) | [`chain-loot/`](chain-loot/) | Web3 dApp · Sepolia |
| Realm Conquest | [`realm-conquest/`](realm-conquest/) | Browser strategy |
| Neon Drift | [`neon-drift/`](neon-drift/) | PC arcade shooter |
| Shadow Strike | [`shadow-strike/`](shadow-strike/) | Mobile brawler |

## Quick start

1. Open a game folder → `ALL-TWEETS-90-DAYS.txt` or `day-001.txt`
2. Telegram: `ALL-TELEGRAM-90-DAYS.md` (Markdown formatting)
3. Email: `emails/day-NNN.md` — import to Mailchimp/ConvertKit (replace `{{first_name}}`, `{{unsubscribe_url}}`)
4. Memes: open `memes/*.svg` in browser → export PNG for social

## Regenerate content

```bash
node promotion/scripts/generate-90-day-content.js
```

## Schedule

- **360** tweet files + 4 combined exports
- **360** Telegram posts
- **360** email templates
- **120** meme SVGs (30 per game, posted every 3 days)

Master index: [`MASTER-CALENDAR.csv`](MASTER-CALENDAR.csv)
