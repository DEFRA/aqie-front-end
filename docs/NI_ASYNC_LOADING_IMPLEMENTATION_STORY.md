# Story: Implement Async Loading for NI Postcode Searches

**Epic**: Northern Ireland API Integration  
**Story Points**: 8  
**Priority**: High  
**Status**: In Progress

---

## Problem Statement

Northern Ireland postcode searches are experiencing browser timeouts and poor user experience due to the NI API's cold start behavior and synchronous request handling.

### User Impact

- **80-90% of users** experience browser timeout errors (`ERR_NETWORK_CHANGED`) instead of seeing results
- Users never see the retry page when automatic retries succeed but take too long (>12 seconds)
- Server successfully processes requests but browser gives up before receiving response

---

## Root Cause Analysis

### NI API Behavior (Azure API Gateway with OAuth)

- **Cold start pattern**: First request takes ~8 seconds and times out
- **Second request**: Succeeds in ~1.5 seconds (API is now warm)
- **Success rate**: 80-90% of first attempts fail, second attempts succeed

### Current Architecture Issues

1. **Synchronous POST handler**: Form submits to `/location`, middleware processes synchronously
2. **Timeout constraints**:
   - Current config: `niApiTimeoutMs=8000ms`, `niApiMaxRetries=2`
   - Maximum processing time: ~16-17 seconds (8s × 2 retries + delays)
   - Browser/Load Balancer timeout: ~10-12 seconds
3. **Race condition**: Server completes successfully after 12s, but browser already timed out at 10s

### Previous Architecture (Removed)

- Commit `7809676e`: Had `/loading` route for async processing
- Commit `840bc9fc`: Changed to `/retry` route
- Commit `dbad9979`: Removed entirely
- Commit `5c9e9e79`: Removed remaining client-side JavaScript
- **Why removed**: Client-side code bypassed API call and went directly to retry page without trying

---

## Solutions Attempted

### ❌ Attempt 1: Remove Client-Side Bypass

**Approach**: Remove JavaScript that sent NI searches directly to `/retry`  
**Result**: ✅ Fixed original bug (API now called properly) but ❌ Created new issue (browser timeouts)  
**Why it failed**: Made all requests synchronous, exceeding browser timeout limits

### ❌ Attempt 2: Reduce Timeout to 6s × 1 retry = 12s

**Approach**: `niApiTimeoutMs=6000`, `niApiMaxRetries=1`  
**Result**: Still exceeds browser timeout, frequently fails on cold starts  
**Why it failed**: 12s still too close to browser timeout; cold starts need 2 attempts

### ❌ Attempt 3: Reduce Timeout to 4s × 2 retries = ~10s

**Approach**: `niApiTimeoutMs=4000`, `niApiMaxRetries=2`  
**Result**: Better but still risky; 10s at edge of browser timeout  
**Why it failed**:

- Total time: 4s (fail) + 1s delay + 4s (fail) + 1s delay = 10s
- Still races against browser timeout
- No buffer for network variability

---

## Proposed Solution: Async Loading Page

### Architecture Overview

```
User submits NI postcode
    ↓
Form POST to /location
    ↓
Detect NI postcode → Start async processing
    ↓
Immediately redirect to /loading (200ms response)
    ↓
Loading page shows spinner
    ↓
JavaScript polls /loading-status every 2s
    ↓
Server processes NI API in background:
  - First attempt: 4s timeout → fails (cold start)
  - Retry delay: 1s
  - Second attempt: 1.5s → succeeds
  - Save to session
    ↓
Polling detects completion → redirect to results
```

### Key Components

#### 1. Loading Page (`/loading`)

- Shows friendly spinner/progress indicator
- Client-side JavaScript polls for status
- No timeout issues (page loads immediately)
- User sees progress, not browser errors

#### 2. Status Polling Endpoint (`/loading-status`)

- Returns JSON: `{ status: 'processing' | 'complete' | 'failed', redirectTo?: string }`
- Checks session for completion flag
- Lightweight endpoint (no API calls)

#### 3. Background Processing

- Session stores: `{ niProcessing: true, niPostcode: 'BT1 1AA' }`
- Async worker calls `getNIPlaces()` with retries
- On success: Store results in session, set `niProcessing: false`, set redirect URL
- On failure: Set `niError: 'service-unavailable'`, redirect to retry page

#### 4. Configuration

- `niApiTimeoutMs: 4000` (fail fast on cold starts)
- `niApiMaxRetries: 2` (enough for cold start pattern)
- Total background time: ~6-7 seconds for most users

### User Experience

| Scenario                | Old Flow (Sync)                 | New Flow (Async)          |
| ----------------------- | ------------------------------- | ------------------------- |
| **Cold start (80-90%)** | Browser timeout error after 12s | Spinner 6s → Results ✅   |
| **Warm API (10-20%)**   | Spinner 1.5s → Results          | Spinner 1.5s → Results ✅ |
| **Actual API failure**  | Browser timeout or retry page   | Spinner → Retry page ✅   |

### Benefits

