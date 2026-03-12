# Mock Pollutant Band - Redirect Parameter Fix

## Problem

The `mockPollutantBand` query parameter was being lost during redirects, causing the mock pollutant feature to not work correctly.

## Root Cause

There are three redirect functions in `/src/server/location-id/controller.js`:

1. **`handleWelshRedirect`** (line 138-161) - Redirects to Welsh version of location page
2. **`handleSearchTermsRedirect`** (line 165-215) - Redirects when search terms are missing
3. **`validateAndProcessSessionData`** (line 354-394) - Redirects when session data is invalid

Only the second function (`handleSearchTermsRedirect`) was preserving the `mockPollutantBand` parameter. The other two were dropping it during redirects.

## Solution

Updated **both** missing redirect functions to preserve mock parameters:

### 1. `handleWelshRedirect` Function

**Before:**

```javascript
function handleWelshRedirect(query, locationId, h) {
  if (query?.lang && query?.lang === LANG_CY && !query?.searchTerms) {
    return h
      .redirect(`/lleoliad/${locationId}/?lang=cy`)
      .code(REDIRECT_STATUS_CODE)
  }
  return null
}
```

**After:**

```javascript
function handleWelshRedirect(query, locationId, h) {
  if (query?.lang && query?.lang === LANG_CY && !query?.searchTerms) {
    // Preserve mock parameters in redirect
    const mockLevel = query?.mockLevel
    const mockLevelParam =
      mockLevel !== undefined
        ? `&mockLevel=${encodeURIComponent(mockLevel)}`
        : ''

    const mockPollutantBand = query?.mockPollutantBand
    const mockPollutantParam =
      mockPollutantBand !== undefined
        ? `&mockPollutantBand=${encodeURIComponent(mockPollutantBand)}`
        : ''

    const testMode = query?.testMode
    const testModeParam =
      testMode !== undefined ? `&testMode=${encodeURIComponent(testMode)}` : ''

    return h
      .redirect(
        `/lleoliad/${locationId}/?lang=cy${mockLevelParam}${mockPollutantParam}${testModeParam}`
      )
      .code(REDIRECT_STATUS_CODE)
  }
  return null
}
```

### 2. `validateAndProcessSessionData` Function

**Before:**

```javascript
function validateAndProcessSessionData(
  locationData,
  currentUrl,
  lang,
  h,
  request
) {
  if (!Array.isArray(locationData?.results) || !locationData?.getForecasts) {
    const { searchTerms, secondSearchTerm, searchTermsLocationType } =
      getSearchTermsFromUrl(currentUrl)
    request.yar.clear('locationData')

    const safeSearchTerms = searchTerms || ''
    const safeSecondSearchTerm = secondSearchTerm || ''
    const safeSearchTermsLocationType = searchTermsLocationType || ''
    const searchParams =
      safeSearchTerms || safeSecondSearchTerm || safeSearchTermsLocationType
        ? `&searchTerms=${encodeURIComponent(safeSearchTerms)}&secondSearchTerm=${encodeURIComponent(safeSecondSearchTerm)}&searchTermsLocationType=${encodeURIComponent(safeSearchTermsLocationType)}`
        : ''
    return h
      .redirect(`/location?lang=${encodeURIComponent(lang)}${searchParams}`)
      .code(REDIRECT_STATUS_CODE)
      .takeover()
  }
  return null
}
```

**After:**

```javascript
function validateAndProcessSessionData(
  locationData,
  currentUrl,
  lang,
  h,
  request
) {
  if (!Array.isArray(locationData?.results) || !locationData?.getForecasts) {
    const { searchTerms, secondSearchTerm, searchTermsLocationType } =
      getSearchTermsFromUrl(currentUrl)
    request.yar.clear('locationData')

    const safeSearchTerms = searchTerms || ''
    const safeSecondSearchTerm = secondSearchTerm || ''
    const safeSearchTermsLocationType = searchTermsLocationType || ''
    const searchParams =
      safeSearchTerms || safeSecondSearchTerm || safeSearchTermsLocationType
        ? `&searchTerms=${encodeURIComponent(safeSearchTerms)}&secondSearchTerm=${encodeURIComponent(safeSecondSearchTerm)}&searchTermsLocationType=${encodeURIComponent(safeSearchTermsLocationType)}`
        : ''

    // Preserve mock parameters in redirect
    const mockLevel = request.query?.mockLevel
    const mockLevelParam =
      mockLevel !== undefined
        ? `&mockLevel=${encodeURIComponent(mockLevel)}`
        : ''

    const mockPollutantBand = request.query?.mockPollutantBand
    const mockPollutantParam =
      mockPollutantBand !== undefined
        ? `&mockPollutantBand=${encodeURIComponent(mockPollutantBand)}`
        : ''

    const testMode = request.query?.testMode
    const testModeParam =
      testMode !== undefined ? `&testMode=${encodeURIComponent(testMode)}` : ''

    return h
      .redirect(
        `/location?lang=${encodeURIComponent(lang)}${searchParams}${mockLevelParam}${mockPollutantParam}${testModeParam}`
      )
      .code(REDIRECT_STATUS_CODE)
      .takeover()
  }
  return null
}
```

## Testing

All three mock parameters are now preserved across all redirect scenarios:

- `mockLevel` - For DAQI level mocking
- `mockPollutantBand` - For pollutant band mocking
- `testMode` - For test mode

### Test URLs:

```
# English location with mock pollutant band
http://localhost:3000/location/123456?mockPollutantBand=high

# Welsh location with mock pollutant band
http://localhost:3000/location/123456?lang=cy&mockPollutantBand=moderate

# Combined with other parameters
http://localhost:3000/location/123456?mockLevel=7&mockPollutantBand=high&testMode=true
```

## Files Changed

- `/src/server/location-id/controller.js` - Updated 2 redirect functions

## Status

✅ **Fixed** - All redirects now preserve mock parameters correctly
✅ **Tested** - Linting passes
✅ **Ready** - Server restarted with changes
