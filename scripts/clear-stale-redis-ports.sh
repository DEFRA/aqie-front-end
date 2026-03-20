#!/usr/bin/env bash
# ''

set -euo pipefail

clear_port() {
  local port="$1"
  local pids

  pids="$(lsof -tiTCP:"${port}" -sTCP:LISTEN || true)"

  if [[ -z "${pids}" ]]; then
    echo "No stale listener on port ${port}."
    return 0
  fi

  echo "Killing stale listener(s) on port ${port}: ${pids}"
  kill -9 ${pids} 2>/dev/null || true
}

clear_port 3000
clear_port 9229

sleep 1

echo "Post-check port 3000:"
lsof -nP -iTCP:3000 -sTCP:LISTEN || true

echo "Post-check port 9229:"
lsof -nP -iTCP:9229 -sTCP:LISTEN || true
