import { describe, it, expect } from 'vitest'
import {
  buildNIPostcodeUrl,
  buildUKApiUrl,
  buildUKLocationFilters
} from './util-helpers.js'

describe('util-helpers - URL Builder Functions', () => {
  describe('buildNIPostcodeUrl', () => {
    it('should return empty string for null postcode', () => {
      const result = buildNIPostcodeUrl(null)
      expect(result).toBe('')
    })

    it('should build URL with default base URL', () => {
      const result = buildNIPostcodeUrl('BT1 1AA')
      expect(result).toContain('BT1%201AA')
      expect(result).toContain('https://api.ni.example.com/postcode')
    })

    it('should build URL with custom base URL', () => {
      const config = { niApiBaseUrl: 'https://custom.api.com/postcode' }
      const result = buildNIPostcodeUrl('BT1 1AA', config)
      expect(result).toBe('https://custom.api.com/postcode/BT1%201AA')
    })

    it('should encode postcode properly', () => {
      const result = buildNIPostcodeUrl('BT1 1AA')
      expect(result).toContain('BT1%201AA')
    })
  })

  describe('buildUKLocationFilters', () => {
    it('should return empty object for null location', () => {
      const result = buildUKLocationFilters(null)
      expect(result).toEqual({})
    })

    it('should build filter with location', () => {
      const result = buildUKLocationFilters('London')
      expect(result).toEqual({ filter: 'location=London' })
    })

    it('should encode location properly', () => {
      const result = buildUKLocationFilters('London SW1A 1AA')
      expect(result.filter).toContain('London%20SW1A%201AA')
    })

    it('should handle config parameter', () => {
      const config = { someOption: true }
      const result = buildUKLocationFilters('London', config)
      expect(result).toEqual({ filter: 'location=London' })
    })
  })

  describe('buildUKApiUrl', () => {
    it('should return empty string for null location', () => {
      const result = buildUKApiUrl(null)
      expect(result).toBe('')
    })

    it('should build URL with default base URL', () => {
      const result = buildUKApiUrl('London')
      expect(result).toBe('https://api.uk.example.com/location/London')
    })

    it('should build URL with custom base URL', () => {
      const config = { ukApiBaseUrl: 'https://custom.api.com/location' }
      const result = buildUKApiUrl('London', config)
      expect(result).toBe('https://custom.api.com/location/London')
    })

    it('should encode location properly', () => {
      const result = buildUKApiUrl('London SW1A 1AA')
      expect(result).toContain('London%20SW1A%201AA')
    })
  })
})
