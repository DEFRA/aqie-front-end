# ✅ Perf-Test Environment: Mock Disable Coverage

## Summary

**YES** - All 4 mock parameters are now disabled in both `production` AND `perf-test` environments.

---

## 🔒 Configuration Change

### File: `src/config/index.js`

**Line 23:** Added perf-test environment constant

```javascript
const isPerfTest = process.env.NODE_ENV === 'perf-test'
```

**Lines 155-160:** Updated disableTestMocks to include perf-test

```javascript
disableTestMocks: {
  doc: 'Disable test mock parameters (mockLevel, mockDay, mockPollutantBand, testMode). Defaults to true in production and perf-test environments, false otherwise. Set DISABLE_TEST_MOCKS=true to test production behavior in development.',
  format: Boolean,
  default: isProduction || isPerfTest,  // ← Changed from just isProduction
  env: 'DISABLE_TEST_MOCKS'
}
```

---

## ✅ All 4 Mock Parameters Protected

### 1. `?mockLevel=` - Mock DAQI Levels

**File:** `src/server/location-id/controller.js`

- **Line 46:** `const mocksDisabled = config.get('disableTestMocks')`
- **Line 48:** Returns early if `mocksDisabled` is true
- **Line 520:** Logs warning: `🚫 Attempted to set mock level when mocks disabled`

### 2. `?mockDay=` - Mock Forecast Days

**File:** `src/server/location-id/controller.js`

- **Line 526-539:** Checks `mocksDisabled` before storing mockDay in session
- **Line 538:** Logs warning: `🚫 Attempted to set mock day when mocks disabled`

### 3. `?mockPollutantBand=` - Mock Pollutant Bands

**File:** `src/server/location-id/controller.js`

- **Line 138:** `const mocksDisabled = config.get('disableTestMocks')`
- **Line 140:** Returns early if `mocksDisabled` is true
- **Line 557-573:** Checks `mocksDisabled` before storing in session
- **Line 572:** Logs warning: `🚫 Attempted to set mock pollutant band when mocks disabled`

### 4. `?testMode=` - Test Mode Flag

**File:** `src/server/location-id/controller.js`

- **Line 577-585:** Checks `mocksDisabled` before storing testMode in session
- **Line 584:** Logs warning: `🚫 Attempted to set test mode when mocks disabled`

---

## 🌍 Environment Behavior

| Environment     | `NODE_ENV`    | `disableTestMocks` | Mocks Work? |
| --------------- | ------------- | ------------------ | ----------- |
| **Development** | `development` | `false`            | ✅ YES      |
| **Test**        | `test`        | `false`            | ✅ YES      |
| **Production**  | `production`  | `true`             | ❌ NO       |
| **Perf-Test**   | `perf-test`   | `true`             | ❌ NO       |

---

## 🧪 How to Test Perf-Test Environment

### Start Server in Perf-Test Mode

```bash
NODE_ENV=perf-test npm start
```

### Test All 4 Mock Parameters Are Disabled

```bash
# 1. Test mockLevel is ignored
curl "http://localhost:3000/location/AQ0104?mockLevel=9"
# Expected: Real data shown, warning log appears

# 2. Test mockDay is ignored
curl "http://localhost:3000/location/AQ0104?mockDay=day3"
# Expected: Real data shown, warning log appears

# 3. Test mockPollutantBand is ignored
curl "http://localhost:3000/location/AQ0104?mockPollutantBand=LOW_HIGH"
# Expected: Real data shown, warning log appears

# 4. Test testMode is ignored
curl "http://localhost:3000/location/AQ0104?testMode=true"
# Expected: Test mode not enabled, warning log appears
```

### Expected Warning Logs

```
🚫 Attempted to set mock level when mocks disabled (disableTestMocks=true) - ignoring parameter
🚫 Attempted to set mock day when mocks disabled (disableTestMocks=true) - ignoring parameter
🚫 Attempted to set mock pollutant band when mocks disabled (disableTestMocks=true) - ignoring parameter
🚫 Attempted to set test mode when mocks disabled (disableTestMocks=true) - ignoring parameter
```

---

## 🔐 Security Coverage

### ✅ All Mock Parameters Secured in Perf-Test

- ✅ **mockLevel** - Cannot override DAQI levels
- ✅ **mockDay** - Cannot force specific forecast days
- ✅ **mockPollutantBand** - Cannot manipulate pollutant data
- ✅ **testMode** - Cannot enable test mode

### ✅ Redirect Protection

**File:** `src/server/locations/helpers/middleware-helpers.js`

- Mock parameters are NOT preserved in redirects when `disableTestMocks=true`
- Applies to all location search redirects

---

## 📊 Code Flow

```
1. Request arrives with mock parameter (e.g., ?mockLevel=9)
   ↓
2. initializeRequestData() checks NODE_ENV
   ↓
3. If NODE_ENV === 'perf-test' → disableTestMocks = true
   ↓
4. Mock parameter check: if (mocksDisabled && query?.mockLevel !== undefined)
   ↓
5. Log warning and IGNORE parameter
   ↓
6. Real data is used instead of mocked data
```

---

## 🎯 Summary

**Question:** Does it cover for perf-test all 4 mock parameters?

**Answer:** ✅ **YES - All 4 mock parameters are fully secured in perf-test environment**

The single configuration change:

```javascript
default: isProduction || isPerfTest
```

Automatically protects:

1. ✅ `?mockLevel=` - via `applyMockLevel()` function
2. ✅ `?mockDay=` - via `initializeRequestData()` session storage
3. ✅ `?mockPollutantBand=` - via `applyMockPollutants()` function
4. ✅ `?testMode=` - via `initializeRequestData()` session storage

**No additional changes needed** - the centralized config approach means one change protects everything! 🎉
