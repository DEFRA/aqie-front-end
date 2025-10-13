import { describe, it, expect } from 'vitest'
import {
  getPollutantLevel,
  POLLUTANT_THRESHOLDS_CONFIG
} from './pollutant-threshold-config.js'

// Add a comment: ''

describe('Unified Pollutant Threshold Configuration', () => {
  describe('POLLUTANT_THRESHOLDS_CONFIG', () => {
    it('should be defined and structured correctly', () => {
      expect(POLLUTANT_THRESHOLDS_CONFIG).toBeDefined()
      expect(typeof POLLUTANT_THRESHOLDS_CONFIG).toBe('object')
    })

    it('should have all required pollutant types', () => {
      const requiredTypes = ['PM10', 'GE10', 'NO2', 'PM25', 'SO2', 'O3']
      requiredTypes.forEach((type) => {
        expect(POLLUTANT_THRESHOLDS_CONFIG[type]).toBeDefined()
        expect(Array.isArray(POLLUTANT_THRESHOLDS_CONFIG[type])).toBe(true)
      })
    })

    it('should have consistent threshold structure', () => {
      const pm10Thresholds = POLLUTANT_THRESHOLDS_CONFIG.PM10
      pm10Thresholds.forEach((threshold) => {
        expect(threshold).toHaveProperty('max')
        expect(threshold).toHaveProperty('daqi')
        expect(threshold).toHaveProperty('bandKey')
      })
    })
  })

  describe('getPollutantLevel', () => {
    it('should return correct English band labels', () => {
      const result = getPollutantLevel(25, 'PM10', 'en')
      expect(result.getBand).toBe('Low')
      expect(result.getDaqi).toBe(1)
    })

    it('should return correct Welsh band labels', () => {
      const result = getPollutantLevel(25, 'PM10', 'cy')
      expect(result.getBand).toBe('Isel')
      expect(result.getDaqi).toBe(1)
    })

    it('should handle invalid pollutant type', () => {
      const result = getPollutantLevel(25, 'INVALID', 'en')
      expect(result.getDaqi).toBe(0)
      expect(result.getBand).toBe('')
    })

    it('should default to English when no language specified', () => {
      const result = getPollutantLevel(25, 'PM10')
      expect(result.getBand).toBe('Low')
    })

    it('should handle different threshold levels', () => {
      const lowResult = getPollutantLevel(25, 'PM10', 'en')
      const moderateResult = getPollutantLevel(60, 'PM10', 'en')
      const highResult = getPollutantLevel(90, 'PM10', 'en')
      const veryHighResult = getPollutantLevel(150, 'PM10', 'en')

      expect(lowResult.getBand).toBe('Low')
      expect(moderateResult.getBand).toBe('Moderate')
      expect(highResult.getBand).toBe('High')
      expect(veryHighResult.getBand).toBe('Very high')
    })
  })
})
