#!/usr/bin/env bash
# ''

set -euo pipefail

REDIS_HOST="${REDIS_HOST:-127.0.0.1}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_PASSWORD="${REDIS_PASSWORD:-}"
TARGET_URL="${TARGET_URL:-http://127.0.0.1:3001/health}"
STATUS_FILE="${STATUS_FILE:-/tmp/local-perf-signoff.status}"
REQUEST_HEADER="${REQUEST_HEADER:-}"
COOKIE_BOOTSTRAP_URL="${COOKIE_BOOTSTRAP_URL:-}"
COOKIE_BOOTSTRAP_STRICT="${COOKIE_BOOTSTRAP_STRICT:-0}"
PERF_PROFILE="${PERF_PROFILE:-default}"
PRECHECK_ONLY="${PRECHECK_ONLY:-0}"
PRECHECK_MAX_RETRIES="${PRECHECK_MAX_RETRIES:-3}"
PRECHECK_RETRY_BACKOFF_SECONDS="${PRECHECK_RETRY_BACKOFF_SECONDS:-2}"
THRESHOLD_MODE="${THRESHOLD_MODE:-strict}"

WARMUP_RATE="${WARMUP_RATE:-2}"
WARMUP_DURATION="${WARMUP_DURATION:-30}"
RATE="${RATE:-2}"
DURATION="${DURATION:-600}"
AUTOCANNON_CONNECTIONS="${AUTOCANNON_CONNECTIONS:-10}"

REDIS_NODE_MEMORY_BYTES="${REDIS_NODE_MEMORY_BYTES:-8589934592}"

THRESHOLD_MEMORY_PCT="${THRESHOLD_MEMORY_PCT:-60}"
THRESHOLD_GROWTH_PCT_PER_HOUR="${THRESHOLD_GROWTH_PCT_PER_HOUR:-10}"
THRESHOLD_EVICTIONS_TOTAL="${THRESHOLD_EVICTIONS_TOTAL:-0}"
THRESHOLD_HIT_RATE="${THRESHOLD_HIT_RATE:-80}"
THRESHOLD_MIN_KEYSPACE_ACTIVITY="${THRESHOLD_MIN_KEYSPACE_ACTIVITY:-10}"
THRESHOLD_P97_5_MS="${THRESHOLD_P97_5_MS:-400}"
THRESHOLD_P99_MS="${THRESHOLD_P99_MS:-800}"
THRESHOLD_ERROR_RATE_PCT="${THRESHOLD_ERROR_RATE_PCT:-1}"
THRESHOLD_MIN_REQUESTS="${THRESHOLD_MIN_REQUESTS:-30}"

apply_perf_profile_defaults() {
  case "$PERF_PROFILE" in
    cache-active-local)
      if [[ "$TARGET_URL" == "http://127.0.0.1:3001/health" ]]; then
        TARGET_URL="http://127.0.0.1:3001/location/rawtenstall_rossendale"
      fi
      if [[ "$WARMUP_RATE" == "2" ]]; then
        WARMUP_RATE="1"
      fi
      if [[ "$WARMUP_DURATION" == "30" ]]; then
        WARMUP_DURATION="120"
      fi
      if [[ "$RATE" == "2" ]]; then
        RATE="1"
      fi
      if [[ "$DURATION" == "600" ]]; then
        DURATION="3600"
      fi
      if [[ "$AUTOCANNON_CONNECTIONS" == "10" ]]; then
        AUTOCANNON_CONNECTIONS="2"
      fi
      if [[ "$THRESHOLD_P97_5_MS" == "400" ]]; then
        THRESHOLD_P97_5_MS="1000"
      fi
      if [[ "$THRESHOLD_P99_MS" == "800" ]]; then
        THRESHOLD_P99_MS="1200"
      fi
      ;;
    default)
      ;;
    *)
      echo "Unsupported PERF_PROFILE: ${PERF_PROFILE}"
      echo "Supported values: default, cache-active-local"
      exit 1
      ;;
  esac
}

apply_perf_profile_defaults

apply_threshold_mode_defaults() {
  case "$THRESHOLD_MODE" in
    strict)
      ;;
    local-realistic)
      if [[ "$THRESHOLD_P97_5_MS" == "400" ]]; then
        THRESHOLD_P97_5_MS="1000"
      fi
      if [[ "$THRESHOLD_P99_MS" == "800" ]]; then
        THRESHOLD_P99_MS="1200"
      fi
      ;;
    *)
      echo "Unsupported THRESHOLD_MODE: ${THRESHOLD_MODE}"
      echo "Supported values: strict, local-realistic"
      exit 1
      ;;
  esac
}

