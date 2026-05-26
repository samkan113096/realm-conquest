#!/bin/bash
# Shadow Strike — build & optional auto-upload to Google Play
set -e
cd "$(dirname "$0")/.."

echo "=== Shadow Strike Android build ==="

if ! npx eas-cli whoami &>/dev/null; then
  echo ""
  echo "Not logged in to Expo. Run this first (opens browser):"
  echo "  npx eas-cli login"
  echo ""
  echo "Or set EXPO_TOKEN for CI: https://docs.expo.dev/accounts/programmatic-access/"
  exit 1
fi

if ! grep -q '"projectId": "[0-9a-f-]\{36\}"' app.json 2>/dev/null; then
  echo "Linking EAS project (first time only)..."
  npx eas-cli init --id "$(npx eas-cli project:info 2>/dev/null | head -1)" 2>/dev/null || npx eas-cli init
fi

echo "Starting cloud build (15–25 min)..."
npx eas-cli build --platform android --profile production --non-interactive

if [[ -f google-play-service-account.json ]]; then
  echo ""
  read -p "Upload to Google Play internal track? [y/N] " ans
  if [[ "$ans" =~ ^[Yy]$ ]]; then
    npx eas-cli submit --platform android --profile production --latest --non-interactive
  fi
else
  echo ""
  echo "Build done. Download .aab from the link above."
  echo "Manual upload: Play Console → Release → Upload"
  echo ""
  echo "For auto-upload next time, add google-play-service-account.json"
  echo "See google-play/AUTO-SUBMIT.md"
fi
