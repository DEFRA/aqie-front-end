import { describe, it, expect } from 'vitest'
import { calculateAirQuality } from './air-quality-values.js'

describe('air-quality-values', () => {
  describe('calculateAirQuality', () => {
    it('should return Moderate for NO2 pollutant above threshold', () => {
      const result = calculateAirQuality('NO2', 50)
      expect(result).toBe('Moderate')
    })

    it('should return Good for NO2 pollutant below threshold', () => {
      const result = calculateAirQuality('NO2', 30)
      expect(result).toBe('Good')
    })

    it('should return Unknown for invalid pollutant', () => {
      const result = calculateAirQuality('INVALID', 25)
      expect(result).toBe('Unknown')
    })

    it('should return Unknown for null value', () => {
      const result = calculateAirQuality('NO2', null)
      expect(result).toBe('Unknown')
    })

    it('should return Good for other pollutants', () => {
      const result = calculateAirQuality('O3', 35)
      expect(result).toBe('Good')
    })

    it('should handle edge case at moderate threshold', () => {
      const result = calculateAirQuality('NO2', 40)
      expect(result).toBe('Moderate')
    })

    it('should handle NO2 just below threshold', () => {
      const result = calculateAirQuality('NO2', 39)
      expect(result).toBe('Good')
    })

    it('should handle empty string pollutant', () => {
      const result = calculateAirQuality('', 50)
      expect(result).toBe('Good')
    })
  })
})
