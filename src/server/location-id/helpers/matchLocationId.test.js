import matchLocationId from './matchLocationId.js'

// Mock data for testing
const mockLocationData = { locationType: 'UK' }

// Test matchLocationId
it('should match location ID correctly', () => {
  const result = matchLocationId(
    'locationId',
    mockLocationData,
    {},
    'locationType',
    0
  )
  expect(result).toEqual({ locationDetails: undefined, locationIndex: 0 })
})
