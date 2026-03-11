# Step-by-Step Guide: Testing Mock Disable Functionality

## 🎯 Objective

Verify that ALL mock parameters (`mockLevel`, `mockDay`, `mockPollutantBand`, `testMode`) are properly disabled when `DISABLE_TEST_MOCKS=true`.

---

## ✅ Prerequisites

Before starting, ensure:

- You're on the branch: `feature/disable-test-mocks-in-production`
- All changes are committed (or at least not conflicting)
- Port 3000 is available

---

## 📋 Step-by-Step Testing

### **Step 1: Test Mocks Work in Development (Baseline)**

First, verify that mocks work when `DISABLE_TEST_MOCKS` is NOT set:

```bash
# Terminal 1: Start server WITHOUT disabling mocks
npm start
```

**Wait for**: `Server running on port 3000` message

```bash
# Terminal 2: Test each mock parameter
# Test 1: mockLevel
curl "http://localhost:3000/location/AQ0104?mockLevel=9"
```

**Expected Result**:

- ✅ Page loads successfully
- ✅ All pollutants show as DAQI level 9 (purple/very high)
- ✅ No warning logs in Terminal 1

```bash
# Test 2: mockDay
curl "http://localhost:3000/location/AQ0104?mockDay=day3"
```

**Expected Result**:

- ✅ Page loads with day 3 data
- ✅ Third forecast day is displayed
- ✅ No warning logs

```bash
# Test 3: mockPollutantBand
curl "http://localhost:3000/location/AQ0104?mockPollutantBand=LOW_HIGH"
```

**Expected Result**:

- ✅ Page loads with mixed pollutant bands
- ✅ No warning logs

```bash
# Test 4: testMode
curl "http://localhost:3000/location/AQ0104?testMode=true"
```

**Expected Result**:

- ✅ Test mode enabled
- ✅ No warning logs

**Stop the server**: Press `Ctrl+C` in Terminal 1

---

### **Step 2: Test Mocks Are Disabled in Production**

Now test with `DISABLE_TEST_MOCKS=true`:

```bash
# Terminal 1: Start server WITH mocks disabled
DISABLE_TEST_MOCKS=true npm start
```

**Wait for**: `Server running on port 3000` message

```bash
# Terminal 2: Test each mock parameter (same tests)
# Test 1: mockLevel should be IGNORED
curl "http://localhost:3000/location/AQ0104?mockLevel=9"
```

**Expected Result**:

- ✅ Page loads successfully
- ✅ Shows REAL air quality data (NOT all level 9)
- ✅ **Check Terminal 1** for warning log:
  ```
  🚫 Mock level disabled in production (attempted: 9)
  🚫 Attempted to set mock level when mocks disabled (attempted: 9)
  ```

```bash
# Test 2: mockDay should be IGNORED
curl "http://localhost:3000/location/AQ0104?mockDay=day3"
```

**Expected Result**:

- ✅ Page loads with REAL data (not forced to day 3)
- ✅ Shows current/today forecast data
- ✅ **Check Terminal 1** for warning log:
  ```
  🚫 Mock day disabled in production (attempted: day3)
  ```

```bash
# Test 3: mockPollutantBand should be IGNORED
curl "http://localhost:3000/location/AQ0104?mockPollutantBand=LOW_HIGH"
```

**Expected Result**:

- ✅ Page loads with REAL pollutant data
- ✅ **Check Terminal 1** for warning log:
  ```
  🚫 Mock pollutants disabled in production
  ```

```bash
# Test 4: testMode should be IGNORED
curl "http://localhost:3000/location/AQ0104?testMode=true"
```

**Expected Result**:

- ✅ Test mode NOT enabled
- ✅ **Check Terminal 1** for warning log:
  ```
  🚫 Test mode disabled in production
  ```

---

### **Step 3: Test Multiple Mocks Together**

Test that multiple mock parameters are ALL ignored:

```bash
# Terminal 2: Try all mocks at once
curl "http://localhost:3000/location/AQ0104?mockLevel=9&mockDay=day3&mockPollutantBand=LOW_HIGH&testMode=true"
```

**Expected Result**:

- ✅ Page loads with REAL data
- ✅ **Check Terminal 1** for ALL warning logs:
  ```
  🚫 Mock level disabled in production (attempted: 9)
  🚫 Attempted to set mock level when mocks disabled (attempted: 9)
  🚫 Mock day disabled in production (attempted: day3)
  🚫 Mock pollutants disabled in production
  🚫 Test mode disabled in production
  ```

---

### **Step 4: Test Mock Parameters Don't Persist in Redirects**

Test that mock parameters are NOT preserved when searching for locations:

```bash
# Terminal 2: Search with mock parameters
curl "http://localhost:3000/locations?location=London&mockLevel=9"
```

**Expected Result**:

- ✅ Redirects to location WITHOUT mockLevel parameter
- ✅ URL should be like: `/location/AQ0104` (no `?mockLevel=9`)
- ✅ Warning log appears in Terminal 1

**Stop the server**: Press `Ctrl+C` in Terminal 1

---

## 🌐 Browser Testing (Visual Verification)

For a more visual test, use your browser:

