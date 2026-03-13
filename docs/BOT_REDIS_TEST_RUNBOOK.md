# Bot Traffic + Redis Session Monitoring Runbook

This runbook validates that repeated bot-like hits to location routes do not cause uncontrolled Redis session growth.

## Goal

- Simulate repeated no-cookie traffic to `/location/rawtenstall_rossendale`.
- Force session cache to Redis for this test only.
- Track Redis memory and key growth during the test.

## Prerequisites

- Local app dependencies installed.
- Reachable Redis instance.
- Environment variables set for Redis:
  - `REDIS_HOST`
  - `REDIS_PORT`
  - `REDIS_PASSWORD` (if required)
  - `REDIS_PREFIX` (optional, defaults to `aqie-front-end:*`)

### Optional: Load REDIS\_\* from CDP secret (mock-only helper)

If you do not want to type Redis values locally, you can source the helper script:

```bash
source scripts/load-redis-env-for-mock.sh --namespace <namespace> --secret <secret-name> --mock-only
```

Notes:

- The script loads only keys that begin with `REDIS_`.
- `REDIS_PASSWORD` is redacted in script output.
- This is intended for local mocking/testing only.

### Cleanup: Clear REDIS\_\* from current shell (mock-only helper)

After testing, clear Redis variables from your shell:

```bash
source scripts/clear-redis-env-for-mock.sh --mock-only
```

This unsets only variables matching `REDIS_*`.

## Commands

### 1) Start server with Redis-backed session cache (test only)

```bash
npm run bot:test:server:redis
```

This sets `SESSION_CACHE_ENGINE=redis` only for this command.

### 2) In another terminal, run monitor + bot load

```bash
npm run bot:test:run:redis
```

This does:

- start monitor
- run bot-like load (`autocannon`)
- stop monitor

Default load profile:

- URL: `http://localhost:3000/location/rawtenstall_rossendale`
- rate: `2` requests/sec
- duration: `1800` sec

## Optional overrides

```bash
BOT_URL=http://localhost:3000/location/rawtenstall_rossendale \
BOT_RATE=5 \
BOT_DURATION=120 \
REDIS_MONITOR_INTERVAL=2 \
npm run bot:test:run:redis
```

## Monitor controls (manual)

```bash
npm run bot:test:monitor:start
npm run bot:test:monitor:status
npm run bot:test:monitor:sample
npm run bot:test:monitor:stop
```

## Expected outcomes

- App logs include session-guard messages for no-cookie traffic, for example:
  - `[SESSION GUARD] Skipped session set ... (no session cookie)`
  - `[SESSION GUARD] Skipped session clear ... (no session cookie)`
- Redis monitor output does not show sustained, unbounded growth in:
  - `used_memory_human`
  - `used_memory_pct_of_maxmemory`
  - `prefixed_keys`

### Incident-style percentage metric

The monitor now emits `used_memory_pct_of_maxmemory`, which is the closest local equivalent to Redis memory usage percentage reported during incidents (for example `2.41% -> 93.2%`).

Example monitor line:

```text
2026-03-09 13:05:35 used_memory_human=970.42K used_memory_peak_human=970.67K used_memory_pct_of_maxmemory=2.41 prefixed_keys=0
```

If Redis has no memory limit configured (`maxmemory=0`), the field is reported as `n/a`.

## Notes

- Normal local development remains unchanged (memory cache by default).
- Redis usage is forced only in the dedicated bot-test scripts.
- If `redis-cli` is unavailable, the monitor script falls back to `ioredis`.

## Production Redis Ops Baseline (Server-Level)

Use this as a default for perf-test and production where cache management is intentionally server-level.

### Application Defaults

- `SESSION_CACHE_ENGINE=redis`
- `SESSION_CACHE_TTL=900000` (15 minutes)
- `SESSION_COOKIE_TTL=900000` (15 minutes)
- `SESSION_GLOBAL_GUARD_ENABLED=true`
- Keep `storeBlank=false` (already set in Yar config)

### Redis Server Defaults

- Set `maxmemory` to roughly `70%` of node RAM (leave headroom for OS/background work).
- Preferred eviction policy for session-only caches: `volatile-ttl`.
- If the same Redis is shared with non-TTL keys, use `allkeys-lru`.
- Enable background-friendly options:
  - `lazyfree-lazy-eviction yes`
  - `lazyfree-lazy-expire yes`
  - `activedefrag yes`

### Alert Thresholds

- Memory usage:
  - warning: `used_memory_pct_of_maxmemory > 75%`
  - critical: `used_memory_pct_of_maxmemory > 85%`
- Evictions:
  - warning: `evicted_keys > 0` for 5 continuous minutes
  - critical: `evicted_keys > 10/s` sustained for 5 minutes
- Redis latency:
  - warning: p95 > `5ms`
  - critical: p95 > `15ms`
- Session write pressure:
  - warning when writes/sec > `2x` the 15-minute baseline

### Quick Verification Commands

```bash
# '' Check memory cap and policy
redis-cli INFO memory | egrep 'maxmemory:|maxmemory_human:'
redis-cli CONFIG GET maxmemory-policy

# '' Check evictions and keyspace pressure
redis-cli INFO stats | egrep 'evicted_keys|keyspace_hits|keyspace_misses'

# '' Sample app-prefixed key count
redis-cli --scan --pattern 'aqie-front-end:*' | wc -l
```

### Tuning Guidance

- If evictions occur below expected traffic, increase Redis memory before increasing TTL.
- If memory remains stable but writes are high, reduce app write frequency (avoid unchanged `yar.set`/`yar.clear`).
- Keep perf-test aligned with production TTL/policy to make stress results representative.
