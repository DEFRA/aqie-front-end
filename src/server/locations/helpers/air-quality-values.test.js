import { describe, it, expect, vi } from 'vitest'
import { calculateAirQuality, airQualityValues } from './air-quality-values.js'
import { LANG_CY, LANG_EN } from '../../data/constants.js'

// Mock the air quality modules
vi.mock('../../data/en/air-quality.js', () => ({
  getAirQuality: vi.fn(() => ({ value: 5, band: 'moderate' }))
}))

vi.mock('../../data/cy/air-quality.js', () => ({
  getAirQualityCy: vi.fn(() => ({ value: 5, band: 'cymedrol' }))
}))

describe('air-quality-values', () => {
  describe('airQualityValues', () => {
    it('should return English air quality when lang is EN', () => {
      // ''
      const mockForecastNum = [
        [
          { today: 5 },
          { tomorrow: 4 },
          { dayAfterTomorrow: 3 },
          { outlook: 'Good' },
          { extra: 'data' }
        ]
      ]

      const result = airQualityValues(mockForecastNum, LANG_EN)

      expect(result).toHaveProperty('airQuality')
      expect(result.airQuality).toEqual({ value: 5, band: 'moderate' })
    })

    it('should return Welsh air quality when lang is CY', () => {
      // ''
      const mockForecastNum = [
        [
          { today: 5 },
          { tomorrow: 4 },
          { dayAfterTomorrow: 3 },
          { outlook: 'Good' },
          { extra: 'data' }
        ]
      ]

      const result = airQualityValues(mockForecastNum, LANG_CY)

      expect(result).toHaveProperty('airQuality')
      expect(result.airQuality).toEqual({ value: 5, band: 'cymedrol' })
    })
  })

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
