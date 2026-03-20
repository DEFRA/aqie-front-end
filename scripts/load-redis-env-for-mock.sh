#!/usr/bin/env bash
set -euo pipefail

# '' Mock-only helper to load REDIS_* variables from a Kubernetes secret into current shell.

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  echo "This script must be sourced so exports apply to your current shell."
  echo "Usage: source scripts/load-redis-env-for-mock.sh --namespace <ns> --secret <name>"
  exit 1
fi

namespace=""
secretName=""
mockAck="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    -n|--namespace)
      namespace="${2:-}"
      shift 2
      ;;
    -s|--secret)
      secretName="${2:-}"
      shift 2
      ;;
    --mock-only)
      mockAck="true"
      shift
      ;;
    -h|--help)
      echo "Usage: source scripts/load-redis-env-for-mock.sh --namespace <ns> --secret <name> --mock-only"
      echo "Loads only REDIS_* keys from the secret and exports them in this shell."
      return 0
      ;;
    *)
      echo "Unknown argument: $1"
      echo "Usage: source scripts/load-redis-env-for-mock.sh --namespace <ns> --secret <name> --mock-only"
      return 1
      ;;
  esac
done

if [[ "$mockAck" != "true" ]]; then
  echo "Refusing to run without --mock-only acknowledgement."
  echo "This helper is intended for local mocking/testing only."
  return 1
fi

if [[ -z "$namespace" || -z "$secretName" ]]; then
  echo "Both --namespace and --secret are required."
  return 1
fi

if ! command -v kubectl >/dev/null 2>&1; then
  echo "kubectl is required but not found in PATH."
  return 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required but not found in PATH."
  return 1
fi

secretJson="$(kubectl -n "$namespace" get secret "$secretName" -o json)"

mapfile -t redisEntries < <(
  echo "$secretJson" | jq -r '.data | to_entries[] | select(.key | test("^REDIS_")) | "\(.key)=\(.value|@base64d)"'
)

if [[ ${#redisEntries[@]} -eq 0 ]]; then
  echo "No REDIS_* keys found in secret '$secretName' (namespace '$namespace')."
  return 1
fi

echo "Loading REDIS_* values for local mock testing from secret '$secretName' in namespace '$namespace'..."

loadedCount=0
for entry in "${redisEntries[@]}"; do
  key="${entry%%=*}"
  value="${entry#*=}"
  export "$key=$value"
  loadedCount=$((loadedCount + 1))

  if [[ "$key" == "REDIS_PASSWORD" ]]; then
    echo "  - $key=***REDACTED***"
  else
    echo "  - $key=$value"
  fi
done

echo "Loaded $loadedCount REDIS_* variable(s) into current shell (mock-only use)."