apply_threshold_mode_defaults

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
require_bin curl

declare -a COMMON_HEADERS=()

build_cookie_header() {
  local bootstrap_url="$1"
  local cookie_jar
  cookie_jar="$(mktemp)"

  set +e
  curl -sS -L -c "$cookie_jar" -b "$cookie_jar" --max-time 20 "$bootstrap_url" >/dev/null
  local bootstrap_exit_code="$?"
  set -e

  if [[ "$bootstrap_exit_code" -ne 0 ]]; then
    rm -f "$cookie_jar"
    return 2
  fi

  local cookie_header
  cookie_header="$(awk 'BEGIN{ORS="; "} !/^#/ && NF>=7 {print $6"="$7}' "$cookie_jar" | sed 's/; $//')"
  rm -f "$cookie_jar"

  if [[ -z "$cookie_header" ]]; then
    return 3
  fi

  printf '%s' "$cookie_header"
}

initialize_common_headers() {
  if [[ -n "$REQUEST_HEADER" ]]; then
    COMMON_HEADERS+=("$REQUEST_HEADER")
  fi

  if [[ -n "$COOKIE_BOOTSTRAP_URL" ]]; then
    local cookie_header
    set +e
    cookie_header="$(build_cookie_header "$COOKIE_BOOTSTRAP_URL")"
    local cookie_bootstrap_code="$?"
    set -e

    if [[ "$cookie_bootstrap_code" -eq 0 ]]; then
      COMMON_HEADERS+=("Cookie: ${cookie_header}")
    elif [[ "$COOKIE_BOOTSTRAP_STRICT" == "1" ]]; then
      if [[ "$cookie_bootstrap_code" -eq 2 ]]; then
        echo "Cookie bootstrap request failed for ${COOKIE_BOOTSTRAP_URL}."
        finalize_status "result=FAIL reason=cookie_bootstrap_request_failed"
      else
        echo "Cookie bootstrap did not return cookies for ${COOKIE_BOOTSTRAP_URL}."
        finalize_status "result=FAIL reason=cookie_bootstrap_empty"
      fi
      exit 1
    else
      if [[ "$cookie_bootstrap_code" -eq 2 ]]; then
        echo "Warning: cookie bootstrap request failed for ${COOKIE_BOOTSTRAP_URL}; continuing without Cookie header."
      else
        echo "Warning: cookie bootstrap returned no cookies for ${COOKIE_BOOTSTRAP_URL}; continuing without Cookie header."
      fi
    fi
  fi
}

set_status() {
  local state="$1"
  local message="$2"
  printf '%s state=%s %s\n' "$(date +"%Y-%m-%d %H:%M:%S")" "$state" "$message" | tee "$STATUS_FILE" >/dev/null
}

STATUS_FINALIZED=0

finalize_status() {
  local message="$1"
  if [[ "$STATUS_FINALIZED" -eq 0 ]]; then
    set_status "DONE" "$message"
    STATUS_FINALIZED=1
  fi
}

on_exit() {
  local exit_code="$1"
  if [[ "$STATUS_FINALIZED" -eq 0 ]]; then
    if [[ "$exit_code" -eq 0 ]]; then
      finalize_status "result=PASS reason=completed_without_report"
    else
      finalize_status "result=FAIL reason=exit_code_${exit_code}"
    fi
  fi
}

trap 'on_exit $?' EXIT

parse_url_host_port() {
  local url="$1"
  node --input-type=module -e "
const target = process.argv[1]
try {
  const parsed = new URL(target)
  const defaultPort = parsed.protocol === 'https:' ? '443' : '80'
  const port = parsed.port || defaultPort
  console.log(parsed.hostname + ' ' + port)
} catch {
  process.exit(1)
}
" "$url"
}

