#!/usr/bin/env bash
# ''

set -euo pipefail

PREFIX="${REDIS_KEY_PREFIX:-aqie-front-end:}"
URL="${AQIE_SESSION_TEST_URL:-http://127.0.0.1:3000/location/rawtenstall_rossendale}"

TMP_HEADERS_1="/tmp/aqie.headers1.txt"
TMP_HEADERS_2="/tmp/aqie.headers2.txt"
TMP_BODY_1="/tmp/aqie.body1.txt"
TMP_BODY_2="/tmp/aqie.body2.txt"
TMP_COOKIES="/tmp/aqie.cookies.txt"

echo "[1/5] Checking app reachability on ${URL}"
if ! curl -sS -o /dev/null --max-time 5 "${URL}"; then
  echo "App is not reachable. Start the app first (example: SESSION_CACHE_ENGINE=redis PORT=3000 npm run server:watch)."
  exit 1
fi

echo "[2/5] Counting Redis keys before requests"
before_count="$(redis-cli --scan --pattern "${PREFIX}*" | wc -l | tr -d ' ')"

echo "[3/5] Sending first request (sets cookie)"
rm -f "${TMP_HEADERS_1}" "${TMP_HEADERS_2}" "${TMP_BODY_1}" "${TMP_BODY_2}" "${TMP_COOKIES}"
curl -sS -D "${TMP_HEADERS_1}" -o "${TMP_BODY_1}" -c "${TMP_COOKIES}" -b "${TMP_COOKIES}" "${URL}" >/dev/null

echo "[4/5] Sending second request with cookie (follow redirects)"
curl -sS -L -D "${TMP_HEADERS_2}" -o "${TMP_BODY_2}" -c "${TMP_COOKIES}" -b "${TMP_COOKIES}" "${URL}" >/dev/null

echo "[5/5] Counting Redis keys after requests"
after_count="$(redis-cli --scan --pattern "${PREFIX}*" | wc -l | tr -d ' ')"
delta="$((after_count - before_count))"

echo
echo "Redis key count before: ${before_count}"
echo "Redis key count after:  ${after_count}"
echo "Delta:                 ${delta}"
echo
echo "Response summary (first request):"
grep -Ei '^(HTTP/|set-cookie:|location:)' "${TMP_HEADERS_1}" || true
echo
echo "Response summary (second request chain):"
grep -Ei '^(HTTP/|set-cookie:|location:)' "${TMP_HEADERS_2}" || true
echo
echo "Sample keys:"
redis-cli --scan --pattern "${PREFIX}*" | head -20 || true
