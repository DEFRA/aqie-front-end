# NI API Timeout and Retry Implementation

## Overview

This document describes the implementation of timeout and retry logic for Northern Ireland API calls to address intermittent failures where valid postcodes sometimes fail on the first attempt but succeed on retry.

## Problem Statement

**Issue**: Valid NI postcodes (BT1 1FB, BT93 8AD, BT8 6LL) sometimes fail on first search attempt but succeed when the user retries.

**Root Cause Analysis**:
- OAuth token fetch: ~220-230ms (consistently successful)
- NI API call: ~900-1500ms (slow, sometimes times out)
- Total request time: ~1.1-2.2 seconds
- The NI API is slow and may intermittently timeout or have network issues

**Secondary Issue**: Invalid postcodes (BT7 1NN) returning HTTP 204 caused "Unexpected end of JSON input" errors, showing 500 page instead of 404.

## Solution Implementation

### 1. Configuration (src/config/index.js)

Added three new configurable settings:

```javascript
niApiTimeoutMs: {
  doc: 'Northern Ireland API request timeout in milliseconds',
  format: Number,
  default: 10000,  // 10 seconds
  env: 'NI_API_TIMEOUT_MS'
}

niApiMaxRetries: {
  doc: 'Maximum number of retry attempts for Northern Ireland API calls',
  format: Number,
  default: 2,  // 2 retries = 3 total attempts
  env: 'NI_API_MAX_RETRIES'
}

niApiRetryDelayMs: {
  doc: 'Delay in milliseconds between retry attempts for Northern Ireland API',
  format: Number,
  default: 500,  // 500ms base delay
  env: 'NI_API_RETRY_DELAY_MS'
}
```

**Environment Variables**:
- `NI_API_TIMEOUT_MS`: Timeout for each NI API request (default: 10000ms)
- `NI_API_MAX_RETRIES`: Maximum number of retries (default: 2)
- `NI_API_RETRY_DELAY_MS`: Base delay between retries (default: 500ms)

### 2. Retry Helper (src/server/common/helpers/fetch-with-retry.js)

Created a new `fetchWithRetry` helper function with the following features:

**Key Features**:
- **Configurable timeout**: Uses AbortController for request timeout
- **Exponential backoff**: Delay increases with each retry attempt (delay * attempt)
- **Detailed logging**: Logs each attempt, timeout, and final outcome
- **Error differentiation**: Distinguishes between timeout errors and other errors

**Function Signature**:
```javascript
async function fetchWithRetry(fetchFn, options = {})
```

**Options**:
- `maxRetries`: Number (default: from config)
- `retryDelayMs`: Number (default: from config)
- `timeoutMs`: Number (default: from config)
- `operationName`: String (for logging)

**Retry Logic**:
1. Attempt 1: Execute immediately
2. Attempt 2 (after failure): Wait 500ms (1 * 500ms)
3. Attempt 3 (after failure): Wait 1000ms (2 * 500ms)

**Example Usage**:
```javascript
const result = await fetchWithRetry(
  async (controller) => {
    return await someApiCall({ signal: controller.signal })
  },
  {
    operationName: 'NI API call for BT1 1FB',
    maxRetries: 2,
    retryDelayMs: 500,
    timeoutMs: 10000
  }
)
```

### 3. NI Places Integration (src/server/locations/helpers/get-ni-places.js)

**Changes**:
1. Import `fetchWithRetry` helper
2. Wrap `catchProxyFetchError` call with retry logic
3. Pass AbortController signal for timeout support
4. Skip retries in mock mode (for faster tests)
5. Handle retry failures gracefully

