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

One-hour signoff profile (plus 10-minute warm-up):

```bash
npm run perf:local:signoff:1h
```

The script exits `0` on PASS and `1` on FAIL.

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
RATE=5 DURATION=1800 TARGET_URL=http://127.0.0.1:3000/location/rawtenstall_rossendale npm run perf:local:signoff
```

```bash
THRESHOLD_HIT_RATE=85 THRESHOLD_P99_MS=700 npm run perf:local:signoff
```

```bash
REDIS_NODE_MEMORY_BYTES=8589934592 npm run perf:local:signoff
```

## Notes

- Local signoff is for tuning confidence.
- Final release signoff should still be confirmed from CDP Grafana/CloudWatch windows.
