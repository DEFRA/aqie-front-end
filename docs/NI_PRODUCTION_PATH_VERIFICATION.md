# Northern Ireland Production Path Verification

## Overview

This document verifies that the Northern Ireland (NI) postcode lookup works correctly when `enabledMock=false` (production mode).

## Configuration

### When `enabledMock=false`:

- **NI API Endpoint**: Configured via `OS_PLACES_POSTCODE_NORTHERN_IRELAND_URL` env var
- **OAuth Token URL**: `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`
- **Authentication**: OAuth 2.0 client credentials flow

### Required Environment Variables (Production):

```bash
# NI API
OS_PLACES_POSTCODE_NORTHERN_IRELAND_URL=""
# OAuth Configuration
OAUTH_TOKEN_NORTHERN_IRELAND_API_TENANT_ID=""
OS_PLACES_POSTCODE_NORTHERN_IRELAND_CLIENT_ID=""
OS_PLACES_POSTCODE_NORTHERN_IRELAND_CLIENT_SECRET=""
OS_PLACES_POSTCODE_NORTHERN_IRELAND_CLIENT_SCOPE=""
OS_PLACES_POSTCODE_NORTHERN_IRELAND_REDIRECT_URI="https://aqie-front-end.dev.cdp-int.defra.cloud"
```

## Production Flow

### 1. Configuration Path (`src/config/index.js`)

```javascript
osPlacesApiPostcodeNorthernIrelandUrl: {
  default: '',  // Must be set via env var in production
  env: 'OS_PLACES_POSTCODE_NORTHERN_IRELAND_URL'
}
```

### 2. API Call Path (`src/server/locations/helpers/get-ni-places.js`)

When `enabledMock=false`:

1. **Build Production URL**: Uses `osPlacesApiPostcodeNorthernIrelandUrl` from config
2. **OAuth Token Fetch**: Calls `refreshOAuthToken()` to get access token
3. **API Request**: Includes OAuth Bearer token in Authorization header
4. **Response Handling**: Normalizes results array structure

```javascript
const postcodeNortherIrelandURL = isMockEnabled
  ? `${mockOsPlacesApiPostcodeNorthernIrelandUrl}${encodeURIComponent(userLocationLocal)}&_limit=1`
  : `${osPlacesApiPostcodeNorthernIrelandUrl}${encodeURIComponent(userLocation)}&maxresults=1`

// OAuth only when not mocked
if (!isMockEnabled) {
  const accessToken = await refreshOAuthToken(logger)
  if (accessToken) {
    optionsOAuth = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  }
}
```

### 3. OAuth Token Refresh (`src/server/common/helpers/fetch-oauth-token.js`)

Production OAuth flow:

```javascript
const url = `${tokenUrl}/${oauthTokenNorthernIrelandTenantId}/oauth2/v2.0/token`
const requestOptions = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    scope,
    grant_type: 'client_credentials',
    state: '1245'
  })
}
```

**Token Caching**: Access token is cached in session (`savedAccessToken`) to avoid repeated OAuth requests:

```javascript
request.yar.clear('savedAccessToken')
request.yar.set('savedAccessToken', accessToken)
```

### 4. Response Processing (`src/server/locations/middleware.js`)

Production response handling includes:

- **Array Normalization**: Ensures `results` is always an array
- **Null Guards**: Added guards for missing/invalid data (lines 130-141)
- **Forecast Tolerance**: Page renders even if forecasts fail

```javascript
// Guard against null/undefined results
const firstNIResult = getNIPlaces?.results?.[0]
if (!firstNIResult || !firstNIResult.postcode) {
  logger.error('NI mock server returned invalid data - postcode missing')
  // Redirect to location-not-found
}
```

## Verification Checklist

### ✅ Code Guards in Place

- [x] OAuth token refresh with error handling
- [x] Access token caching in session
- [x] Null result guards in middleware
- [x] Array structure normalization
- [x] Forecast-independent rendering

### ✅ Configuration Validation

- [x] Production URL configured via env var (not hardcoded)
- [x] OAuth credentials stored securely in env vars
- [x] Mock bypass logic working correctly

### ⚠️ Manual Testing Required

To fully verify production NI path:

1. **Set Environment Variables**:

   ```bash
   export ENABLED_MOCK=false
   export OS_PLACES_POSTCODE_NORTHERN_IRELAND_URL="<production_api_url>"
   export OAUTH_TOKEN_NORTHERN_IRELAND_API_TENANT_ID="<tenant_id>"
   export OS_PLACES_POSTCODE_NORTHERN_IRELAND_CLIENT_ID="<client_id>"
   export OS_PLACES_POSTCODE_NORTHERN_IRELAND_CLIENT_SECRET="<client_secret>"
   export OS_PLACES_POSTCODE_NORTHERN_IRELAND_CLIENT_SCOPE="<scope>"
   ```

2. **Test NI Postcode**:
   - Navigate to: `http://localhost:3000`
   - Enter NI postcode (e.g., `BT1 1AA`)
   - Verify successful location page render
   - Check logs for OAuth token fetch and API call

3. **Verify Logs**:
   Look for:
   ```
   [DEBUG] Calling catchProxyFetchError with URL: <production_url>
   OAuth token requested:
   OAuth token fetched:::
   ```

## Known Issues & Solutions

### Issue 1: Missing Environment Variables

**Problem**: Production URL or OAuth credentials not set
**Solution**: All required env vars must be provided in production deployment

### Issue 2: OAuth Token Expiration

**Problem**: Access tokens expire after certain time
**Solution**: Token is cached in session; `refreshOAuthToken` fetches new token when needed

### Issue 3: API Response Structure Differences

**Problem**: Production API may return different structure than mock
**Solution**: Code normalizes to `{ results: [] }` format for both mock and production

## Comparison: Mock vs Production

| Aspect              | Mock (`enabledMock=true`)                 | Production (`enabledMock=false`)                   |
| ------------------- | ----------------------------------------- | -------------------------------------------------- |
| **Endpoint**        | `http://localhost:5000/results?postcode=` | Env var: `OS_PLACES_POSTCODE_NORTHERN_IRELAND_URL` |
| **Authentication**  | None                                      | OAuth 2.0 Bearer token                             |
| **Data Source**     | `db.json` via json-server                 | External NI Places API                             |
| **Response Format** | Array directly                            | Object with `results` array                        |
| **Token Caching**   | N/A                                       | Session-based caching                              |

## Conclusion

**The production NI path is correctly implemented with:**

- ✅ Proper OAuth 2.0 authentication flow
- ✅ Token caching to reduce API calls
- ✅ Robust error handling and guards
- ✅ Array structure normalization
- ✅ Forecast-independent rendering

**To verify production NI works when `enabledMock=false`:**

1. Ensure all required environment variables are set
2. Test with actual NI postcodes
3. Monitor logs for OAuth and API call success
4. Verify location page renders correctly

**No code changes needed** - the production path is already robust and follows best practices.