**Implementation**:
```javascript
let statusCodeNI, niPlacesData
try {
  ;[statusCodeNI, niPlacesData] = await fetchWithRetry(
    async (controller) => {
      const optionsWithSignal = controller
        ? { ...optionsOAuth, signal: controller.signal }
        : optionsOAuth

      return await catchProxyFetchError(
        postcodeNortherIrelandURL,
        optionsWithSignal,
        true
      )
    },
    {
      operationName: `NI API call for ${normalizedUserLocation}`,
      maxRetries: isMockEnabled ? 0 : config.get('niApiMaxRetries'),
      retryDelayMs: config.get('niApiRetryDelayMs'),
      timeoutMs: config.get('niApiTimeoutMs')
    }
  )
} catch (error) {
  logger.error(`[getNIPlaces] NI API call failed after retries: ${error.message}`)
  return { results: [], error: SERVICE_UNAVAILABLE_ERROR }
}
```

### 4. HTTP 204 Handling

**Updated** `get-ni-places.js` to handle HTTP 204 (No Content) separately:

```javascript
// Handle 204 No Content as "postcode not found" (not a service error)
if (statusCodeNI === 204) {
  logger.info(`[getNIPlaces] NI API returned 204 No Content - postcode not found`)
  return { results: [] }
}
```

This prevents invalid postcodes from showing a 500 error page.

### 5. Enhanced Error Logging (src/server/common/helpers/catch-proxy-fetch-error.js)

**Changes**:
- Detect AbortError (timeout) separately from other errors
- Log timeout errors with specific messaging
- Preserve existing error handling for HTTP status codes

**Implementation**:
```javascript
catch (error) {
  const isAbortError = error.name === 'AbortError'
  const errorMsg = isAbortError ? 'Request timeout/aborted' : error.message

  logger.error(
    `Failed to proxyFetch data from ${url}: ${errorMsg}${isAbortError ? ' (timeout)' : ''}`
  )
  // ... rest of error handling
}
```

## Testing

### Unit Tests

Created comprehensive tests in `src/server/common/helpers/fetch-with-retry.test.js`:

1. **Success on first attempt**: Verify no retries when successful
2. **Retry and succeed**: Fail first 2 attempts, succeed on 3rd
3. **Exhaust retries**: Fail all attempts and throw error
4. **Timeout handling**: Detect and retry on timeout
5. **Exponential backoff**: Verify delay increases with each retry
6. **AbortController**: Verify controller is passed to fetch function

**Test Results**: All 6 tests pass ✅

### Integration Tests

Existing `get-ni-places.test.js` tests continue to pass:
- ✅ Basic functionality
- ✅ Postcode normalization
- ✅ Mock mode handling
- ✅ Service unavailable error handling
- ✅ SMS journey scenarios

**Test Coverage**:
- `fetch-with-retry.js`: 69.31% (uncovered: retry/timeout edge cases)
- `get-ni-places.js`: 82.85% (uncovered: retry error paths)
- `catch-proxy-fetch-error.js`: 100%

## Deployment & Testing Guide

### Environment Configuration

For production/test environments, set these environment variables:

```bash
# Recommended for production
NI_API_TIMEOUT_MS=10000      # 10 second timeout
NI_API_MAX_RETRIES=2         # 2 retries (3 total attempts)
NI_API_RETRY_DELAY_MS=500    # 500ms base delay

# For slower networks or higher reliability
NI_API_TIMEOUT_MS=15000      # 15 second timeout
NI_API_MAX_RETRIES=3         # 3 retries (4 total attempts)
NI_API_RETRY_DELAY_MS=1000   # 1 second base delay

# For testing (faster feedback)
NI_API_TIMEOUT_MS=5000       # 5 second timeout
NI_API_MAX_RETRIES=1         # 1 retry (2 total attempts)
NI_API_RETRY_DELAY_MS=200    # 200ms base delay
```

### Testing Checklist

#### Valid NI Postcodes (Should Work)
Test these postcodes that previously had intermittent failures:

- [ ] **BT1 1FB** (Belfast City Hall)
  - First attempt should succeed or retry
  - Final result should show correct coordinates
  - Check CloudWatch logs for retry attempts

