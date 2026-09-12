# Games portfolio — keys-only / flip-ready

_Updated 2026-09-12. Eng + Netlify + promo packs ready. Public promo stays parked until Sam flips one product at a time._

**Root:** `/Users/samkan/game`  
**Promo SoT:** `/Users/samkan/Promotion` · packs under `campaigns/{chainloot,realmconquest,neondrift,shadowstrike}/`  
**Agent brief:** `/Users/samkan/PORTFOLIO_AGENT_BRIEF.md`

---

## Live surfaces (redeployed 2026-09-12)

| Product | Promo id | Surface | URL | HTTP |
|---------|----------|---------|-----|------|
| Realm Conquest | `realmconquest` | Browser game | https://majestic-mandazi-fe5bd6.netlify.app | live |
| Realm Conquest | | Matchmaking API | https://realm-conquest-api.onrender.com/api/health | live |
| Chain Loot | `chainloot` | dApp (Sepolia) | https://tourmaline-naiad-7f3ed0.netlify.app | live |
| Chain Loot | | Landing | https://golden-haupia-52c7c5.netlify.app | live |
| Shadow Strike | `shadowstrike` | Marketing / privacy | https://heartfelt-youtiao-7e3960.netlify.app | live |
| Neon Drift | `neondrift` | Landing | https://neon-drift-pc.netlify.app | live |

Redeploy anytime from repo root: `npm run deploy:all-sites`

---

## Keys-only leftovers (Sam)

| Product | Done | Sam still owns |
|---------|------|----------------|
| **Realm Conquest** | Game + Render API live; 180-day pack + dry-seed queue | Real TG/X handles → `promo flip realmconquest --live …` |
| **Chain Loot** | Sepolia contracts + sites; pack + dry-seed | Confirm testnet marketing honesty; airdrop signer ops if running campaigns; **no mainnet** unless you ask; TG/X handles → flip |
| **Neon Drift** | Landing live; PC playable locally; pack + dry-seed | itch.io / GitHub zip release; TG/X handles → flip |
| **Shadow Strike** | Landing + Play assets/ASO ready; pack + dry-seed | Play Console AAB upload + 12-tester gate; TG/X handles → flip |

All four products: `enabled=false` in `products.toml`. Channels are placeholders (`@CHAINLOOT_TG`, etc.) — replace before `--live`.

---

## Promo (ready, parked)

```bash
cd "/Users/samkan/Promotion"
# packs already enriched; dry-seeded 2026-09-12 (launch + evergreen campaigns)
python3 -m promo flip <id> --weeks 4          # re-seed only (safe)
# after real handles + you confirm product live:
python3 -m promo flip <id> --live --channels telegram \
  --i-confirm-product-live --i-confirm-creds
```

Paste banks: `campaigns/<id>/PASTE_READY_180.md`  
Claim spines: `campaigns/<id>/CLAIM_SPINES.md`  
Never invent player counts, downloads, TVL, or “audited” claims.

---

## Isolation

- Chain Loot ≠ indie three (no shared universe / no shared promo claims)
- Do not cross-wire Netlify site IDs with memecoin / NFT / DeFi products
- Chain Loot stays **Sepolia reference** until Sam explicitly requests mainnet

---

## Explicit non-goals for this keys-only closeout

- No auto `--live` promo without Sam
- No Chain Loot Optimism/mainnet redeploy
- No inventing store rankings or “play-to-earn APY”
