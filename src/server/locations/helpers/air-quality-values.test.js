''
// Unit tests for air-quality-values.js
const { calculateAirQuality } = require('./air-quality-values')

// Mock data
const mockData = {
  pollutant: 'NO2',
  value: 40
}

describe('calculateAirQuality', () => {
  it('should return correct air quality for valid pollutant', () => {
    const result = calculateAirQuality(mockData.pollutant, mockData.value)
    expect(result).toBe('Moderate')
  })

  it('should handle invalid pollutant gracefully', () => {
    const result = calculateAirQuality('INVALID', mockData.value)
    expect(result).toBe('Unknown')
  })

  it('should handle missing value gracefully', () => {
    const result = calculateAirQuality(mockData.pollutant, null)
    expect(result).toBe('Unknown')
  })
})