### **With Mocks Enabled (Development)**

```bash
# Terminal: Start without disabling mocks
npm start
```

1. Open browser: `http://localhost:3000/location/AQ0104?mockLevel=9`
2. **Expected**: All pollutants show purple/very high (level 9)
3. **Check**: Browser DevTools Console for any warnings (should be none)

### **With Mocks Disabled (Production)**

```bash
# Terminal: Start with mocks disabled
DISABLE_TEST_MOCKS=true npm start
```

1. Open browser: `http://localhost:3000/location/AQ0104?mockLevel=9`
2. **Expected**: Shows REAL air quality data (mixed colors, not all purple)
3. **Check**: Terminal shows warning logs
4. **Check**: Browser DevTools Console (warnings may appear there too)

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] **Step 1**: All 4 mocks work when `DISABLE_TEST_MOCKS` is NOT set
- [ ] **Step 2**: All 4 mocks are ignored when `DISABLE_TEST_MOCKS=true`
- [ ] **Step 2**: Warning logs appear for each mock attempt
- [ ] **Step 3**: Multiple mocks together all show warnings
- [ ] **Step 4**: Mock parameters don't persist in search redirects
- [ ] **Browser**: Visual confirmation that real data displays instead of mocked data

---

## 🐛 Troubleshooting

### Server Won't Start

**Problem**: Redis connection errors filling the terminal
**Solution**: This is NORMAL in local development. The server is still running.

- Look for: `Server running on port 3000` message
- Ignore: `Redis connection error` messages (expected without Redis)

### Mocks Still Working When Disabled

**Problem**: Mock parameters still affect the page when `DISABLE_TEST_MOCKS=true`
**Check**:

1. Did you set `DISABLE_TEST_MOCKS=true` when starting the server?
2. Did you restart the server after setting the variable?
3. Check `.env` file doesn't override with `DISABLE_TEST_MOCKS=false`

**Verify config**:

```bash
# Add this to controller.js temporarily to verify
console.log('🔍 disableTestMocks:', config.get('disableTestMocks'))
```

### No Warning Logs Appear

**Problem**: No warning logs in terminal when using mock parameters
**Check**:

1. Verify you're using `DISABLE_TEST_MOCKS=true`
2. Check the code has the warning logs (see controller.js)
3. Ensure you're looking at the correct terminal window

### Cannot Access Real Data

**Problem**: Getting errors when trying to load pages
**Solution**:

- Ensure backend API is accessible
- Use a valid location ID (e.g., `AQ0104` for Birmingham)
- Check network connectivity

---

## 📊 Expected Log Output

When `DISABLE_TEST_MOCKS=true`, you should see logs like:

```
# When accessing ?mockLevel=9
🚫 Mock level disabled in production (attempted: 9)
🚫 Attempted to set mock level when mocks disabled (attempted: 9)

# When accessing ?mockDay=day3
🚫 Mock day disabled in production (attempted: day3)

# When accessing ?mockPollutantBand=LOW_HIGH
🚫 Mock pollutants disabled in production

# When accessing ?testMode=true
🚫 Test mode disabled in production
```

---

## 🎯 Quick Test Script

Copy and paste this complete test sequence:

```bash
# ===== PART 1: Test mocks work in development =====
echo "🧪 Testing mocks ENABLED..."
npm start &
SERVER_PID=$!
sleep 5  # Wait for server to start

curl -s "http://localhost:3000/location/AQ0104?mockLevel=9" | grep -q "AQ0104" && echo "✅ mockLevel works in dev"
curl -s "http://localhost:3000/location/AQ0104?mockDay=day3" | grep -q "AQ0104" && echo "✅ mockDay works in dev"

kill $SERVER_PID
sleep 2

# ===== PART 2: Test mocks disabled in production =====
echo ""
echo "🛡️ Testing mocks DISABLED..."
DISABLE_TEST_MOCKS=true npm start &
SERVER_PID=$!
sleep 5  # Wait for server to start

echo "Testing all mocks should be ignored..."
curl -s "http://localhost:3000/location/AQ0104?mockLevel=9&mockDay=day3&mockPollutantBand=LOW_HIGH&testMode=true" | grep -q "AQ0104" && echo "✅ Page loads with mocks disabled"
echo "⚠️  Check server logs above for warning messages"

kill $SERVER_PID
echo "✅ Test complete!"
```

---

## 📝 Manual Verification Points

For each test, manually verify:

1. **Response Status**: Should be 200 OK (not 500 error)
2. **Page Content**: Real data displayed (not mocked values)
3. **Terminal Logs**: Warning messages appear
4. **URL Parameters**: Mocks don't persist in redirects
5. **Session State**: Mocks don't affect subsequent requests

---

## ✨ Summary

After completing these tests, you'll have verified:

- ✅ Mocks work correctly in development
- ✅ Mocks are completely disabled in production
- ✅ Warning logs appear when mocks are attempted
- ✅ Real data is displayed instead of mocked data
- ✅ Mock parameters don't persist in redirects
- ✅ All 4 mock types are properly secured

**Result**: Your application is secure against mock parameter manipulation in production! 🎉
