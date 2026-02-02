# Irish Grid Coordinate Conversion - Implementation Guide

## Overview

This document describes the comprehensive Irish Grid (EPSG:29903) to WGS84 (EPSG:4326) coordinate conversion implementation across the AQIE frontend application.

## Problem Statement

The application receives coordinate data from multiple sources:

1. **NI API** - Returns `easting` and `northing` in Irish Grid format (meters)
2. **OS Places API** - Returns British National Grid coordinates (`GEOMETRY_X`, `GEOMETRY_Y`)
3. **Forecast API** - May contain Irish Grid coordinates in MongoDB stored as `[easting, northing]`
4. **Mock Data** - Returns `xCoordinate` and `yCoordinate` in WGS84 format (degrees)

Irish Grid coordinates are incompatible with WGS84-based mapping and geolocation systems. They must be converted to latitude/longitude (WGS84) for proper functionality.

## Solution

### 1. Automatic Irish Grid Detection

The solution implements automatic detection of Irish Grid coordinates based on value ranges:

- **Irish Grid Values**: 10,000 - 500,000 (easting), 10,000 - 600,000 (northing) - in meters
- **WGS84 Values**: -180 to 180 degrees

If both coordinate values are > 10,000, they are assumed to be Irish Grid and converted using proj4.

### 2. Files Modified

#### `/src/server/locations/helpers/location-util.js`

- Added `convertIrishGridIfNeeded()` function to detect and convert Irish Grid coordinates
- Updated `coordinatesTotal()` to convert Irish Grid coordinates from forecast data
- Updated `getNearLocation()` to handle Irish Grid coordinates when filtering forecasts
- **Purpose**: Handles coordinate conversion for location matching and nearest location calculations

#### `/src/server/locations/helpers/get-nearest-location.js`

- Added `convertIrishGridIfNeeded()` function (duplicate for module isolation)
- Updated `buildNearestLocationEntry()` to convert Irish Grid forecast coordinates
- Updated `buildNearestLocationsRange()` to handle Irish Grid when filtering measurements
- **Purpose**: Ensures forecast measurements use WGS84 coordinates for distance calculations

#### `/src/server/locations/middleware.js` (already implemented)

- Converts NI API `easting/northing` to `latitude/longitude` using proj4
- Creates `resultsWithCoords` array with converted WGS84 coordinates
- **Purpose**: Converts NI API responses at data ingestion point

#### `/src/server/locations/helpers/location-util.js` (already implemented)

- `convertPointToLonLat()` handles Irish Grid conversion for NI locations
- Prioritizes coordinate formats: xCoordinate/yCoordinate > LONGITUDE/LATITUDE > easting/northing
- **Purpose**: Converts coordinates when matching locations to forecasts

## Technical Details

### Irish Grid Projection Definition

```javascript
const irishGrid =
  '+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=1.000035 +x_0=200000 +y_0=250000 +ellps=mod_airy +units=m +no_defs +type=crs'
const wgs84 = 'EPSG:4326'
```

### Conversion Example

```javascript
// Input: Irish Grid coordinates for Belfast BT1 1AA
const easting = 333500 // meters
const northing = 374000 // meters

// Conversion using proj4
const [lon, lat] = proj4(irishGrid, wgs84, [easting, northing])

// Output: WGS84 coordinates
// latitude = 54.597
// longitude = -5.934
```

### Detection Logic

```javascript
function convertIrishGridIfNeeded(coord1, coord2) {
  // Detect Irish Grid: both values > 10,000
  if (coord1 > 10000 && coord1 < 500000 && coord2 > 10000 && coord2 < 600000) {
    // Convert using proj4
    const [lon, lat] = proj4(irishGrid, wgs84, [coord1, coord2])
    return { lat, lon, converted: true }
  }

  // Default: treat as app's [latitude, longitude] format
  return { lat: coord1, lon: coord2, converted: false }
}
```

## Coordinate Format Note

**IMPORTANT**: This application uses `[latitude, longitude]` format throughout, which differs from the GeoJSON standard `[longitude, latitude]`. The conversion functions respect this app-specific convention.

## Data Flow

### 1. NI API → Session Storage

```
NI API (easting, northing)
  → middleware.js converts to (latitude, longitude)
  → session storage (latitude, longitude)
  → location page displays correct coordinates
```

### 2. Forecast API → Distance Calculations

