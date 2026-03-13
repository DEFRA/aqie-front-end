#!/usr/bin/env bash
# ''

set -euo pipefail

PREFIX="${REDIS_KEY_PREFIX:-aqie-front-end:}"

echo "Clearing Redis keys for prefix: ${PREFIX}*"
keys="$(redis-cli --scan --pattern "${PREFIX}*")"

if [[ -n "${keys}" ]]; then
  while IFS= read -r key; do
    redis-cli del "${key}" >/dev/null
  done <<< "${keys}"
  echo "Deleted existing keys."
else
  echo "No existing keys found."
fi

echo "Running Redis session proof..."
bash scripts/verify-redis-session.sh
