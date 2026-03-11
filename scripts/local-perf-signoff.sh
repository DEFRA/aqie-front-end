#!/usr/bin/env bash
# ''

set -euo pipefail

REDIS_HOST="${REDIS_HOST:-127.0.0.1}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_PASSWORD="${REDIS_PASSWORD:-}"
TARGET_URL="${TARGET_URL:-http://127.0.0.1:3000/location/rawtenstall_rossendale}"
STATUS_FILE="${STATUS_FILE:-/tmp/local-perf-signoff.status}"

WARMUP_RATE="${WARMUP_RATE:-2}"
WARMUP_DURATION="${WARMUP_DURATION:-30}"
RATE="${RATE:-2}"
DURATION="${DURATION:-600}"

REDIS_NODE_MEMORY_BYTES="${REDIS_NODE_MEMORY_BYTES:-8589934592}"

THRESHOLD_MEMORY_PCT="${THRESHOLD_MEMORY_PCT:-60}"
THRESHOLD_GROWTH_PCT_PER_HOUR="${THRESHOLD_GROWTH_PCT_PER_HOUR:-10}"
THRESHOLD_EVICTIONS_TOTAL="${THRESHOLD_EVICTIONS_TOTAL:-0}"
THRESHOLD_HIT_RATE="${THRESHOLD_HIT_RATE:-80}"
THRESHOLD_P97_5_MS="${THRESHOLD_P97_5_MS:-400}"
THRESHOLD_P99_MS="${THRESHOLD_P99_MS:-800}"
THRESHOLD_ERROR_RATE_PCT="${THRESHOLD_ERROR_RATE_PCT:-1}"

redis_cli() {
  if [[ -n "$REDIS_PASSWORD" ]]; then
    redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" "$@"
  else
    redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" "$@"
  fi
}

require_bin() {
  local bin="$1"
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "Missing required command: ${bin}"
    exit 1
  fi
}

info_value() {
  local section="$1"
  local key="$2"
  redis_cli info "$section" | awk -F: -v k="$key" '$1==k {gsub("\\r", "", $2); print $2}' | tail -n1
}

require_bin redis-cli
require_bin node

set_status() {
  local state="$1"
  local message="$2"
  printf '%s state=%s %s\n' "$(date +"%Y-%m-%d %H:%M:%S")" "$state" "$message" | tee "$STATUS_FILE" >/dev/null
}

if ! redis_cli ping >/dev/null 2>&1; then
  echo "Redis is not reachable on ${REDIS_HOST}:${REDIS_PORT}."
  exit 1
fi

set_status "STARTING" "target_url=${TARGET_URL} duration=${DURATION}s rate=${RATE}"

if awk "BEGIN { exit !(${WARMUP_DURATION} > 0) }"; then
  echo "Warm-up: ${WARMUP_DURATION}s @ ${WARMUP_RATE} req/s"
  npx autocannon -R "$WARMUP_RATE" -d "$WARMUP_DURATION" "$TARGET_URL" >/dev/null
else
  echo "Warm-up skipped (WARMUP_DURATION=${WARMUP_DURATION})"
fi

before_used_memory="$(info_value memory used_memory)"
before_evicted_keys="$(info_value stats evicted_keys)"
before_hits="$(info_value stats keyspace_hits)"
before_misses="$(info_value stats keyspace_misses)"

result_json="$(mktemp)"

echo "Measured run: ${DURATION}s @ ${RATE} req/s"
npx autocannon -R "$RATE" -d "$DURATION" -j "$TARGET_URL" >"$result_json" &
load_pid=$!
start_epoch="$(date +%s)"

set_status "RUNNING" "pid=${load_pid}"

while kill -0 "$load_pid" >/dev/null 2>&1; do
  now_epoch="$(date +%s)"
  elapsed="$((now_epoch - start_epoch))"
  percent="$(awk -v e="$elapsed" -v d="$DURATION" 'BEGIN { if (d <= 0) { print 0 } else { p=(e/d)*100; if (p>100) p=100; printf "%.1f", p } }')"
  set_status "RUNNING" "elapsed=${elapsed}s progress=${percent}%"
  sleep 30
done

wait "$load_pid"

after_used_memory="$(info_value memory used_memory)"
after_evicted_keys="$(info_value stats evicted_keys)"
after_hits="$(info_value stats keyspace_hits)"
after_misses="$(info_value stats keyspace_misses)"

set +e

BEFORE_USED_MEMORY="$before_used_memory" \
AFTER_USED_MEMORY="$after_used_memory" \
BEFORE_EVICTED_KEYS="$before_evicted_keys" \
AFTER_EVICTED_KEYS="$after_evicted_keys" \
BEFORE_HITS="$before_hits" \
AFTER_HITS="$after_hits" \
BEFORE_MISSES="$before_misses" \
AFTER_MISSES="$after_misses" \
DURATION="$DURATION" \
REDIS_NODE_MEMORY_BYTES="$REDIS_NODE_MEMORY_BYTES" \
THRESHOLD_MEMORY_PCT="$THRESHOLD_MEMORY_PCT" \
THRESHOLD_GROWTH_PCT_PER_HOUR="$THRESHOLD_GROWTH_PCT_PER_HOUR" \
THRESHOLD_EVICTIONS_TOTAL="$THRESHOLD_EVICTIONS_TOTAL" \
THRESHOLD_HIT_RATE="$THRESHOLD_HIT_RATE" \
THRESHOLD_P97_5_MS="$THRESHOLD_P97_5_MS" \
THRESHOLD_P99_MS="$THRESHOLD_P99_MS" \
THRESHOLD_ERROR_RATE_PCT="$THRESHOLD_ERROR_RATE_PCT" \
node --input-type=module -e "
import fs from 'node:fs'