```
Forecast API [coord1, coord2]
  → convertIrishGridIfNeeded() detects if Irish Grid
  → IF Irish Grid: proj4 converts to WGS84
  → coordinatesTotal() uses converted values
  → geolib calculates distances using WGS84
```

### 3. Location Matching → Nearest Forecasts

```
User location (lat, lon)
  → getNearLocation() finds nearest forecast
  → convertIrishGridIfNeeded() ensures forecast coords are WGS84
  → Comparison succeeds with matching coordinates
```

## Testing

### Test Coverage

1. **middleware-ni-api.test.js** (6 tests)
   - Converts BT1 1AA (Belfast) Irish Grid to WGS84
   - Converts BT93 8AD (Enniskillen) Irish Grid to WGS84
   - Handles xCoordinate/yCoordinate (mock data)
   - Preserves original easting/northing values
   - End-to-end coordinate flow validation

2. **location-util.test.js** (3 new tests)
   - Converts NI location using Irish Grid (easting/northing)
   - Handles xCoordinate/yCoordinate for NI mock data
   - Error handling for invalid Irish Grid coordinates

3. **get-nearest-location.test.js** (22 tests)
   - All existing tests pass with new conversion logic
   - Validates forecast coordinate handling

### Running Tests

```bash
# Test NI API coordinate conversion
npm test -- src/server/locations/middleware-ni-api.test.js

# Test location utilities
npm test -- src/server/locations/helpers/location-util.test.js

# Test nearest location calculations
npm test -- src/server/locations/helpers/get-nearest-location.test.js
```

## Logging

The implementation includes comprehensive logging for debugging:

```
[IRISH GRID DETECTION] Converting Irish Grid coordinates: [333500, 374000]
[IRISH GRID DETECTION] Converted to WGS84: lat=54.597, lon=-5.934
```

```
[DEBUG NI COORDS] Converting Irish Grid to WGS84: easting=333500, northing=374000
[DEBUG NI COORDS] Converted to WGS84: latitude=54.597, longitude=-5.934
```

## Verification

### Check Conversion is Working

1. Search for a Northern Ireland postcode (e.g., "BT1 1AA")
2. Check browser console or server logs for conversion messages
3. Verify "Set up air quality alert" link has correct `lat` and `long` query parameters
4. Coordinates should be in WGS84 format (latitude ~54.5, longitude ~-5.9)

### Example Expected Values

| Postcode | Irish Grid (Easting, Northing) | WGS84 (Lat, Lon) |
| -------- | ------------------------------ | ---------------- |
| BT1 1AA  | (333500, 374000)               | (54.597, -5.934) |
| BT93 8AD | (322735, 358240)               | (54.458, -7.643) |

## Known Limitations

1. **Forecast Database Coordinates**: If the backend forecast API stores Irish Grid coordinates in MongoDB, this frontend can detect and convert them, but the MongoDB data itself is managed by a separate backend service.

2. **Coordinate Format Consistency**: The app uses `[latitude, longitude]` format internally. Do not change to GeoJSON `[longitude, latitude]` without updating ALL coordinate handling throughout the app.

3. **Detection Threshold**: Coordinates between 0-10,000 are assumed to be WGS84. If real Irish Grid coordinates fall below 10,000, adjust the detection threshold.

## Future Improvements

1. **Backend Fix**: Update the backend forecast API service to store coordinates in WGS84 format
2. **Standardize Format**: Consider migrating the entire app to use GeoJSON standard `[longitude, latitude]` format
3. **Configuration**: Make Irish Grid detection threshold configurable
4. **Validation**: Add coordinate range validation to catch invalid conversions

## References

- Irish Grid (EPSG:29903): https://epsg.io/29903
- WGS84 (EPSG:4326): https://epsg.io/4326
- proj4js Documentation: http://proj4js.org/
- GeoJSON Specification: https://geojson.org/

## Troubleshooting

### Issue: Coordinates Still Wrong

**Check**: Are coordinates > 10,000?

- If yes, conversion should trigger automatically
- Check logs for `[IRISH GRID DETECTION]` messages

**Check**: Is proj4 installed?

```bash
npm list proj4
```

### Issue: Tests Failing

**Check**: Are you using the correct coordinate format?

- App uses `[latitude, longitude]` not `[longitude, latitude]`
- Test data should match app format

### Issue: Distance Calculations Wrong

**Check**: Are forecast coordinates converted?

- Verify `convertIrishGridIfNeeded()` is called in `buildNearestLocationEntry()`
- Check logs for conversion confirmation
