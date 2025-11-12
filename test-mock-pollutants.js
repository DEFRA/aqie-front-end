/**
 * Quick manual test for mock pollutant level feature
 *
 * This file demonstrates how to test the mock pollutant functionality
 */

import {
  mockPollutantBand,
  mockPollutantLevel,
  applyMockPollutantsToSites,
  getAvailableBands,
  validateBand
} from './src/server/common/helpers/mock-pollutant-level.js'

console.log('🧪 Testing Mock Pollutant Level Feature\n')

// Test 1: Get available bands
console.log('1️⃣ Available Bands:')
const bands = getAvailableBands()
console.log(JSON.stringify(bands, null, 2))
console.log()

// Test 2: Mock all pollutants with 'high' band
console.log('2️⃣ Mock all pollutants with HIGH band:')
const highBandPollutants = mockPollutantBand('high', { logDetails: false })
console.log(JSON.stringify(highBandPollutants, null, 2))
console.log()

// Test 3: Mock specific pollutants
console.log('3️⃣ Mock specific pollutants:')
const customPollutants = mockPollutantLevel({
  NO2: 'moderate',
  PM25: 'high',
  O3: 'low',
  SO2: 'very-high'
})
console.log(JSON.stringify(customPollutants, null, 2))
console.log()

// Test 4: Validate bands
console.log('4️⃣ Band validation:')
console.log('  "high" is valid:', validateBand('high'))
console.log('  "Very High" is valid:', validateBand('Very High'))
console.log('  "invalid" is valid:', validateBand('invalid'))
console.log()

// Test 5: Apply to monitoring sites
console.log('5️⃣ Apply mock pollutants to monitoring sites:')
const mockSites = [
  {
    name: 'Test Site 1',
    distance: '1.2',
    pollutants: {
      NO2: { value: 50, band: 'Low', daqi: 1 },
      PM25: { value: 15, band: 'Low', daqi: 1 }
    }
  },
  {
    name: 'Test Site 2',
    distance: '2.5',
    pollutants: {
      NO2: { value: 60, band: 'Low', daqi: 1 },
      O3: { value: 90, band: 'Moderate', daqi: 4 }
    }
  }
]

const moderatePollutants = mockPollutantBand('moderate')
const modifiedSites = applyMockPollutantsToSites(
  mockSites,
  moderatePollutants,
  {
    applyToAllSites: true,
    logDetails: false
  }
)

console.log(
  'Original site 1 pollutants:',
  JSON.stringify(mockSites[0].pollutants, null, 2)
)
console.log(
  '\nModified site 1 pollutants:',
  JSON.stringify(modifiedSites[0].pollutants, null, 2)
)
console.log()

console.log('✅ All tests completed successfully!')
console.log('\n📝 Usage Examples:')
console.log(
  '  - Test in browser: http://localhost:3000/location/123456?mockPollutantBand=high'
)
console.log(
  '  - Test route: http://localhost:3000/test-pollutants?band=moderate'
)
console.log(
  '  - Custom route: http://localhost:3000/test-pollutants-custom?NO2=high&PM25=moderate'
)
