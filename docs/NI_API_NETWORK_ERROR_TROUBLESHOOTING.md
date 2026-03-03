# NI API Network Error - Troubleshooting Guide

## Current Issue

The CDP platform logs show the NI API call is failing with a network error **before** reaching the coordinate conversion logic:

```
Failed to proxyFetch data from https://tst-api-gateway.azure.defra.cloud/api/******/v2.1/******=BT11AA&maxresults=1: fetch failed
```

### Error Flow

1. ✅ OAuth token fetched successfully
2. ✅ API URL constructed correctly with Authorization header
3. ❌ **Network error: "TypeError: fetch failed"**
4. ❌ `niPlacesData: undefined`
5. → Redirects to `/location-not-found`

**Result**: The coordinate conversion code is **never executed** because the API call fails.

---

## Root Cause Analysis

### Possible Causes

1. **Network Connectivity Issue**
   - The CDP test environment may not have network access to `tst-api-gateway.azure.defra.cloud`
   - Firewall rules blocking outbound connections
   - DNS resolution failure

2. **Certificate/TLS Issue**
   - SSL certificate verification failing
   - Proxy configuration missing

3. **API Gateway Configuration**
   - API Gateway not accessible from CDP platform
   - Missing service mesh configuration
   - Incorrect endpoint URL

4. **OAuth Token Issue**
   - Token is fetched but may not be valid for the API Gateway
   - Token audience mismatch

---

## What Was Fixed (Coordinate Conversion)

The coordinate conversion logic is **working correctly** and will execute when the API call succeeds:

### Changes Made

1. ✅ Added proj4 for Irish Grid (EPSG:29903) → WGS84 conversion
2. ✅ Handles both real API (easting/northing) and mock API (xCoordinate/yCoordinate)
3. ✅ Comprehensive tests (9 new tests, all passing)
4. ✅ Added debug logging to track coordinate conversion

### Code Location

- **File**: `src/server/locations/middleware.js` (lines 199-239)
- **Conversion**: Irish Grid (333500, 374000) → WGS84 (54.597, -5.934)

---

## New Debug Logging Added

To help diagnose when the API works, I've added logging to show:

### 1. Coordinate Field Detection (in `get-ni-places.js`)

```javascript
[DEBUG] Result 0 coordinates: easting=333500, northing=374000,
  xCoordinate=undefined, yCoordinate=undefined,
  latitude=undefined, longitude=undefined
```

### 2. Coordinate Conversion (in `middleware.js`)

```javascript
[DEBUG NI COORDS] Converting Irish Grid to WGS84: easting=333500, northing=374000
[DEBUG NI COORDS] Converted to WGS84: latitude=54.597, longitude=-5.934
```

---

## Next Steps

### Immediate Actions

1. **Fix Network Connectivity**
   - Check CDP platform network configuration
   - Verify API Gateway endpoint is accessible from test environment
   - Check firewall/security group rules

2. **Test with Mock API**
   - Enable mocks: `ENABLE_MOCKS=true`
   - This bypasses the network call and tests coordinate logic locally

3. **Verify API Gateway Configuration**
   - Confirm `tst-api-gateway.azure.defra.cloud` DNS resolution
   - Test endpoint accessibility from CDP platform
   - Check service mesh / ingress configuration

### Testing Commands

```bash
# Test from CDP platform container
curl -v https://tst-api-gateway.azure.defra.cloud/api/******/v2.1/******=BT11AA&maxresults=1 \
  -H "Authorization: Bearer <token>"

# Test DNS resolution
nslookup tst-api-gateway.azure.defra.cloud

# Test with mocks enabled
ENABLE_MOCKS=true npm start
```

---

## Expected Behavior (When API Works)

### Successful Flow

1. OAuth token fetched ✓
2. API call succeeds with 200 status ✓
3. Response contains `easting` and `northing` fields ✓
4. Coordinate conversion logs appear ✓
5. WGS84 coordinates stored in MongoDB ✓
6. Location page displays correctly ✓

### Expected Logs

```
[DEBUG] Result 0 coordinates: easting=333500, northing=374000, ...
[DEBUG NI COORDS] Converting Irish Grid to WGS84: easting=333500, northing=374000
[DEBUG NI COORDS] Converted to WGS84: latitude=54.597, longitude=-5.934
```

---

## Verification Checklist

- [ ] CDP platform can reach `tst-api-gateway.azure.defra.cloud`
- [ ] API Gateway accepts requests from CDP test environment
- [ ] OAuth token has correct audience and scope
- [ ] TLS/SSL certificates are valid
- [ ] When API succeeds, coordinate conversion logs appear
- [ ] MongoDB stores WGS84 coordinates (not Irish Grid)
- [ ] Location pages display correct coordinates on map

---

## Contact Points

**Network/Infrastructure Issue**: Platform team
**API Gateway Issue**: API Gateway team
**Coordinate Conversion**: Already fixed and tested ✅
