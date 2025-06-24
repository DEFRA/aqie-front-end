import determineNearestLocation from './determineNearestLocation.js'

// Mock data for testing
const mockLocationData = {
  results: [
    {
      GAZETTEER_ENTRY: {
        LONGITUDE: -0.1278,
        LATITUDE: 51.5074,
        GEOMETRY_X: 123456,
        GEOMETRY_Y: 654321
      }
    }
  ]
}

const mockMeasurements = [
  {
    location: {
      coordinates: [51.5074, -0.1278]
    },
    pollutants: {
      NO2: { value: 50, time: { date: '2025-01-01T12:00:00Z' } }
    }
  }
]

// Test determineNearestLocation
it('should determine nearest location correctly', () => {
  const result = determineNearestLocation(
    mockLocationData,
    jest.fn(),
    mockMeasurements,
    'UK',
    0,
    'en'
  )

  // Update with actual expected behavior
  expect(result).toBeDefined()
})
