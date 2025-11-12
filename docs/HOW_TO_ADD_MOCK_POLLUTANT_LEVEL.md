# Mock Pollutant Level Feature - Documentation

This feature allows you to mock pollutant band levels for testing and visualization purposes. Similar to the mock DAQI level feature, this enables you to see how different pollutant levels are displayed in the pollutants table with their corresponding colors.

## Overview

The mock pollutant level feature generates fake pollutant data with specific band levels (Low, Moderate, High, Very High) that display with the correct colors in the monitoring sites pollutants table. This is useful for:

- **Visual Testing**: Verify pollutant colors display correctly for each band
- **Accessibility Testing**: Test color contrast and readability across different bands
- **Demo Purposes**: Show stakeholders different pollution scenarios
- **Development**: Test without needing specific real-world data

## Pollutant Bands

The system supports four pollution bands, matching UK DAQI standards:

| Band        | Label     | CSS Class              | Typical Color |
| ----------- | --------- | ---------------------- | ------------- |
| `low`       | Low       | `.daqi-tag--low`       | Green         |
| `moderate`  | Moderate  | `.daqi-tag--moderate`  | Yellow        |
| `high`      | High      | `.daqi-tag--high`      | Orange        |
| `very-high` | Very High | `.daqi-tag--very-high` | Red           |

## Usage

### Method 1: Query Parameter (Recommended)

Add the `mockPollutantBand` query parameter to any location page URL:

```
http://localhost:3000/location/123456?mockPollutantBand=high
```

This will mock **all pollutants** with the "High" band level.

**Valid band values:**

- `low`
- `moderate`
- `high`
- `very-high` (or `very high`)

### Method 2: Programmatic Usage

Import and use the mock functions in your code:

```javascript
import {
  mockPollutantBand,
  mockPollutantLevel,
  applyMockPollutantsToSites
} from '../common/helpers/mock-pollutant-level.js'

// Mock all pollutants with the same band
const mockPollutants = mockPollutantBand('moderate', {
  logDetails: true
})

// Mock specific pollutants with individual bands
const customMock = mockPollutantLevel(
  {
    NO2: 'moderate',
    PM25: 'high',
    O3: 'low',
    SO2: 'very-high'
  },
  {
    fillMissing: true // Fill unspecified pollutants with 'low'
  }
)

// Apply to monitoring sites
const modifiedSites = applyMockPollutantsToSites(
  monitoringSites,
  mockPollutants,
  {
    applyToAllSites: true
  }
)
```

## Test Routes

The feature includes dedicated test routes for easy testing:

### 1. Uniform Band Test

Test all pollutants with the same band level:

```
http://localhost:3000/test-pollutants?band=moderate
```

**Options:**

- `band` - The pollution band (low, moderate, high, very-high)
- `format=json` - Get JSON output instead of HTML

### 2. Custom Pollutant Test

Test specific pollutants with individual bands:

```
http://localhost:3000/test-pollutants-custom?NO2=moderate&PM25=high&O3=low
```

**Query Parameters:**

- `NO2` - Nitrogen Dioxide level
- `PM25` - Fine Particulate Matter level
- `PM10` - Coarse Particulate Matter level
- `O3` - Ozone level
- `SO2` - Sulphur Dioxide level
- `format=json` - Get JSON output

### 3. All Bands Comparison

View all bands side by side:

```
http://localhost:3000/test-pollutants-all
```

## How It Works

### 1. Session Storage

When you visit a location with the `mockPollutantBand` parameter, it's stored in the session:

```javascript
// In controller.js
if (query?.mockPollutantBand !== undefined) {
  request.yar.set('mockPollutantBand', query.mockPollutantBand)
}
```

### 2. Data Generation

The helper generates mock pollutant data based on UK DAQI thresholds:

```javascript
const POLLUTANT_VALUE_RANGES = {
  NO2: { low: 100, moderate: 300, high: 500, 'very-high': 700 },
  PM25: { low: 20, moderate: 40, high: 60, 'very-high': 80 },
  PM10: { low: 30, moderate: 60, high: 80, 'very-high': 110 },
  O3: { low: 80, moderate: 120, high: 200, 'very-high': 250 },
  SO2: { low: 150, moderate: 400, high: 750, 'very-high': 1000 }
}
```

### 3. Application to Sites

Mock data is applied to all monitoring sites before rendering:

