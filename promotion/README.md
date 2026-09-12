# Promotion — games portfolio

**Canonical 180-day packs** now live in the unified promo system:

| Game | Promo id | Pack |
|------|----------|------|
| **Chain Loot (GameFi)** | `chainloot` | `/Users/samkan/Promotion/campaigns/chainloot/` |
| Realm Conquest | `realmconquest` | `/Users/samkan/Promotion/campaigns/realmconquest/` |
| Neon Drift | `neondrift` | `/Users/samkan/Promotion/campaigns/neondrift/` |
| Shadow Strike | `shadowstrike` | `/Users/samkan/Promotion/campaigns/shadowstrike/` |

All `enabled=false` / dry-run until Sam flips one at a time.

```bash
cd "/Users/samkan/Promotion"
python3 scripts/verify_180_plan.py
python3 -m promo flip chainloot --weeks 4   # dry seed; add --live only after gates
```

## Legacy 90-day assets (this folder)

`chain-loot/`, `realm-conquest/`, `neon-drift/`, `shadow-strike/` still hold the original 90-day tweets/TG/email/memes. Prefer the **180-day** packs above for scheduling via `promo`.

Master 90-day CSV: [`MASTER-CALENDAR.csv`](MASTER-CALENDAR.csv)