- [ ] **BT93 8AD** (Enniskillen)
  - First attempt should succeed or retry
  - Final result should show correct coordinates

- [ ] **BT8 6LL** (Stormont)
  - First attempt should succeed or retry
  - Final result should show correct coordinates

#### Invalid NI Postcodes (Should Show 404)
- [ ] **BT7 1NN** (non-existent)
  - Should return "Location not found" page
  - Should NOT show 500 error page
  - Check logs for HTTP 204 handling

#### Performance Testing
- [ ] **First attempt success**: ~1-2 seconds
- [ ] **Retry scenario**: ~2-4 seconds (includes retry delays)
- [ ] **Timeout scenario**: ~10 seconds (timeout threshold)

#### CloudWatch Log Monitoring

Look for these log entries:

**Successful first attempt**:
```
[getNIPlaces] Calling NI API with URL: ...
[fetchWithRetry] Starting NI API call for BT1 1FB
[getNIPlaces] Response status: 200
[fetchWithRetry] NI API call for BT1 1FB succeeded in XXXms
```

**Retry scenario**:
```
[fetchWithRetry] Starting NI API call for BT1 1FB
[fetchWithRetry] NI API call timeout on attempt 1/3: Timeout after 10000ms
[fetchWithRetry] Waiting 500ms before retry 2/3
[fetchWithRetry] Starting NI API call for BT1 1FB (attempt 2/3)
[getNIPlaces] Response status: 200
[fetchWithRetry] NI API call for BT1 1FB succeeded (attempt 2/3) in XXXms
```

**Timeout failure**:
```
[fetchWithRetry] NI API call timeout on attempt 3/3: Timeout after 10000ms
[fetchWithRetry] NI API call for BT1 1FB failed after 3 attempts
[getNIPlaces] NI API call failed after retries: Timeout after 10000ms
```

**HTTP 204 (not found)**:
```
[getNIPlaces] Response status: 204
[getNIPlaces] NI API returned 204 No Content - postcode not found
```

## Benefits

### User Experience
1. **Reduced intermittent failures**: Retries handle transient network issues
2. **Faster perception**: First attempt usually succeeds (~1-2s)
3. **Better error messages**: Invalid postcodes show 404 instead of 500

### Reliability
1. **Automatic recovery**: Up to 3 attempts for each request
2. **Timeout protection**: Prevents hanging requests
3. **Exponential backoff**: Reduces load during network congestion

### Observability
1. **Detailed logging**: Track retry attempts and timing
2. **Error differentiation**: Distinguish timeout vs network vs service errors
3. **Performance metrics**: Measure success rate and retry frequency

## Rollback Plan

If issues occur, disable retries by setting:

```bash
NI_API_MAX_RETRIES=0         # Disable retries
NI_API_TIMEOUT_MS=30000      # Increase timeout to 30s
```

Or revert the commits:
```bash
git revert 357a77d  # Revert timeout/retry implementation
git revert 31e7d14  # Revert OAuth error handling
```

## Future Improvements

1. **Adaptive timeout**: Adjust timeout based on historical response times
2. **Circuit breaker**: Temporarily disable NI API if failure rate is high
3. **Metrics dashboard**: Track retry rate, success rate, average response time
4. **Alerting**: Notify when retry rate exceeds threshold
5. **Caching**: Cache OAuth tokens longer to reduce total request time

## Related Files

- `src/config/index.js` - Configuration
- `src/server/common/helpers/fetch-with-retry.js` - Retry helper
- `src/server/common/helpers/fetch-with-retry.test.js` - Unit tests
- `src/server/locations/helpers/get-ni-places.js` - NI API integration
- `src/server/common/helpers/catch-proxy-fetch-error.js` - Enhanced error handling
- `src/server/common/helpers/fetch-oauth-token.js` - OAuth error handling

## Commits

1. **31e7d14**: Add OAuth error handling and HTTP 204 support for NI API
2. **357a77d**: Add timeout and retry logic for NI API calls
