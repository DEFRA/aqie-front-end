# Local Perf Signoff (Redis + Latency)

Use this when you want a local PASS/FAIL gate for:

- Redis memory trend
- Redis evictions
- Redis hit rate
- API latency and error rate

## Prerequisites

- App running locally with Redis cache enabled (`SESSION_CACHE_ENGINE=redis`)
- Redis reachable on `REDIS_HOST` / `REDIS_PORT`
- `npx autocannon` available (already used in this repo)

## Quick Start

Default 10-minute measured run (plus 30-second warm-up):

```bash
npm run perf:local:signoff
```

Default target URL is `http://127.0.0.1:3001/health` (stable final `2xx` endpoint for out-of-the-box runs).

One-hour signoff profile (plus 10-minute warm-up):

```bash
npm run perf:local:signoff:1h
```

The script exits `0` on PASS and `1` on FAIL.

The script now performs a fail-fast HTTP pre-check before warm-up/load and aborts early unless `TARGET_URL` returns a final `2xx` response (non-redirecting).

Pre-check includes bounded retry/backoff for transient network/server blips:

- `PRECHECK_MAX_RETRIES` (default `3`)
- `PRECHECK_RETRY_BACKOFF_SECONDS` (default `2`)

For the known location redirect ping-pong (`/location/rawtenstall_rossendale` ↔ query URL), pre-check now fails immediately with explicit status reason:

- `result=FAIL reason=invalid_signoff_target_location_redirect_loop`
- includes `suggested_replacement_url=http://127.0.0.1:3001/location/rawtenstall_rossendale/health-effects`

Optional request headers are applied consistently to pre-check, warm-up, and measured run:

- `REQUEST_HEADER` for a single custom request header (for example auth/session related headers).
- `COOKIE_BOOTSTRAP_URL` to auto-fetch cookies via a bootstrap request and pass them as a `Cookie:` header in load requests.
- `COOKIE_BOOTSTRAP_STRICT=1` to fail fast when bootstrap request fails or returns no cookies (default: non-strict warning + continue).

Load-shape tuning:

- `AUTOCANNON_CONNECTIONS` controls concurrent connections for warm-up and measured run (default `10`).
- `PERF_PROFILE=cache-active-local` applies cache-active local defaults (connections, duration/warm-up, and latency thresholds).
- `THRESHOLD_MODE` switches threshold set: `strict` (default) or `local-realistic`.

Request volume gate:

- `THRESHOLD_MIN_REQUESTS` (default `30`) marks very short/quiet runs as `INCONCLUSIVE` instead of pass/fail.

Hit rate is now scored only when Redis keyspace activity is meaningful. If `(keyspace_hits + keyspace_misses)` is below `THRESHOLD_MIN_KEYSPACE_ACTIVITY` (default `10`), the report shows `hit_rate_pct=N/A` and does not fail overall on hit rate alone.

## Default Thresholds

- Memory:
  - `used_pct_of_node < 60`
  - `growth_pct_per_hour <= 10`
- Evictions:
  - `evictions_delta <= 0`
- Hit Rate:
  - `hit_rate_pct >= 80`
- Latency/Error:
  - `p97_5_ms <= 400`
  - `p99_ms <= 800`
  - `error_rate_pct < 1`

## Useful Overrides

```bash
RATE=5 DURATION=1800 TARGET_URL=http://127.0.0.1:3001/ npm run perf:local:signoff
```

Recommended realistic load target override (application route):

```bash
TARGET_URL='http://127.0.0.1:3001/' RATE=2 DURATION=1800 npm run perf:local:signoff
```

Tip: validate your chosen route is final `2xx` before long runs:

```bash
curl -sS -o /dev/null -w 'code=%{http_code} redirect=%{redirect_url}\n' "$TARGET_URL"
```

Route-specific tip (location pages): pick a URL that is already canonical and does not redirect on first request.
If the candidate returns `301`, copy the `redirect=` URL from the curl output and re-test that URL; use the first URL that returns direct `2xx` with an empty `redirect`.

```bash
# 1) Start with the route you want to test
CANDIDATE_URL='http://127.0.0.1:3001/location/rawtenstall_rossendale'

# 2) Check pre-check compatibility (must be 2xx and empty redirect)
curl -sS -o /dev/null -w 'code=%{http_code} redirect=%{redirect_url}\n' "$CANDIDATE_URL"

# 3) Use it only when it returns direct 2xx
TARGET_URL="$CANDIDATE_URL" npm run perf:local:signoff
```

Session-aware route profile (auto-cookie bootstrap):

```bash
TARGET_URL='http://127.0.0.1:3001/location/rawtenstall_rossendale' \
COOKIE_BOOTSTRAP_URL='http://127.0.0.1:3001/location/rawtenstall_rossendale' \
RATE=1 DURATION=3600 WARMUP_RATE=1 WARMUP_DURATION=120 \
npm run perf:local:signoff
```

Cache-active location profile (direct `2xx` slug route, tuned for realistic local latency):

```bash
TARGET_URL='http://127.0.0.1:3001/location/rawtenstall_rossendale' \
RATE=1 WARMUP_RATE=1 WARMUP_DURATION=120 DURATION=3600 \
AUTOCANNON_CONNECTIONS=2 \
THRESHOLD_P97_5_MS=1000 THRESHOLD_P99_MS=1200 \
npm run perf:local:signoff
```

Profile shortcut commands:

```bash
npm run perf:local:signoff:cache-active
npm run perf:local:signoff:cache-active:1h
```

Preflight-only command (no warm-up/load):

```bash
npm run perf:local:preflight
```

Threshold mode commands:

```bash
npm run perf:local:signoff:strict
npm run perf:local:signoff:local-realistic
```

1-hour canary with periodic checkpoint summaries (latency/hit-rate/error-rate):

```bash
npm run perf:local:canary:1h
```

```bash
THRESHOLD_HIT_RATE=85 THRESHOLD_P99_MS=700 npm run perf:local:signoff
```

```bash
THRESHOLD_MIN_KEYSPACE_ACTIVITY=50 npm run perf:local:signoff
```

```bash
REDIS_NODE_MEMORY_BYTES=8589934592 npm run perf:local:signoff
```

## Notes

- Local signoff is for tuning confidence.
- Final release signoff should still be confirmed from CDP Grafana/CloudWatch windows.
