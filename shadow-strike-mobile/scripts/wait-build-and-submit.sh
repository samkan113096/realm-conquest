#!/usr/bin/env bash
# Wait for EAS build, then submit to Play (internal track).
set -euo pipefail
cd "$(dirname "$0")/.."
BUILD_ID="${1:-6610965d-fc4b-4333-b38e-ed911ffe4930}"

echo "Waiting for build $BUILD_ID…"
while true; do
  STATUS=$(npx eas-cli build:view "$BUILD_ID" 2>/dev/null | awk '/^Status/ {print $3}')
  echo "  status: $STATUS"
  case "$STATUS" in
    finished) break ;;
    errored|canceled) echo "Build failed: $STATUS"; exit 1 ;;
  esac
  sleep 60
done

if [ ! -f google-play-service-account.json ]; then
  echo ""
  echo "Missing google-play-service-account.json"
  echo "Upload key at: https://expo.dev/accounts/dickhui912/projects/shadow-strike/credentials"
  echo "  → Android → com.shadowstrike.myapp → Google Service Account Key"
  echo "Then run: npm run submit:android"
  exit 1
fi

echo "Submitting to Play (internal testing)…"
npx eas-cli submit --platform android --profile production --id "$BUILD_ID" --non-interactive
