#!/usr/bin/env bash
set -euo pipefail

# '' Mock-only helper to clear REDIS_* variables from current shell.

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  echo "This script must be sourced so unsets apply to your current shell."
  echo "Usage: source scripts/clear-redis-env-for-mock.sh --mock-only"
  exit 1
fi

mockAck="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mock-only)
      mockAck="true"
      shift
      ;;
    -h|--help)
      echo "Usage: source scripts/clear-redis-env-for-mock.sh --mock-only"
      echo "Unsets only REDIS_* variables in this shell."
      return 0
      ;;
    *)
      echo "Unknown argument: $1"
      echo "Usage: source scripts/clear-redis-env-for-mock.sh --mock-only"
      return 1
      ;;
  esac
done

if [[ "$mockAck" != "true" ]]; then
  echo "Refusing to run without --mock-only acknowledgement."
  echo "This helper is intended for local mocking/testing only."
  return 1
fi

mapfile -t redisVars < <(env | awk -F= '/^REDIS_/ {print $1}')

if [[ ${#redisVars[@]} -eq 0 ]]; then
  echo "No REDIS_* variables found in current shell."
  return 0
fi

echo "Clearing REDIS_* variables from current shell (mock-only cleanup)..."

for varName in "${redisVars[@]}"; do
  unset "$varName"
  echo "  - unset $varName"
done

echo "Cleared ${#redisVars[@]} REDIS_* variable(s)."