```javascript
function applyMockPollutants(request, monitoringSites) {
  const mockPollutantBand = request.yar.get('mockPollutantBand')

  if (mockPollutantBand) {
    const mockPollutants = mockPollutantBand(bandStr)
    return applyMockPollutantsToSites(monitoringSites, mockPollutants)
  }

  return monitoringSites
}
```

## Clearing Mock Data

To return to real data, simply visit a location without the mock parameter:

```
http://localhost:3000/location/123456
```

The mock data will be automatically cleared from the session.

## Examples

### Example 1: Test High Pollution Scenario

```
http://localhost:3000/location/123456?mockPollutantBand=very-high
```

All pollutants will show:

- Red "Very High" badges
- High pollutant values (e.g., NO2: 700 μg/m³)
- DAQI value of 10

### Example 2: Test Mixed Pollution

```
http://localhost:3000/test-pollutants-custom?NO2=high&PM25=moderate&PM10=low&O3=moderate&SO2=low
```

Shows realistic mixed pollution scenario with different pollutants at different levels.

### Example 3: Accessibility Testing

```bash
# Test each band for color contrast
http://localhost:3000/test-pollutants?band=low
http://localhost:3000/test-pollutants?band=moderate
http://localhost:3000/test-pollutants?band=high
http://localhost:3000/test-pollutants?band=very-high
```

## API Functions

### `mockPollutantBand(band, options)`

Generate mock data for all pollutants with the same band level.

**Parameters:**

- `band` (string): The pollution band ('low', 'moderate', 'high', 'very-high')
- `options` (object):
  - `logDetails` (boolean): Log generation details to console

**Returns:** Object with pollutant data

### `mockPollutantLevel(pollutantBands, options)`

Generate mock data for specific pollutants with individual bands.

**Parameters:**

- `pollutantBands` (object): Map of pollutant types to bands
- `options` (object):
  - `fillMissing` (boolean): Fill unspecified pollutants with 'low'
  - `logDetails` (boolean): Log generation details

**Returns:** Object with pollutant data

### `applyMockPollutantsToSites(monitoringSites, mockPollutants, options)`

Apply mock pollutant data to monitoring sites array.

**Parameters:**

- `monitoringSites` (array): Original monitoring sites
- `mockPollutants` (object): Mock pollutant data
- `options` (object):
  - `applyToAllSites` (boolean): Apply to all sites or just first
  - `logDetails` (boolean): Log application details

**Returns:** Modified monitoring sites array

### `getAvailableBands()`

Get list of available pollution bands with metadata.

**Returns:** Array of band objects with key, label, description, cssClass

### `validateBand(band)`

Validate and normalize a band string.

**Parameters:**

- `band` (string): Band to validate

**Returns:** Normalized band string or null if invalid

## Integration with Existing Features

### Combining with Mock DAQI Level

You can use both mock features together:

```
http://localhost:3000/location/123456?mockLevel=8&mockPollutantBand=high
```

This will:

- Mock the overall DAQI level to 8
- Mock all pollutants to show "High" bands

### Preserving Across Redirects

Mock pollutant bands are preserved in the session across:

- Welsh/English language switches
- Search term redirects
- Page refreshes

## Troubleshooting

### Mock not applying?

1. Check the browser console for log messages starting with `🎨`
2. Verify the band value is correct (use test routes first)
3. Clear session data and try again
4. Check that the location has monitoring sites

### Colors not showing?

1. Verify CSS classes are present in `_daqitag.scss`
2. Check that template uses `pollutantBandClass` not `pollutantDaqi`
3. Ensure the band label is converted correctly to CSS class

### Session not clearing?

Visit the location without any query parameters to clear mock data from session.

## Files Modified

- `src/server/common/helpers/mock-pollutant-level.js` - Core mock functionality
- `src/server/location-id/controller.js` - Integration and session management
- `src/server/test-routes/mock-pollutant-route.js` - Test routes
- `src/client/assets/stylesheets/sass/components/_daqitag.scss` - CSS for band colors

## Related Documentation

- [Mock DAQI Level Documentation](./HOW_TO_ADD_MOCK_DAQI_LEVEL.js)
- [Pollutant Threshold Configuration](../server/locations/helpers/pollutant-threshold-config.js)
- [UK DAQI Standards](https://uk-air.defra.gov.uk/air-pollution/daqi)

## Support

For questions or issues, please contact the development team or create an issue in the repository.
