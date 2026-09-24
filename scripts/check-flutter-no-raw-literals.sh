#!/usr/bin/env bash
# Fail if Color(0x…) aesthetic literals appear in theme helpers (use generated tokens).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
THEME="$ROOT/packages/supr_design_system_flutter/lib/src/theme"
if rg -n 'Color\(0x[0-9A-Fa-f]+\)' "$THEME" ; then
  echo "Raw Color(0x…) literals found in theme helpers — use SuprCircleTokens / semantic extensions"
  exit 1
fi
echo "static aesthetic literal gate: ok"
