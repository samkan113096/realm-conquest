#!/usr/bin/env bash
# Download latest finished production AAB for manual Play Console upload.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="google-play/shadow-strike-release.aab"
mkdir -p google-play

URL=$(npx eas-cli build:list --platform android --limit 5 --json --non-interactive 2>/dev/null \
  | python3 -c "
import sys, json
data = json.load(sys.stdin)
for b in data:
    if b.get('status') == 'FINISHED' and b.get('buildProfile') == 'production':
        u = (b.get('artifacts') or {}).get('applicationArchiveUrl')
        if u:
            print(u)
            break
" 2>/dev/null || true)

if [ -z "${URL:-}" ]; then
  echo "No finished production Android build yet."
  echo "Check: https://expo.dev/accounts/dickhui912/projects/shadow-strike/builds"
  exit 1
fi

echo "Downloading → $OUT"
curl -fsSL "$URL" -o "$OUT"
python3 -c "
import zipfile
z = zipfile.ZipFile('$OUT')
data = z.read('base/manifest/AndroidManifest.xml')
for p in (b'com.shadowstrike.myapp', b'com.gamedev.shadowstrike'):
    if p in data:
        print('Package in AAB:', p.decode())
        break
"
echo ""
echo "Upload in Play Console:"
echo "  https://play.google.com/console → Shadow Strike → Testing → Internal testing → Create release"
echo "  → Upload → select $OUT"
