# Northern Ireland API Search Page Not Found Fix

## Date

4 February 2026

## Problem

Northern Ireland postcode searches were redirecting to "page not found" when users accessed NI location URLs directly (e.g., `/location/bt11aa`).

## Root Cause

The issue was in `src/server/locations/middleware.js` at line 360 (now 363). When a user directly accessed a Northern Ireland location URL:

1. **Direct URL access** (e.g., `/location/bt11aa`):
   - No query parameters present, so `searchTerms` is `undefined`
   - Middleware skips setting `searchTermsSaved` at line 594 (conditional check: `if (searchTerms)`)
2. **NI Location Processing**:
   - `processNILocationType` receives `undefined` for `searchTerms` parameter
   - Line 360 sets: `request.yar.set('searchTermsSaved', searchTerms)`
   - This stores `undefined` in the session
3. **Controller Redirect Loop**:
   - Controller checks `searchTermsSaved` in `handleSearchTermsRedirect`
   - Sees falsy value (`undefined`)
   - Redirects back to `/location?searchTerms=...`
   - Loop continues until timeout, showing "page not found"

## Solution

Modified `processNILocationType` to use a fallback value when `searchTerms` is undefined:

```javascript
// '' Set searchTermsSaved with the actual postcode if searchTerms is undefined
// '' This prevents redirect loops when accessing NI location URLs directly
const savedSearchTerms = searchTerms || firstNIResult.postcode
request.yar.set('searchTermsSaved', savedSearchTerms)
logger.info(
  `[DEBUG processNILocationType] Set searchTermsSaved: ${savedSearchTerms} (original searchTerms: ${searchTerms})`
)
```

### Why This Works

1. **First visit with search**: `searchTerms` is defined → uses it
2. **Direct URL access**: `searchTerms` is undefined → falls back to `firstNIResult.postcode`
3. **Controller check**: Always finds a truthy `searchTermsSaved` value → no redirect loop

## Files Changed

- `src/server/locations/middleware.js` (lines 361-366)

## Testing

- No linting errors introduced
- Solution follows existing pattern used for session state management
- Maintains backward compatibility with search flow

## Related Issues

This fix resolves the same redirect loop pattern that was previously fixed for UK postcodes. The NI processing flow now matches the UK flow in terms of session state management.

<!-- '' -->
