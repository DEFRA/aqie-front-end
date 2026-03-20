#!/usr/bin/env bash
set -euo pipefail

# ''

action="${1:-monitor}"

REDIS_HOST="${REDIS_HOST:-127.0.0.1}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_PASSWORD="${REDIS_PASSWORD:-}"
REDIS_PREFIX="${REDIS_PREFIX:-aqie-front-end:*}"
REDIS_MONITOR_INTERVAL="${REDIS_MONITOR_INTERVAL:-5}"
REDIS_MONITOR_LOG_FILE="${REDIS_MONITOR_LOG_FILE:-redis-bot-monitor.log}"
REDIS_MONITOR_PID_FILE="${REDIS_MONITOR_PID_FILE:-.redis-bot-monitor.pid}"

redis_cli() {
  if [[ -n "$REDIS_PASSWORD" ]]; then
    redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" "$@"
  else
    redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" "$@"
  fi
}

has_redis_cli() {
  command -v redis-cli >/dev/null 2>&1
}

sample_once_with_ioredis() {
  node --input-type=module -e "
import Redis from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || undefined,
  lazyConnect: true
})

const parseInfoValue = (infoText, key) => {
  const match = infoText.match(new RegExp('^' + key + ':(.*)$', 'm'))
  return match && match[1] ? match[1].trim() : ''
}

try {
  await redis.connect()
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const info = await redis.info('memory')
  const used = parseInfoValue(info, 'used_memory_human')
  const peak = parseInfoValue(info, 'used_memory_peak_human')
  const usedBytes = Number(parseInfoValue(info, 'used_memory'))
  const maxBytes = Number(parseInfoValue(info, 'maxmemory'))

  let usedPct = 'n/a'
  if (Number.isFinite(maxBytes) && maxBytes > 0 && Number.isFinite(usedBytes)) {
    usedPct = ((usedBytes / maxBytes) * 100).toFixed(2)
  }

  let count = 0
  for await (const keys of redis.scanStream({
    match: process.env.REDIS_PREFIX || 'aqie-front-end:*',
    count: 1000
  })) {
    count += keys.length
  }

  console.log(`${timestamp} used_memory_human=${used} used_memory_peak_human=${peak} used_memory_pct_of_maxmemory=${usedPct} prefixed_keys=${count}`)
} catch (error) {
  console.error(`redis monitor error: ${error.message}`)
  process.exitCode = 1
} finally {
  redis.disconnect()
}
"
}

sample_once() {
  if has_redis_cli; then
    local timestamp memorySummary prefixedKeys usedBytes maxBytes usedPct
    timestamp="$(date +"%Y-%m-%d %H:%M:%S")"
    local memoryInfo
    memoryInfo="$(redis_cli INFO memory)"

    memorySummary="$(echo "$memoryInfo" | awk -F: '/used_memory_human|used_memory_peak_human/ {gsub("\\r", "", $2); printf "%s=%s ", $1, $2}')"

    usedBytes="$(echo "$memoryInfo" | awk -F: '/^used_memory:/ {gsub("\\r", "", $2); print $2}')"
    maxBytes="$(echo "$memoryInfo" | awk -F: '/^maxmemory:/ {gsub("\\r", "", $2); print $2}')"

    if [[ -n "$maxBytes" ]] && [[ "$maxBytes" != "0" ]]; then
      usedPct="$(awk -v used="$usedBytes" -v max="$maxBytes" 'BEGIN { printf "%.2f", (used / max) * 100 }')"
    else
      usedPct="n/a"
    fi

    prefixedKeys="$(redis_cli --scan --pattern "$REDIS_PREFIX" | wc -l | tr -d ' ')"
    echo "$timestamp $memorySummary used_memory_pct_of_maxmemory=$usedPct prefixed_keys=$prefixedKeys"
  else
    sample_once_with_ioredis
  fi
}

run_monitor() {
  while true; do
    sample_once
    sleep "$REDIS_MONITOR_INTERVAL"
  done
}

start_monitor() {
  if [[ -f "$REDIS_MONITOR_PID_FILE" ]]; then
    local existingPid
    existingPid="$(cat "$REDIS_MONITOR_PID_FILE" 2>/dev/null || true)"
    if [[ -n "$existingPid" ]] && kill -0 "$existingPid" >/dev/null 2>&1; then
      echo "monitor already running (pid=$existingPid, log=$REDIS_MONITOR_LOG_FILE)"
      exit 0
    fi
  fi

  nohup bash "$0" monitor >>"$REDIS_MONITOR_LOG_FILE" 2>&1 &
  local newPid=$!
  echo "$newPid" >"$REDIS_MONITOR_PID_FILE"
  echo "monitor started (pid=$newPid, log=$REDIS_MONITOR_LOG_FILE)"
}

stop_monitor() {
  if [[ ! -f "$REDIS_MONITOR_PID_FILE" ]]; then
    echo "monitor not running (pid file missing)"
    exit 0
  fi

  local pid
  pid="$(cat "$REDIS_MONITOR_PID_FILE" 2>/dev/null || true)"
  if [[ -z "$pid" ]]; then
    rm -f "$REDIS_MONITOR_PID_FILE"
    echo "monitor pid file was empty and has been removed"
    exit 0
  fi

  if kill -0 "$pid" >/dev/null 2>&1; then
    kill "$pid"
    echo "monitor stopped (pid=$pid)"
  else
    echo "monitor process not found for pid=$pid"
  fi

  rm -f "$REDIS_MONITOR_PID_FILE"
}

status_monitor() {
  if [[ -f "$REDIS_MONITOR_PID_FILE" ]]; then
    local pid
    pid="$(cat "$REDIS_MONITOR_PID_FILE" 2>/dev/null || true)"
    if [[ -n "$pid" ]] && kill -0 "$pid" >/dev/null 2>&1; then
      echo "monitor running (pid=$pid, log=$REDIS_MONITOR_LOG_FILE)"
      exit 0
    fi
  fi

  echo "monitor not running"
}

case "$action" in
monitor)
  run_monitor
  ;;
start)
  start_monitor
  ;;
stop)
  stop_monitor
  ;;
status)
  status_monitor
  ;;
sample)
  sample_once
  ;;
*)
  echo "usage: $0 {monitor|start|stop|status|sample}"
  exit 1
  ;;
esac
