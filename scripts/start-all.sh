#!/usr/bin/env bash
# Start all games + marketing site on localhost
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PIDS=()

cleanup() {
  echo ""
  echo "Stopping all servers..."
  for pid in "${PIDS[@]:-}"; do kill "$pid" 2>/dev/null || true; done
  exit 0
}
trap cleanup INT TERM

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              GAME PORTFOLIO — LOCAL TEST URLs               ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Marketing site          → http://localhost:3000            ║"
echo "║  1. Realm Conquest       → http://localhost:8080            ║"
echo "║  2. Neon Drift (desktop) → npm run pc                       ║"
echo "║  3. Shadow Strike        → http://localhost:8082            ║"
echo "║  4. Chain Loot site      → http://localhost:3001            ║"
echo "║     Chain Loot dApp      → http://localhost:5173            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "[0] Starting marketing website on :3000..."
npx --yes serve "$ROOT/website" -p 3000 --no-clipboard &
PIDS+=($!)

echo "[1] Starting Realm Conquest on :8080..."
npx --yes serve "$ROOT/realm-conquest-browser" -p 8080 --no-clipboard &
PIDS+=($!)

echo "[2] Starting Shadow Strike (Expo web) on :8082..."
cd "$ROOT/shadow-strike-mobile"
if [ ! -d node_modules ]; then npm install --silent; fi
npx expo install react-dom react-native-web @expo/metro-runtime >/dev/null 2>&1 || true
npx expo start --web --port 8082 &
PIDS+=($!)

echo "[3] Starting Chain Loot (site + signer on :3001, dApp on :5173)..."
cd "$ROOT/gamefi"
if [ ! -d node_modules ]; then npm install --silent; fi
node server/signer.js &
PIDS+=($!)
sleep 1
cd "$ROOT/gamefi/dapp"
if [ ! -d node_modules ]; then npm install --silent; fi
npm run dev &
PIDS+=($!)

echo ""
echo "All servers running. Press Ctrl+C to stop."
echo "Neon Drift: open a new terminal → cd $ROOT && npm run pc"
echo ""

wait