precheck_target_url() {
  local url="$1"
  local header_count="$2"
  shift
  shift
  local curl_header_args=("$@")

  local suggested_replacement_url="http://127.0.0.1:3001/location/rawtenstall_rossendale/health-effects"

  is_known_location_redirect_loop() {
    local initial_url="$1"
    local first_redirect_url="$2"
    local second_redirect_url="$3"

    if [[ "$second_redirect_url" != "$initial_url" ]]; then
      return 1
    fi

    if [[ "$initial_url" =~ /location/rawtenstall_rossendale ]] && [[ "$first_redirect_url" =~ /location\?lang=en\&searchTerms=rawtenstall\&secondSearchTerm=rossendale\&searchTermsLocationType=uk-location ]]; then
      return 0
    fi

    if [[ "$first_redirect_url" =~ /location\?lang=en\&searchTerms=rawtenstall\&secondSearchTerm=rossendale\&searchTermsLocationType=uk-location ]] && [[ "$initial_url" =~ /location/rawtenstall_rossendale ]]; then
      return 0
    fi

    return 1
  }

  local host_port
  if ! host_port="$(parse_url_host_port "$url")"; then
    echo "Invalid TARGET_URL: ${url}"
    finalize_status "result=FAIL reason=invalid_target_url"
    exit 1
  fi

  local target_host target_port
  target_host="${host_port%% *}"
  target_port="${host_port##* }"

  local response curl_exit_code http_code elapsed redirect_url
  local attempt=1
  while true; do
    set +e
    if [[ "$header_count" -gt 0 ]]; then
      response="$(curl -sS -o /dev/null -w '%{http_code} %{time_total} %{redirect_url}' --max-time 10 "${curl_header_args[@]}" "$url")"
    else
      response="$(curl -sS -o /dev/null -w '%{http_code} %{time_total} %{redirect_url}' --max-time 10 "$url")"
    fi
    curl_exit_code="$?"
    set -e

    if [[ "$curl_exit_code" -eq 0 ]]; then
      http_code="${response%% *}"
      local remainder="${response#* }"
      elapsed="${remainder%% *}"
      redirect_url="${remainder#* }"

      if [[ "$http_code" =~ ^2|^3|^4 ]]; then
        break
      fi
    fi

    if [[ "$attempt" -ge "$PRECHECK_MAX_RETRIES" ]]; then
      break
    fi

    echo "HTTP pre-check transient failure attempt=${attempt}/${PRECHECK_MAX_RETRIES}; retrying in ${PRECHECK_RETRY_BACKOFF_SECONDS}s"
    sleep "$PRECHECK_RETRY_BACKOFF_SECONDS"
    attempt="$((attempt + 1))"
  done

  if [[ "$curl_exit_code" -ne 0 ]]; then
    echo "HTTP pre-check failed for ${url} (curl_exit_code=${curl_exit_code})."
    echo "Ensure service is running and reachable at ${target_host}:${target_port}."
    finalize_status "result=FAIL reason=precheck_curl_exit_${curl_exit_code} host=${target_host} port=${target_port}"
    exit 1
  fi

  if [[ "$http_code" =~ ^3 ]]; then
    local second_response second_http_code second_redirect_url
    second_response=""
    second_http_code=""
    second_redirect_url=""

    set +e
    if [[ "$header_count" -gt 0 ]]; then
      second_response="$(curl -sS -o /dev/null -w '%{http_code} %{redirect_url}' --max-time 10 "${curl_header_args[@]}" "$redirect_url")"
    else
      second_response="$(curl -sS -o /dev/null -w '%{http_code} %{redirect_url}' --max-time 10 "$redirect_url")"
    fi
    local second_curl_exit_code="$?"
    set -e

    if [[ "$second_curl_exit_code" -eq 0 ]]; then
      second_http_code="${second_response%% *}"
      second_redirect_url="${second_response#* }"
    fi

    if [[ "$second_http_code" =~ ^3 ]] && is_known_location_redirect_loop "$url" "$redirect_url" "$second_redirect_url"; then
      echo "HTTP pre-check failed: invalid signoff target due to known redirect loop."
      echo "Loop detected: ${url} -> ${redirect_url} -> ${second_redirect_url}"
      echo "Suggested replacement URL: ${suggested_replacement_url}"
      finalize_status "result=FAIL reason=invalid_signoff_target_location_redirect_loop suggested_replacement_url=${suggested_replacement_url}"
      exit 1
    fi

    echo "HTTP pre-check failed: ${url} returned ${http_code} redirect=${redirect_url}."
    echo "Use a final 2xx endpoint (non-redirecting) for TARGET_URL."
    finalize_status "result=FAIL reason=precheck_http_${http_code}_redirect redirect_url=${redirect_url}"
    exit 1
  fi

  if [[ ! "$http_code" =~ ^2 ]]; then
    echo "HTTP pre-check failed: ${url} returned ${http_code}."
    echo "Check route, app startup, and expected response status before load."
    finalize_status "result=FAIL reason=precheck_http_${http_code} host=${target_host} port=${target_port}"
    exit 1
  fi

  echo "HTTP pre-check passed: ${url} -> ${http_code} (${elapsed}s)"
}

if ! redis_cli ping >/dev/null 2>&1; then
  echo "Redis is not reachable on ${REDIS_HOST}:${REDIS_PORT}."
  exit 1
