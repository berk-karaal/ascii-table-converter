#!/bin/sh
# Regenerates the social preview image and touch icon from design/*.html (macOS, needs Google Chrome).
set -e
cd "$(dirname "$0")/.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
shot() {
  "$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size="$2" --screenshot="$PWD/public/$1.png" "file://$PWD/design/$1.html" 2>/dev/null
}
shot og-image 1200,630
shot apple-touch-icon 180,180