1. ✅ **No browser timeouts**: Page loads immediately, processing happens in background
2. ✅ **Better UX**: Users see progress indicator instead of hanging browser
3. ✅ **Handles cold starts**: Can take 20+ seconds if needed without user-facing issues
4. ✅ **Proper error handling**: Retry page only shows for actual failures, not slow responses
5. ✅ **Scalable**: Can add progress updates, estimated time, etc.

### Technical Details

#### Session State Machine

```javascript
// Initial state (form submission)
{ niProcessing: true, niPostcode: 'BT1 1AA', startTime: Date.now() }

// Processing
{ niProcessing: true, niPostcode: 'BT1 1AA', startTime: 1234567890 }

// Success
{
  niProcessing: false,
  niResults: [...],
  redirectTo: '/location?q=BT1+1AA',
  processingTime: 6200
}

// Failure
{
  niProcessing: false,
  niError: 'service-unavailable',
  redirectTo: '/retry?postcode=BT1+1AA'
}
```

#### Polling Strategy

- Poll every 2 seconds (not too aggressive)
- Maximum 30 seconds before timeout (safety net)
- Exponential backoff if needed: 2s, 2s, 3s, 5s...

---

## Implementation Plan

### Phase 1: Core Infrastructure

1. ✅ Create new branch `feature/async-ni-loading`
2. Create `/loading` route and page template
3. Create `/loading-status` polling endpoint
4. Update session schema for async state

### Phase 2: Async Processing

5. Modify `/location` POST handler to detect NI postcodes
6. Trigger background processing for NI searches
7. Implement session-based state tracking
8. Add timeout safeguards

### Phase 3: Configuration & Testing

9. Update config: `niApiTimeoutMs=4000`
10. Test cold start scenarios (first request fails, second succeeds)
11. Test warm API scenarios (first request succeeds)
12. Test actual failure scenarios (all retries fail → retry page)
13. Test concurrent users (session isolation)

### Phase 4: Monitoring & Rollout

14. Add metrics: processing time, success rate, retry rate
15. Deploy to perf-test environment
16. Monitor real-world behavior
17. Adjust polling interval/timeouts based on data

---

## Acceptance Criteria

- [ ] NI postcode searches never cause browser timeout errors
- [ ] Users see loading indicator within 500ms of form submission
- [ ] 80-90% of searches complete in 6-7 seconds (cold start)
- [ ] 10-20% of searches complete in 1.5-2 seconds (warm API)
- [ ] Actual API failures show retry page with manual button
- [ ] Loading page accessible (screen reader announcements)
- [ ] Concurrent users don't interfere with each other (session isolation)
- [ ] All existing tests pass
- [ ] New tests cover async flow edge cases

---

## Risks & Mitigation

| Risk                                 | Impact | Mitigation                                          |
| ------------------------------------ | ------ | --------------------------------------------------- |
| Session race conditions              | High   | Use atomic session updates, add locks if needed     |
| Infinite polling loops               | Medium | Hard timeout at 30s, redirect to retry page         |
| Memory leaks from abandoned sessions | Low    | Session TTL cleanup, garbage collection             |
| User closes browser mid-processing   | Low    | Session cleanup on next visit, acceptable data loss |

---

## Rollback Plan

If async implementation causes issues:

```bash
git checkout chore/retry-loading-ux
git push origin chore/retry-loading-ux --force
```

Previous branch has:

- ✅ NI API properly called (not bypassed)
- ❌ Browser timeouts still occur
- ✅ All tests passing
- ✅ Known working state

---

## Related Documentation

- `docs/NI_API_TIMEOUT_AND_RETRY_IMPLEMENTATION.md` - Original retry logic
- `docs/NI_POSTCODE_REDIRECT_FIX.md` - Previous bypass fix
- `docs/TEST_ENVIRONMENT_DIAGNOSTICS.md` - Testing approaches

---

## Technical Debt

### Future Improvements

1. **WebSocket alternative**: Replace polling with WebSocket for real-time updates
2. **Progress estimation**: Show "Searching... (5s remaining)" based on averages
3. **Caching**: Cache successful NI results to avoid cold starts for repeated searches
4. **Circuit breaker**: Temporarily disable NI API if failure rate exceeds threshold
5. **Fallback flow**: If loading takes >15s, show "taking longer than expected" message

### Why Not WebSocket Now?

- Adds complexity (WebSocket infrastructure, connection handling)
- Polling is simpler and works for current scale
- Can migrate later without changing user-facing flow
- Polling handles network interruptions better

---

## Definition of Done

- [ ] Code reviewed and approved
- [ ] All tests passing (unit + integration)
- [ ] Tested in perf-test environment with real NI API
- [ ] Accessibility audit passed (loading page screen reader friendly)
- [ ] Documentation updated
- [ ] Monitoring/logging in place
- [ ] Stakeholders approve UX changes
- [ ] Deployed to production
- [ ] Post-deployment monitoring shows <1% error rate

---

**Created**: 2026-02-14  
**Updated**: 2026-02-14  
**Assignee**: GitHub Copilot  
**Reporter**: Development Team
