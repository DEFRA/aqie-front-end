#!/usr/bin/env bash
# ''

set -euo pipefail

REDIS_HOST="${REDIS_HOST:-127.0.0.1}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_PASSWORD="${REDIS_PASSWORD:-}"
REDIS_KEY_PREFIX="${REDIS_KEY_PREFIX:-aqie-front-end:}"
PORT="${PORT:-3000}"
BOT_RATE="${BOT_RATE:-2}"
BOT_DURATION="${BOT_DURATION:-60}"
BOT_URL="${BOT_URL:-http://127.0.0.1:${PORT}/location/rawtenstall_rossendale}"

SERVER_PID=""

redis_cli() {
  if [[ -n "$REDIS_PASSWORD" ]]; then
    redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" "$@"
  else
    redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" "$@"
  fi
}

cleanup() {
  if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT

assert_redis_ready() {
  if ! redis_cli ping >/dev/null 2>&1; then
    echo "Redis is not reachable on ${REDIS_HOST}:${REDIS_PORT}. Start it first (e.g. npm run redis:start)."
    exit 1
  fi
}

count_keys() {
  redis_cli --scan --pattern "${REDIS_KEY_PREFIX}*" | wc -l | tr -d ' '
}

sum_memory_bytes() {
  local sum=0
  local key usage

  while IFS= read -r key; do
    [[ -z "$key" ]] && continue
    usage="$(redis_cli memory usage "$key" 2>/dev/null || echo 0)"
    if [[ "$usage" =~ ^[0-9]+$ ]]; then
      sum=$((sum + usage))
    fi
  done < <(redis_cli --scan --pattern "${REDIS_KEY_PREFIX}*")

  echo "$sum"
}

clear_prefix_keys() {
  local keys
  keys="$(redis_cli --scan --pattern "${REDIS_KEY_PREFIX}*")"

  if [[ -n "$keys" ]]; then
    while IFS= read -r key; do
      [[ -n "$key" ]] && redis_cli del "$key" >/dev/null
    done <<< "$keys"
  fi
}

wait_for_app() {
  local attempts=0
  until curl -sS -o /dev/null --max-time 3 "$BOT_URL"; do
    attempts=$((attempts + 1))
    if [[ $attempts -ge 30 ]]; then
      echo "App failed to become ready at ${BOT_URL}."
      echo "Check logs: /tmp/aqie-guard-ab-server.log"
      return 1
    fi
    sleep 1
  done
}

start_server() {
  local global_guard_enabled="$1"

  SESSION_CACHE_ENGINE=redis \
  SESSION_GLOBAL_GUARD_ENABLED="$global_guard_enabled" \
  REDIS_HOST="$REDIS_HOST" \
  REDIS_PORT="$REDIS_PORT" \
  REDIS_KEY_PREFIX="$REDIS_KEY_PREFIX" \
  PORT="$PORT" \
  npm run server:watch >/tmp/aqie-guard-ab-server.log 2>&1 &

  SERVER_PID=$!
  wait_for_app
}

run_load() {
  npx autocannon -R "$BOT_RATE" -d "$BOT_DURATION" "$BOT_URL" >/tmp/aqie-guard-ab-load.log
}

run_phase() {
  local label="$1"
  local global_guard_enabled="$2"

  echo
  echo "=== ${label} (SESSION_GLOBAL_GUARD_ENABLED=${global_guard_enabled}) ==="
  clear_prefix_keys

  local before_keys before_mem after_keys after_mem delta_keys delta_mem
  before_keys="$(count_keys)"
  before_mem="$(sum_memory_bytes)"

  start_server "$global_guard_enabled"
  run_load

  after_keys="$(count_keys)"
  after_mem="$(sum_memory_bytes)"

  cleanup
  SERVER_PID=""

  delta_keys=$((after_keys - before_keys))
  delta_mem=$((after_mem - before_mem))

  echo "before_keys=${before_keys} after_keys=${after_keys} delta_keys=${delta_keys}"
  echo "before_mem_bytes=${before_mem} after_mem_bytes=${after_mem} delta_mem_bytes=${delta_mem}"

  if [[ "$global_guard_enabled" == "true" ]]; then
    A_KEYS_DELTA="$delta_keys"
    A_MEM_DELTA="$delta_mem"
  else
    B_KEYS_DELTA="$delta_keys"
    B_MEM_DELTA="$delta_mem"
  fi
}

assert_redis_ready

A_KEYS_DELTA=0
A_MEM_DELTA=0
B_KEYS_DELTA=0
B_MEM_DELTA=0

run_phase "A" "true"
run_phase "B" "false"

echo
echo "=== A/B Summary ==="
echo "A (global on)  : delta_keys=${A_KEYS_DELTA}, delta_mem_bytes=${A_MEM_DELTA}"
echo "B (global off) : delta_keys=${B_KEYS_DELTA}, delta_mem_bytes=${B_MEM_DELTA}"
echo "Difference (B-A): delta_keys=$((B_KEYS_DELTA - A_KEYS_DELTA)), delta_mem_bytes=$((B_MEM_DELTA - A_MEM_DELTA))"
