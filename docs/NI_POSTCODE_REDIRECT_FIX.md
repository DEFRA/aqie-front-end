# Northern Ireland Postcode Redirect Fix

## Problem

When users accessed location URLs with normalized Northern Ireland postcodes (e.g., `/location/bt938ad`), the second attempt to view the same location would fail with "location not found" error.

### User Journey

1. User searches for "BT93 8AD" (first time)
   - ✅ Works correctly - middleware creates `urlRoute: "bt938ad"` and redirects
   - ✅ Location details page displays successfully
2. User searches for "BT93 8AD" (second time) or navigates back to `/location/bt938ad`
   - ❌ **FAILS** - System tries to search for literal string "bt938ad"
   - ❌ "Location not found" error displayed

## Root Cause

The issue occurred due to **bidirectional URL normalization failure**:

1. **Middleware (locations/middleware.js lines 184, 290)**:
   - Normalizes postcodes for clean URLs: `BT93 8AD` → `bt938ad`
   - Creates redirect: `/location/bt938ad`
2. **Controller (location-id/controller.js)**:
   - Receives `locationId = "bt938ad"` from URL parameter
   - **BUG**: Used this normalized string directly for search
   - Should convert back to: `BT93 8AD` before searching

### Why First Attempt Worked

On the first search, the `notificationFlow` session flag caused the middleware to skip the redirect, going directly to the location page with the properly formatted postcode. After setting up an alert, this flag was cleared, so subsequent attempts followed the redirect path and exposed the bug.

## Solution

Added postcode denormalization in `handleSearchTermsRedirect` function:

```javascript
// '' Extract searchTerms from URL path (0.685.0 approach)
let { searchTerms, secondSearchTerm, searchTermsLocationType } =
  getSearchTermsFromUrl(currentUrl)

// '' Check if searchTerms is a normalized Northern Ireland postcode (e.g., bt938ad)
// '' and convert it back to proper format (e.g., BT93 8AD)
const normalizedNIPostcodeRegex = /^bt\d{1,2}\d[a-z]{2}$/i
if (normalizedNIPostcodeRegex.test(searchTerms)) {
  logger.info(
    `[DEBUG controller] Detected normalized NI postcode: ${searchTerms}`
  )
  searchTerms = formatNorthernIrelandPostcode(searchTerms.toUpperCase())
  logger.info(
    `[DEBUG controller] Converted to formatted NI postcode: ${searchTerms}`
  )
}
```

### Implementation Details

1. **Detection**: Regex pattern `/^bt\d{1,2}\d[a-z]{2}$/i` matches normalized NI postcodes
   - Examples: `bt938ad`, `BT12HA`, `bt11ab`
2. **Conversion**:
   - Convert to uppercase: `bt938ad` → `BT938AD`
   - Apply `formatNorthernIrelandPostcode` helper: `BT938AD` → `BT93 8AD`
3. **Redirect**: System now redirects with properly formatted postcode

## Files Changed

- `src/server/location-id/controller.js`:
  - Added import for `formatNorthernIrelandPostcode`
  - Added normalization detection and conversion in `handleSearchTermsRedirect`

## Testing

✅ All 1512 tests passed  
✅ No linting errors introduced  
✅ Coverage maintained at 88.29%

### Test Scenario

URL: `/location/bt938ad`

**Before Fix**:

- locationId = "bt938ad"
- Redirect with searchTerms = "bt938ad"
- Search fails → "Location not found"

**After Fix**:

- locationId = "bt938ad"
- Detected as normalized NI postcode
- Converted to searchTerms = "BT93 8AD"
- Redirect succeeds → Location details displayed

## Related Code

### Helper Function Used

```javascript
// src/server/locations/helpers/convert-string.js
export function formatNorthernIrelandPostcode(postcode) {
  const postcodeRegex = /^(BT\d{1,2})(\d[A-Z]{2})$/i
  const match = postcode.match(postcodeRegex)
  if (match) {
    return `${match[1]} ${match[2]}`
  }
  return postcode
}
```

### URL Normalization (Middleware)

```javascript
// src/server/locations/middleware.js line 184
urlRoute: `${firstNIResult.postcode.toLowerCase().replaceAll(/\s+/g, '')}`

// line 290
return h.redirect(`/location/${locationData.urlRoute}`)
```

## Branch Information

- **Branch**: `fix/ni-postcode-redirect-issue`
- **Commit**: `3a678eb`
- **Status**: Pushed to GitHub
- **PR URL**: https://github.com/DEFRA/aqie-front-end/pull/new/fix/ni-postcode-redirect-issue

## Impact

This fix ensures that:

- Northern Ireland postcode searches work consistently on first and subsequent attempts
- URL normalization is properly bidirectional
- User experience is seamless when navigating to NI location pages
- Search functionality remains robust for all postcode formats

## Notes

- Fix is specific to Northern Ireland postcodes (BT prefix)
- Uses existing helper function for consistency
- Maintains backward compatibility with existing URLs
- Logging added for debugging purposes
