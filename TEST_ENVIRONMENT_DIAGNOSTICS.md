# Test Environment Mock Diagnostics

## Issue

Mocks work locally but not in CDP test environment.

## Root Cause

The CDP test environment likely has `NODE_ENV=production` instead of `NODE_ENV=test` or `NODE_ENV=development`.

## How to Verify

### Option 1: Check Environment Variables in CDP

Look at your CDP test environment configuration and verify:

```bash
NODE_ENV=?  # Should be "test" or "development", NOT "production"
```

### Option 2: Add Temporary Diagnostic Endpoint

Add this to your app to see what NODE_ENV is set in test environment:

```javascript
// In src/server/router.js or similar
router.get('/debug/env', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === 'production',
    isPerfTest: process.env.NODE_ENV === 'perf-test',
    disableTestMocks: config.get('disableTestMocks'),
    DISABLE_TEST_MOCKS: process.env.DISABLE_TEST_MOCKS
  })
})
```

Then visit: `https://aqie-front-end.test.cdp-int.defra.cloud/debug/env`

## Solutions

### Solution 1: Change NODE_ENV in CDP Test Environment (Recommended)

Set in your CDP test environment configuration:

```bash
NODE_ENV=test
```

### Solution 2: Use Environment Variable Override

If you can't change NODE_ENV, set in CDP test environment:

```bash
DISABLE_TEST_MOCKS=false
```

### Solution 3: Change Logic to Allow Test Environment

If "test" environment must use NODE_ENV=production, modify the logic:

```javascript
// In src/config/index.js
const isProduction = process.env.NODE_ENV === 'production'
const isPerfTest = process.env.NODE_ENV === 'perf-test'
const isCDPTestEnv = process.env.CDP_ENVIRONMENT === 'test' // or similar flag

// Then in disableTestMocks:
default: (isProduction && !isCDPTestEnv) || isPerfTest
```

## Current Configuration Logic

```javascript
// Mocks ENABLED when:
NODE_ENV = 'development' (local)
NODE_ENV = 'test' (vitest tests)
NODE_ENV = undefined (default local)
NODE_ENV = any other value EXCEPT 'production' or 'perf-test'

// Mocks DISABLED when:
NODE_ENV = 'production'
NODE_ENV = 'perf-test'
```

## Testing Locally

All these should work locally:

```bash
# Default (no NODE_ENV set)
npm run dev
# Visit: http://localhost:3000/location/n87ge?mockLevel=9&mockDay=day3

# Explicit development
NODE_ENV=development npm run dev
# Visit: http://localhost:3000/location/n87ge?mockLevel=9&mockDay=day3

# Explicit test
NODE_ENV=test npm run dev
# Visit: http://localhost:3000/location/n87ge?mockLevel=9&mockDay=day3

# Production mode (mocks should NOT work)
NODE_ENV=production npm run dev
# Visit: http://localhost:3000/location/n87ge?mockLevel=9&mockDay=day3
# Mocks should be ignored ✓
```

## Next Steps

1. **Check CDP test environment NODE_ENV value**
2. **Set NODE_ENV=test in CDP test environment** OR **Set DISABLE_TEST_MOCKS=false**
3. **Redeploy to CDP test environment**
4. **Test mock URL again**: https://aqie-front-end.test.cdp-int.defra.cloud/location/n87ge?mockLevel=9&mockDay=day3