fi

initialize_common_headers

declare -a curl_header_args=()
declare -a autocannon_header_args=()
header_count=0
if [[ "${#COMMON_HEADERS[@]}" -gt 0 ]]; then
  for header in "${COMMON_HEADERS[@]}"; do
    curl_header_args+=( -H "$header" )
    autocannon_header_args+=( -H "$header" )
    header_count="$((header_count + 1))"
  done
fi

set_status "STARTING" "target_url=${TARGET_URL} duration=${DURATION}s rate=${RATE} connections=${AUTOCANNON_CONNECTIONS} header_count=${header_count}"
if [[ "$header_count" -gt 0 ]]; then
  precheck_target_url "$TARGET_URL" "$header_count" "${curl_header_args[@]}"
else
  precheck_target_url "$TARGET_URL" "0"
fi

if [[ "$PRECHECK_ONLY" == "1" ]]; then
  finalize_status "result=PASS reason=preflight_ok"
  exit 0
fi


if awk "BEGIN { exit !(${WARMUP_DURATION} > 0) }"; then
  echo "Warm-up: ${WARMUP_DURATION}s @ ${WARMUP_RATE} req/s"
  if [[ "$header_count" -gt 0 ]]; then
    npx autocannon -c "$AUTOCANNON_CONNECTIONS" -R "$WARMUP_RATE" -d "$WARMUP_DURATION" "${autocannon_header_args[@]}" "$TARGET_URL" >/dev/null
  else
    npx autocannon -c "$AUTOCANNON_CONNECTIONS" -R "$WARMUP_RATE" -d "$WARMUP_DURATION" "$TARGET_URL" >/dev/null
  fi
else
  echo "Warm-up skipped (WARMUP_DURATION=${WARMUP_DURATION})"
fi

before_used_memory="$(info_value memory used_memory)"
before_evicted_keys="$(info_value stats evicted_keys)"
before_hits="$(info_value stats keyspace_hits)"
before_misses="$(info_value stats keyspace_misses)"

result_json="$(mktemp)"

echo "Measured run: ${DURATION}s @ ${RATE} req/s"
if [[ "$header_count" -gt 0 ]]; then
  npx autocannon -c "$AUTOCANNON_CONNECTIONS" -R "$RATE" -d "$DURATION" "${autocannon_header_args[@]}" -j "$TARGET_URL" >"$result_json" &
else
  npx autocannon -c "$AUTOCANNON_CONNECTIONS" -R "$RATE" -d "$DURATION" -j "$TARGET_URL" >"$result_json" &
fi
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

set +e
wait "$load_pid"
load_exit_code="$?"
set -e

if [[ "$load_exit_code" -ne 0 ]]; then
  rm -f "$result_json"
  finalize_status "result=FAIL reason=load_exit_code_${load_exit_code}"
  exit "$load_exit_code"
fi

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
THRESHOLD_MIN_KEYSPACE_ACTIVITY="$THRESHOLD_MIN_KEYSPACE_ACTIVITY" \
THRESHOLD_P97_5_MS="$THRESHOLD_P97_5_MS" \
THRESHOLD_P99_MS="$THRESHOLD_P99_MS" \
THRESHOLD_ERROR_RATE_PCT="$THRESHOLD_ERROR_RATE_PCT" \
THRESHOLD_MIN_REQUESTS="$THRESHOLD_MIN_REQUESTS" \
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
const thresholdMinKeyspaceActivity = num(process.env.THRESHOLD_MIN_KEYSPACE_ACTIVITY, 10)
const thresholdP975Ms = num(process.env.THRESHOLD_P97_5_MS, 400)
const thresholdP99Ms = num(process.env.THRESHOLD_P99_MS, 800)
const thresholdErrorRatePct = num(process.env.THRESHOLD_ERROR_RATE_PCT, 1)
const thresholdMinRequests = num(process.env.THRESHOLD_MIN_REQUESTS, 30)

const usedPctOfNode = nodeMemoryBytes > 0 ? (afterUsedMemory / nodeMemoryBytes) * 100 : 0
const growthPct = beforeUsedMemory > 0 ? ((afterUsedMemory - beforeUsedMemory) / beforeUsedMemory) * 100 : 0
const growthPctPerHour = growthPct * (3600 / Math.max(duration, 1))

const evictionsDelta = afterEvictedKeys - beforeEvictedKeys
const hitsDelta = Math.max(0, afterHits - beforeHits)
const missesDelta = Math.max(0, afterMisses - beforeMisses)
const totalKeyspaceActivity = hitsDelta + missesDelta
const hasMeaningfulKeyspaceActivity =
  totalKeyspaceActivity >= thresholdMinKeyspaceActivity
