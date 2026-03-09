# CDP Support Note: Redis Memory Incident on Location Route

## Purpose

This note explains, in plain terms, what happened, what we changed, and how CDP can verify the fix.

## Incident Summary

- Reported symptom: Redis memory usage increased rapidly (reported as approximately `2.41%` to `93.2%`).
- Trigger pattern: repeated requests to `/location/rawtenstall_rossendale` (bot-like traffic).
- Operational impact: service stability risk due to memory pressure.

## Root Cause (What Was Happening)

For repeated requests without a valid session cookie, parts of the location flow still attempted session operations (set/clear) through Yar.

Under high bot traffic, this created avoidable session/cache churn and contributed to Redis pressure.

## Solution Implemented

### 1) Guard session writes/clears when no session cookie exists

File changed:

- `src/server/location-id/controller.js`

Key additions:

- `hasSessionCookie(request)`
- `clearSessionKeyIfExists(request, key)`
- `setSessionKeyIfSessionExists(request, key, value)`

Behavior:

- If no session cookie is present, session mutation is skipped.
- This prevents anonymous/bot requests from causing unnecessary session persistence operations.

### 2) Add bounded telemetry for skipped session mutations

File changed:

- `src/server/location-id/controller.js`

Key addition:

- `logSessionGuardSkip(...)` with per-request log cap.

Operational signal:

- Logs show entries such as:
  - `[SESSION GUARD] Skipped session clear for key='locationData' (no session cookie)`

### 3) Add Redis pressure-jump guard (short-window spike protection)

Files changed:

- `src/server/common/helpers/session-cache/cache-engine.js`
- `src/server/location-id/controller.js`

Behavior:

- A lightweight Redis memory sampler reads `used_memory` periodically.
- If memory jumps sharply within a short window, session mutation is temporarily paused using the same guard path.
- While active, logs include:
  - `[SESSION GUARD] ... (redis pressure guard active)`

This is an additional safety layer to reduce session mutation pressure during sudden Redis growth events.

### 4) Add reproducible bot + Redis monitoring tooling

Files added/updated:

- `scripts/bot-redis-monitor.sh`
- `scripts/load-redis-env-for-mock.sh`
- `scripts/clear-redis-env-for-mock.sh`
- `docs/BOT_REDIS_TEST_RUNBOOK.md`

Capabilities:

- Repeatable bot-like traffic simulation.
- Redis memory and key sampling during test.
- Percentage output field: `used_memory_pct_of_maxmemory`.

## Validation Performed

### A) Route behavior under bot-like traffic

- Repeated load against `/location/rawtenstall_rossendale` returned expected redirects (`301`) in local environment.
- No error spike observed in this test profile.

### B) Session guard evidence

- Server logs repeatedly showed guard events for no-cookie requests:
  - `[SESSION GUARD] Skipped session clear for key='locationData' (no session cookie)`

### C) Redis stability evidence

- Monitor output stayed flat during stress runs:
  - `prefixed_keys=0`
  - memory remained stable in local test profile.

Heavy profile example tested:

- `BOT_RATE=20`, `BOT_DURATION=120` (about 2k requests).
- With temporary `maxmemory=64mb`, percentage remained flat (`1.55%` min/max in that run).

## Why This Addresses the Incident

The fix removes the problematic path where cookie-less bot traffic can cause session mutation churn.

In short:

- Before: anonymous repeated hits could still drive session operations.
- After: anonymous repeated hits skip session mutations and are observable in logs.

## CDP Verification Checklist (Recommended)

1. Generate bot-like traffic to `/location/rawtenstall_rossendale`.
2. Confirm app logs include `[SESSION GUARD] Skipped session ... (no session cookie)`.
3. Monitor Redis memory usage and key growth over the same interval.
4. Confirm there is no sustained growth trend correlated with that traffic.
5. Compare against pre-fix behavior where memory pressure rose rapidly.

## Notes / Limits

- Local tests are representative but not identical to production topology.
- For best confidence, run the same checklist in a CDP environment with production-like routing and Redis settings.
- If Redis `maxmemory=0`, percentage output can be `n/a`; use absolute memory + key trend in that case.

## Supporting Runbook

For exact local commands used in testing, see:

- `docs/BOT_REDIS_TEST_RUNBOOK.md`
