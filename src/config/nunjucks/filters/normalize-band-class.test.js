// '' - Tests for normalizeBandClass filter
import { describe, it, expect } from 'vitest'
import { normalizeBandClass } from './normalize-band-class.js'

describe('normalizeBandClass', () => {
  describe('English band names', () => {
    it('should normalize "Low" to "low"', () => {
      expect(normalizeBandClass('Low')).toBe('low')
    })

    it('should normalize "Moderate" to "moderate"', () => {
      expect(normalizeBandClass('Moderate')).toBe('moderate')
    })

    it('should normalize "High" to "high"', () => {
      expect(normalizeBandClass('High')).toBe('high')
    })

    it('should normalize "Very High" to "very-high"', () => {
      expect(normalizeBandClass('Very High')).toBe('very-high')
    })

    it('should normalize "Very high" to "very-high"', () => {
      expect(normalizeBandClass('Very high')).toBe('very-high')
    })
  })

  describe('Welsh band names', () => {
    it('should normalize "Isel" to "low"', () => {
      expect(normalizeBandClass('Isel')).toBe('low')
    })

    it('should normalize "isel" to "low"', () => {
      expect(normalizeBandClass('isel')).toBe('low')
    })

    it('should normalize "Cymedrol" to "moderate"', () => {
      expect(normalizeBandClass('Cymedrol')).toBe('moderate')
    })

    it('should normalize "cymedrol" to "moderate"', () => {
      expect(normalizeBandClass('cymedrol')).toBe('moderate')
    })

    it('should normalize "Uchel" to "high"', () => {
      expect(normalizeBandClass('Uchel')).toBe('high')
    })

    it('should normalize "uchel" to "high"', () => {
      expect(normalizeBandClass('uchel')).toBe('high')
    })

    it('should normalize "Uchel iawn" to "very-high"', () => {
      expect(normalizeBandClass('Uchel iawn')).toBe('very-high')
    })

    it('should normalize "uchel iawn" to "very-high"', () => {
      expect(normalizeBandClass('uchel iawn')).toBe('very-high')
    })

    it('should normalize "Uchel Iawn" to "very-high"', () => {
      expect(normalizeBandClass('Uchel Iawn')).toBe('very-high')
    })
  })

  describe('Edge cases', () => {
    it('should return empty string for null', () => {
      expect(normalizeBandClass(null)).toBe('')
    })

    it('should return empty string for undefined', () => {
      expect(normalizeBandClass(undefined)).toBe('')
    })

    it('should return empty string for empty string', () => {
      expect(normalizeBandClass('')).toBe('')
    })

    it('should handle unknown band names by converting to lowercase with hyphens', () => {
      expect(normalizeBandClass('Unknown Band')).toBe('unknown-band')
    })

    it('should handle uppercase English band names', () => {
      expect(normalizeBandClass('LOW')).toBe('low')
      expect(normalizeBandClass('MODERATE')).toBe('moderate')
      expect(normalizeBandClass('HIGH')).toBe('high')
    })

    it('should handle mixed case band names with multiple spaces', () => {
      expect(normalizeBandClass('Very  High')).toBe('very--high')
    })
  })
})