const hitRate = totalKeyspaceActivity > 0 ? (hitsDelta / totalKeyspaceActivity) * 100 : null

const latencyP975 = num(report?.latency?.p97_5)
const latencyP99 = num(report?.latency?.p99)
const totalRequests = num(report?.requests?.total)
const non2xx = num(report?.non2xx)
const errors = num(report?.errors)
const timeouts = num(report?.timeouts)
const errorRate = totalRequests > 0 ? ((non2xx + errors + timeouts) / totalRequests) * 100 : 0

const hasSufficientRequestVolume = totalRequests >= thresholdMinRequests

const memoryPass = usedPctOfNode < thresholdMemoryPct && growthPctPerHour <= thresholdGrowthPctPerHour
const evictionsPass = evictionsDelta <= thresholdEvictionsTotal
const hitRatePass = hasMeaningfulKeyspaceActivity ? hitRate >= thresholdHitRate : true
const p975Pass = latencyP975 <= thresholdP975Ms
const p99Pass = latencyP99 <= thresholdP99Ms
const errorRatePass = errorRate < thresholdErrorRatePct
const latencyPass = p975Pass && p99Pass && errorRatePass

const overallPass = hasSufficientRequestVolume && memoryPass && evictionsPass && hitRatePass && latencyPass

const fmt = (value, digits = 2) => Number(value).toFixed(digits)
const asPassFail = (value) => (value ? 'PASS' : 'FAIL')
const fmtOrNA = (value, digits = 2) =>
  value === null || value === undefined ? 'N/A' : fmt(value, digits)

console.log('')
console.log('=== Local Perf Signoff Report ===')
console.log('Requests:')
console.log('  total_requests=' + totalRequests + ' threshold>=' + thresholdMinRequests + ' => ' + (hasSufficientRequestVolume ? 'SUFFICIENT' : 'INSUFFICIENT'))
console.log('Memory:')
console.log('  used_pct_of_node=' + fmt(usedPctOfNode) + ' threshold=<' + thresholdMemoryPct + ' => ' + asPassFail(memoryPass))
console.log('  growth_pct_per_hour=' + fmt(growthPctPerHour) + ' threshold<=' + thresholdGrowthPctPerHour + ' => ' + asPassFail(memoryPass))
console.log('Evictions:')
console.log('  evictions_delta=' + evictionsDelta + ' threshold<=' + thresholdEvictionsTotal + ' => ' + asPassFail(evictionsPass))
console.log('Hit Rate:')
console.log('  keyspace_activity=' + totalKeyspaceActivity + ' threshold>=' + thresholdMinKeyspaceActivity + ' => ' + (hasMeaningfulKeyspaceActivity ? 'MEANINGFUL' : 'INSUFFICIENT'))
console.log('  hit_rate_pct=' + fmtOrNA(hitRate) + ' threshold>=' + thresholdHitRate + ' => ' + (hasMeaningfulKeyspaceActivity ? asPassFail(hitRatePass) : 'N/A'))
console.log('Latency:')
console.log('  p97_5_ms=' + fmt(latencyP975) + ' threshold<=' + thresholdP975Ms + ' => ' + asPassFail(p975Pass))
console.log('  p99_ms=' + fmt(latencyP99) + ' threshold<=' + thresholdP99Ms + ' => ' + asPassFail(p99Pass))
console.log('  error_rate_pct=' + fmt(errorRate) + ' threshold<' + thresholdErrorRatePct + ' => ' + asPassFail(errorRatePass))
if (!hasMeaningfulKeyspaceActivity) {
  console.log('  note=Hit rate not scored due to insufficient Redis keyspace activity for this target profile')
}
if (!hasSufficientRequestVolume) {
  console.log('  note=Run flagged INCONCLUSIVE due to insufficient total request volume')
}
console.log('')
if (!hasSufficientRequestVolume) {
  console.log('OVERALL: INCONCLUSIVE')
  process.exit(2)
}

console.log('OVERALL: ' + asPassFail(overallPass))

process.exit(overallPass ? 0 : 1)
" "$result_json"
node_exit_code="$?"

set -e

rm -f "$result_json"

if [[ "$node_exit_code" -eq 0 ]]; then
  finalize_status "result=PASS"
elif [[ "$node_exit_code" -eq 2 ]]; then
  finalize_status "result=INCONCLUSIVE reason=insufficient_request_volume"
else
  finalize_status "result=FAIL"
fi

exit "$node_exit_code"
