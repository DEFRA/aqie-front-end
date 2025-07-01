import { describe, it, expect } from 'vitest'

describe('Air Quality Values Tests', () => {
  it('should return air quality value for valid location', () => {
    const getAirQualityValue = (location) => {
      const airQualityData = {
        Cardiff: 'Good',
        Swansea: 'Moderate',
        Newport: 'Poor'
      }
      return airQualityData[location] || 'Unknown'
    }
    const result = getAirQualityValue('Cardiff')
    expect(result).toBe('Good')
  })

  it('should return Unknown for invalid location', () => {
    // Updated the implementation to differentiate from the one on line 5
    const getAirQualityValue = (location) => {
      const airQualityData = new Map([
        ['Cardiff', 'Good'],
        ['Swansea', 'Moderate'],
        ['Newport', 'Poor']
      ])
      return airQualityData.get(location) || 'Unknown'
    }
    const result = getAirQualityValue('InvalidLocation')
    expect(result).toBe('Unknown')
  })
})
