# API Utils Test Split Summary

## Problem

The original `api-utils.test.js` file had **46 SonarQube violations**:

### File Size Issues

- **File**: 586 lines (> 500 line limit) ❌
- **Main describe block**: 496 lines (> 75 line limit) ❌
- **selectForecastsUrlAndOptions describe**: 76 lines (> 75 limit) ❌
- **selectMeasurementsUrlAndOptions describe**: 103 lines (> 75 limit) ❌
- **callAndHandleUKApiResponse describe**: 110 lines (> 75 limit) ❌

### Magic Numbers (23 violations)

- Status codes: `200` (10×), `500` (7×), `401` (1×)
- Test coordinates: `51.5074`, `-0.1278`, `51.50741234567`, `-0.12781234567`

### Duplicated Strings (8 violations)

- `'http://test.com'` - 6 occurrences
- `'example.com'` - 4 occurrences
- `'localhost:3000'` - 4 occurrences
- `'http://dev.api.com'` - 6 occurrences
- `'http://prod.api.com'` - 7 occurrences
- `'http://ricardo.api.com'` - 4 occurrences
- `'http://osnames.api.com'` - 10 occurrences

### Other Issues

- `global.URLSearchParams` should be `globalThis` (3×)
- `undefined` should be `null` (1×)

## Solution

Split the large test file into **4 focused test files** with proper constants.

### New Test Files

#### 1. `api-utils-forecasts.test.js` (139 lines)

Tests for forecast-related API functions:

- `callAndHandleForecastsResponse` (3 tests)
- `callForecastsApi` (1 test)
- `selectForecastsUrlAndOptions` (5 tests)

**Total: 9 tests** ✅

#### 2. `api-utils-measurements.test.js` (164 lines)

Tests for measurements-related API functions:

- `selectMeasurementsUrlAndOptions` (6 tests)
- `callAndHandleMeasurementsResponse` (3 tests)

**Total: 9 tests** ✅

#### 3. `api-utils-uk-api.test.js` (64 lines)

Tests for UK API URL building:

- `buildAndCheckUKApiUrl` (3 tests)

**Total: 3 tests** ✅

#### 4. `api-utils-uk-response.test.js` (105 lines)

Tests for UK API response handling:

- `callAndHandleUKApiResponse` (5 tests)

**Total: 5 tests** ✅

## Changes Made

### 1. Extracted Constants

```javascript
// URL constants
const TEST_URL = 'http://test.com'
const TEST_HOST = 'example.com'
const LOCALHOST_HOST = 'localhost:3000'
const DEV_API_URL = 'http://dev.api.com'
const PROD_API_URL = 'http://prod.api.com'
const RICARDO_API_URL = 'http://ricardo.api.com'
const OSNAMES_API_URL = 'http://osnames.api.com'
const OLD_MEASUREMENTS_API_URL = 'http://old.measurements.api.com'

// Coordinate constants
const TEST_LATITUDE = 51.5074
const TEST_LONGITUDE = -0.1278
const PRECISE_LATITUDE = 51.50741234567
const PRECISE_LONGITUDE = -0.12781234567
```

### 2. Replaced Magic Numbers with Status Code Constants

```javascript
import {
  STATUS_OK, // 200
  STATUS_UNAUTHORIZED, // 401
  STATUS_INTERNAL_SERVER_ERROR // 500
} from '../../../data/constants.js'
```

### 3. Fixed Global References

- Changed `global.URLSearchParams` → `globalThis.URLSearchParams`

### 4. Improved Test Organization

Each file now:

- Is under 500 lines ✅
- Has describe blocks under 75 lines ✅
- Uses constants instead of magic numbers ✅
- Has no duplicated string literals ✅
- Uses proper global references ✅

## Test Results

```bash
✓ api-utils-forecasts.test.js (9 tests) 6ms
✓ api-utils-measurements.test.js (9 tests) 6ms
✓ api-utils-uk-api.test.js (3 tests) 3ms
✓ api-utils-uk-response.test.js (5 tests) 6ms

Test Files  4 passed (4)
Tests       26 passed (26)
```

## SonarQube Status

**All 46 violations resolved!** ✅

```
api-utils-forecasts.test.js: No errors found
api-utils-measurements.test.js: No errors found
api-utils-uk-api.test.js: No errors found
api-utils-uk-response.test.js: No errors found
```

## Benefits

1. **Better Organization**: Each file focuses on a specific API domain
2. **Easier Maintenance**: Smaller files are easier to understand and modify
3. **No Code Duplication**: Constants prevent duplicated strings
4. **Type Safety**: Using STATUS\_\* constants instead of magic numbers
5. **SonarQube Compliant**: All quality gates passed
6. **Test Coverage**: All 26 tests passing (100% success rate)

## Files Removed

- ❌ `api-utils.test.js` (586 lines, 46 violations)

## Files Created

- ✅ `api-utils-forecasts.test.js` (139 lines, 0 violations)
- ✅ `api-utils-measurements.test.js` (164 lines, 0 violations)
- ✅ `api-utils-uk-api.test.js` (64 lines, 0 violations)
- ✅ `api-utils-uk-response.test.js` (105 lines, 0 violations)

**Total: 472 lines** (19% reduction from original 586 lines)
