# Testing Production Mock Behavior

## Overview

This guide explains how to test the production behavior where all test mock parameters (`mockLevel`, `mockDay`, `mockPollutantBand`, `testMode`) are disabled, **without** actually running in production mode.

## Configuration

The application uses a config option `disableTestMocks` which:

- **Defaults to `true` in production** (`NODE_ENV=production`)
- **Defaults to `false` in development and test** environments
- Can be overridden using the `DISABLE_TEST_MOCKS` environment variable

## How to Test Production Behavior in Development

### Option 1: Using Environment Variable

Set `DISABLE_TEST_MOCKS=true` when starting the server:

```bash
DISABLE_TEST_MOCKS=true npm start
```

Or in your `.env` file:

```env
DISABLE_TEST_MOCKS=true
```

### Option 2: Using Cross-Env (Cross-Platform)

If you have `cross-env` installed:

```bash
npx cross-env DISABLE_TEST_MOCKS=true npm start
```

## Testing Scenarios

### Scenario 1: Verify Mocks Are Disabled

1. Start the server with mocks disabled:

   ```bash
   DISABLE_TEST_MOCKS=true npm start
   ```

2. Try to access a location with mock parameters:

   ```
   http://localhost:3000/location/AQ0104?mockLevel=9&mockDay=day3
   ```

3. **Expected Behavior:**
   - You should see warning logs: `🚫 Attempted to set mock level when mocks disabled`
   - The mock parameters will be ignored
   - Real air quality data will be displayed
   - No mock colors or warning text for mocked levels

### Scenario 2: Verify Mocks Work Normally

1. Start the server normally (without `DISABLE_TEST_MOCKS`):

   ```bash
   npm start
   ```

2. Access the same URL:

   ```
   http://localhost:3000/location/AQ0104?mockLevel=9&mockDay=day3
   ```

3. **Expected Behavior:**
   - Mock parameters will be accepted
   - You should see logs: `🎨 Mock level 9 stored in session`
   - Mock DAQI level 9 will be applied to day3
   - Warning text will appear for high pollution

### Scenario 3: Test All Mock Parameters

Test each parameter is properly disabled:

```bash
# Set environment variable
DISABLE_TEST_MOCKS=true npm start

# Try mockLevel
http://localhost:3000/location/AQ0104?mockLevel=10

# Try mockDay
http://localhost:3000/location/AQ0104?mockLevel=9&mockDay=day2

# Try mockPollutantBand
http://localhost:3000/location/AQ0104?mockPollutantBand=high

# Try testMode
http://localhost:3000/location/AQ0104?testMode=noDate
```

**Expected:** All should log warnings and be ignored.

## Checking Logs

When `DISABLE_TEST_MOCKS=true`, look for these log messages:

```
🚫 Mock DAQI levels disabled (disableTestMocks=true)
🚫 Mock pollutant bands disabled (disableTestMocks=true)
🚫 Attempted to set mock level when mocks disabled (disableTestMocks=true) - ignoring parameter
🚫 Attempted to set mock day when mocks disabled (disableTestMocks=true) - ignoring parameter
🚫 Attempted to set mock pollutant band when mocks disabled (disableTestMocks=true) - ignoring parameter
🚫 Attempted to set test mode when mocks disabled (disableTestMocks=true) - ignoring parameter
```

## Configuration in Different Environments

### Development (.env.development)

```env
# Mocks enabled by default (can test with mock parameters)
DISABLE_TEST_MOCKS=false
```

### Testing (.env.test)

```env
# Mocks enabled for testing
DISABLE_TEST_MOCKS=false
```

### Production (.env.production)

```env
# Mocks automatically disabled in production
# No need to set this, it defaults to true when NODE_ENV=production
```

### Local Production Simulation

```env
# To simulate production behavior locally
NODE_ENV=development
DISABLE_TEST_MOCKS=true
```

## What Gets Disabled

When `DISABLE_TEST_MOCKS=true`:

1. **URL Parameters Ignored:**
   - `?mockLevel=X` - Won't apply mock DAQI levels
   - `?mockDay=dayX` - Won't target specific forecast days
   - `?mockPollutantBand=X` - Won't apply mock pollutant bands
   - `?testMode=X` - Won't enable test mode features

2. **Session Storage Blocked:**
   - Mock parameters won't be stored in user sessions
   - Existing session values won't be used

3. **Redirects Cleaned:**
   - Mock parameters won't be preserved across redirects
   - URLs will be clean without test parameters

4. **Functions Return Original Data:**
   - `applyMockLevel()` returns unchanged air quality data
   - `applyMockPollutants()` returns unchanged monitoring site data

## Troubleshooting

### Mocks Still Working When They Shouldn't

1. Check your `.env` file - remove or set `DISABLE_TEST_MOCKS=false`
2. Restart the server completely
3. Clear your browser cookies/session
4. Check server logs for the config value:
   ```bash
   # Add this temporarily to verify config
   console.log('disableTestMocks:', config.get('disableTestMocks'))
   ```

### Mocks Not Working When They Should

1. Ensure `DISABLE_TEST_MOCKS` is NOT set to `true`
2. Ensure `NODE_ENV` is not set to `production`
3. Restart the server
4. Check logs for mock storage messages: `🎨 Mock level X stored in session`

## Automated Testing

You can add automated tests to verify this behavior:

```javascript
describe('Mock Parameters Disabled in Production', () => {
  beforeEach(() => {
    // Set config to disable mocks
    process.env.DISABLE_TEST_MOCKS = 'true'
  })

  it('should ignore mockLevel parameter when mocks disabled', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/location/AQ0104?mockLevel=9'
    })
    // Assert real data is returned, not mock level 9
  })

  afterEach(() => {
    delete process.env.DISABLE_TEST_MOCKS
  })
})
```

## Summary

- ✅ Use `DISABLE_TEST_MOCKS=true` to simulate production behavior in development
- ✅ Test that mock parameters are ignored and logged as warnings
- ✅ Verify real data is displayed instead of mock data
- ✅ Confirm URL parameters don't affect the application
- ✅ Production automatically disables mocks without any configuration needed