const resultPath = process.argv[1]
const report = JSON.parse(fs.readFileSync(resultPath, 'utf8'))

const num = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const beforeUsedMemory = num(process.env.BEFORE_USED_MEMORY)
const afterUsedMemory = num(process.env.AFTER_USED_MEMORY)
const beforeEvictedKeys = num(process.env.BEFORE_EVICTED_KEYS)
const afterEvictedKeys = num(process.env.AFTER_EVICTED_KEYS)
const beforeHits = num(process.env.BEFORE_HITS)
const afterHits = num(process.env.AFTER_HITS)
const beforeMisses = num(process.env.BEFORE_MISSES)
const afterMisses = num(process.env.AFTER_MISSES)

const duration = num(process.env.DURATION, 1)
const nodeMemoryBytes = num(process.env.REDIS_NODE_MEMORY_BYTES, 8589934592)

const thresholdMemoryPct = num(process.env.THRESHOLD_MEMORY_PCT, 60)
const thresholdGrowthPctPerHour = num(process.env.THRESHOLD_GROWTH_PCT_PER_HOUR, 10)
const thresholdEvictionsTotal = num(process.env.THRESHOLD_EVICTIONS_TOTAL, 0)
const thresholdHitRate = num(process.env.THRESHOLD_HIT_RATE, 80)
const thresholdP975Ms = num(process.env.THRESHOLD_P97_5_MS, 400)
const thresholdP99Ms = num(process.env.THRESHOLD_P99_MS, 800)
const thresholdErrorRatePct = num(process.env.THRESHOLD_ERROR_RATE_PCT, 1)

const usedPctOfNode = nodeMemoryBytes > 0 ? (afterUsedMemory / nodeMemoryBytes) * 100 : 0
const growthPct = beforeUsedMemory > 0 ? ((afterUsedMemory - beforeUsedMemory) / beforeUsedMemory) * 100 : 0
const growthPctPerHour = growthPct * (3600 / Math.max(duration, 1))

const evictionsDelta = afterEvictedKeys - beforeEvictedKeys
const hitsDelta = Math.max(0, afterHits - beforeHits)
const missesDelta = Math.max(0, afterMisses - beforeMisses)
const hitRate = hitsDelta + missesDelta > 0 ? (hitsDelta / (hitsDelta + missesDelta)) * 100 : 0

const latencyP975 = num(report?.latency?.p97_5)
const latencyP99 = num(report?.latency?.p99)
const totalRequests = num(report?.requests?.total)
const non2xx = num(report?.non2xx)
const errors = num(report?.errors)
const timeouts = num(report?.timeouts)
const errorRate = totalRequests > 0 ? ((non2xx + errors + timeouts) / totalRequests) * 100 : 0

const memoryPass = usedPctOfNode < thresholdMemoryPct && growthPctPerHour <= thresholdGrowthPctPerHour
const evictionsPass = evictionsDelta <= thresholdEvictionsTotal
const hitRatePass = hitRate >= thresholdHitRate
const latencyPass = latencyP975 <= thresholdP975Ms && latencyP99 <= thresholdP99Ms && errorRate < thresholdErrorRatePct

const overallPass = memoryPass && evictionsPass && hitRatePass && latencyPass

const fmt = (value, digits = 2) => Number(value).toFixed(digits)
const asPassFail = (value) => (value ? 'PASS' : 'FAIL')

console.log('')
console.log('=== Local Perf Signoff Report ===')
console.log('Memory:')
console.log('  used_pct_of_node=' + fmt(usedPctOfNode) + ' threshold=<' + thresholdMemoryPct + ' => ' + asPassFail(memoryPass))
console.log('  growth_pct_per_hour=' + fmt(growthPctPerHour) + ' threshold<=' + thresholdGrowthPctPerHour + ' => ' + asPassFail(memoryPass))
console.log('Evictions:')
console.log('  evictions_delta=' + evictionsDelta + ' threshold<=' + thresholdEvictionsTotal + ' => ' + asPassFail(evictionsPass))
console.log('Hit Rate:')
console.log('  hit_rate_pct=' + fmt(hitRate) + ' threshold>=' + thresholdHitRate + ' => ' + asPassFail(hitRatePass))
console.log('Latency:')
console.log('  p97_5_ms=' + fmt(latencyP975) + ' threshold<=' + thresholdP975Ms + ' => ' + asPassFail(latencyPass))
console.log('  p99_ms=' + fmt(latencyP99) + ' threshold<=' + thresholdP99Ms + ' => ' + asPassFail(latencyPass))
console.log('  error_rate_pct=' + fmt(errorRate) + ' threshold<' + thresholdErrorRatePct + ' => ' + asPassFail(latencyPass))
console.log('')
console.log('OVERALL: ' + asPassFail(overallPass))

process.exit(overallPass ? 0 : 1)
" "$result_json"
node_exit_code="$?"

set -e

rm -f "$result_json"

if [[ "$node_exit_code" -eq 0 ]]; then
  set_status "DONE" "result=PASS"
else
  set_status "DONE" "result=FAIL"
fi

exit "$node_exit_code"
