#!/usr/bin/env bash
# 15s promo clip for TikTok / YouTube Shorts / Play listing (optional)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/google-play/promo-15s.mp4"
SHOTS="$ROOT/google-play/screenshots"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

if ! command -v ffmpeg >/dev/null; then
  echo "Install ffmpeg: brew install ffmpeg"
  exit 1
fi

for f in 01-menu.png 03-gameplay.png 04-combat.png 02-story.png; do
  [ -f "$SHOTS/$f" ] || { echo "Missing $SHOTS/$f — run: npm run assets:store"; exit 1; }
done

# Ken Burns–style zoom on each still (3.75s each → ~15s), 1080×1920 vertical for Shorts
i=0
for f in 01-menu.png 03-gameplay.png 04-combat.png 02-story.png; do
  ffmpeg -y -loop 1 -i "$SHOTS/$f" -t 3.75 \
    -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(zoom+0.0015,1.08)':d=94:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=25" \
    -c:v libx264 -pix_fmt yuv420p "$TMP/part_$i.mp4" 2>/dev/null
  i=$((i + 1))
done

ls "$TMP"/part_*.mp4 | sort -V | awk '{print "file \047" $0 "\047"}' > "$TMP/list.txt"
ffmpeg -y -f concat -safe 0 -i "$TMP/list.txt" -c copy "$OUT" 2>/dev/null

echo "Saved $OUT (1080×1920, ~15s)"
echo "Upload to Play Console → Store presence → Promo video (optional)"
