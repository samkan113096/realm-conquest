#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PLATFORM="${1:-all}"

run_web() {
  echo "🌐 Starting Realm Conquest at http://localhost:8080"
  npx --yes serve "$ROOT/realm-conquest-browser" -p 8080
}

run_pc() {
  echo "🖥️  Starting Neon Drift..."
  cd "$ROOT/neon-drift-pc"
  python3 main.py
}

run_phone() {
  echo "📱 Starting Shadow Strike (Expo)..."
  cd "$ROOT/shadow-strike-mobile"
  if [ ! -d node_modules ]; then npm install; fi
  npx expo start
}

run_gamefi() {
  echo "⬡ Starting Realm GameFi (signer + dApp)..."
  cd "$ROOT/gamefi"
  if [ ! -d node_modules ]; then npm install; fi
  if [ ! -d dapp/node_modules ]; then cd dapp && npm install && cd ..; fi
  npm run signer &
  SIGNER_PID=$!
  sleep 1
  cd dapp && npm run dev
  kill "$SIGNER_PID" 2>/dev/null || true
}

run_site() {
  echo "🌐 Starting production site at http://localhost:3000"
  npx --yes serve "$ROOT/website" -p 3000
}

case "$PLATFORM" in
  web) run_web ;;
  pc) run_pc ;;
  phone) run_phone ;;
  gamefi) run_gamefi ;;
  site) run_site ;;
  all)
    echo "Launching web + PC games..."
    run_web &
    WEB_PID=$!
    sleep 1
    run_pc
    kill "$WEB_PID" 2>/dev/null || true
    ;;
  *)
    echo "Usage: ./scripts/dev.sh [web|pc|phone|gamefi|site|all]"
    exit 1
    ;;
esac
