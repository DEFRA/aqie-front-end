#!/usr/bin/env bash
# ''

set -euo pipefail

TOTAL_DURATION_SECONDS="${TOTAL_DURATION_SECONDS:-3600}"
CHECKPOINT_SECONDS="${CHECKPOINT_SECONDS:-300}"
CANARY_WARMUP_SECONDS="${CANARY_WARMUP_SECONDS:-60}"
CANARY_FAIL_FAST="${CANARY_FAIL_FAST:-0}"
CANARY_ALLOWED_FAILURES="${CANARY_ALLOWED_FAILURES:-2}"

if [[ "$CHECKPOINT_SECONDS" -le 0 ]]; then
  echo "CHECKPOINT_SECONDS must be > 0"
  exit 1
fi

if [[ "$CANARY_ALLOWED_FAILURES" -lt 0 ]]; then
  echo "CANARY_ALLOWED_FAILURES must be >= 0"
  exit 1
fi

checkpoint_count="$((TOTAL_DURATION_SECONDS / CHECKPOINT_SECONDS))"
if [[ "$checkpoint_count" -le 0 ]]; then
  echo "TOTAL_DURATION_SECONDS must be >= CHECKPOINT_SECONDS"
  exit 1
fi

script_dir="$(cd "$(dirname "$0")" && pwd)"
signoff_script="${script_dir}/local-perf-signoff.sh"

if [[ ! -f "$signoff_script" ]]; then
  echo "Missing signoff script: $signoff_script"
  exit 1
fi

echo "Starting canary run checkpoints=${checkpoint_count} checkpoint_seconds=${CHECKPOINT_SECONDS} total_seconds=${TOTAL_DURATION_SECONDS} allowed_failures=${CANARY_ALLOWED_FAILURES}"

echo "Running preflight"
PRECHECK_ONLY=1 bash "$signoff_script"

failures=0
inconclusive=0

for checkpoint_index in $(seq 1 "$checkpoint_count"); do
  checkpoint_start="$(date '+%Y-%m-%d %H:%M:%S')"
  echo ""
  echo "=== Checkpoint ${checkpoint_index}/${checkpoint_count} start=${checkpoint_start} ==="

  checkpoint_warmup=0
  if [[ "$checkpoint_index" -eq 1 ]]; then
    checkpoint_warmup="$CANARY_WARMUP_SECONDS"
  fi

  checkpoint_log="$(mktemp)"

  set +e
  DURATION="$CHECKPOINT_SECONDS" \
  WARMUP_DURATION="$checkpoint_warmup" \
  bash "$signoff_script" >"$checkpoint_log" 2>&1
  checkpoint_exit_code="$?"
  set -e

  overall_line="$(grep -E '^OVERALL:' "$checkpoint_log" | tail -n 1 || true)"
  p975_line="$(grep -E 'p97_5_ms=' "$checkpoint_log" | tail -n 1 || true)"
  p99_line="$(grep -E 'p99_ms=' "$checkpoint_log" | tail -n 1 || true)"
  error_line="$(grep -E 'error_rate_pct=' "$checkpoint_log" | tail -n 1 || true)"
  hit_line="$(grep -E 'hit_rate_pct=' "$checkpoint_log" | tail -n 1 || true)"
  request_line="$(grep -E 'total_requests=' "$checkpoint_log" | tail -n 1 || true)"

  echo "checkpoint=${checkpoint_index} exit_code=${checkpoint_exit_code}"
  [[ -n "$request_line" ]] && echo "${request_line}"
  [[ -n "$p975_line" ]] && echo "${p975_line}"
  [[ -n "$p99_line" ]] && echo "${p99_line}"
  [[ -n "$error_line" ]] && echo "${error_line}"
  [[ -n "$hit_line" ]] && echo "${hit_line}"
  [[ -n "$overall_line" ]] && echo "${overall_line}"

  if [[ "$checkpoint_exit_code" -eq 2 ]]; then
    inconclusive="$((inconclusive + 1))"
  elif [[ "$checkpoint_exit_code" -ne 0 ]]; then
    failures="$((failures + 1))"
  fi

  rm -f "$checkpoint_log"

  if [[ "$CANARY_FAIL_FAST" == "1" ]] && [[ "$checkpoint_exit_code" -ne 0 ]]; then
    echo "Canary fail-fast triggered at checkpoint ${checkpoint_index}"
    break
  fi
done

echo ""
echo "=== Canary Summary ==="
echo "checkpoints_total=${checkpoint_count} failures=${failures} inconclusive=${inconclusive}"
echo "allowed_failures=${CANARY_ALLOWED_FAILURES}"

if [[ "$failures" -gt "$CANARY_ALLOWED_FAILURES" ]]; then
  echo "CANARY RESULT: FAIL"
  exit 1
fi

if [[ "$inconclusive" -gt 0 ]]; then
  echo "CANARY RESULT: INCONCLUSIVE"
  exit 2
fi

if [[ "$failures" -gt 0 ]]; then
  echo "note=Tolerated ${failures} checkpoint failures within allowed budget (${CANARY_ALLOWED_FAILURES})"
  echo "CANARY RESULT: PASS"
  exit 0
fi

echo "CANARY RESULT: PASS"
exit 0
