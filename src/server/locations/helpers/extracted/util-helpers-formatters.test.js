import { describe, it, expect } from 'vitest'
import {
  formatUKApiResponse,
  formatNorthernIrelandPostcode,
  combineUKSearchTerms
} from './util-helpers.js'

describe('util-helpers - Formatter Functions', () => {
  describe('formatUKApiResponse', () => {
    it('should return response as-is', () => {
      const response = { data: 'test', results: [] }
      const result = formatUKApiResponse(response)
      expect(result).toEqual(response)
    })

    it('should handle null response', () => {
      const result = formatUKApiResponse(null)
      expect(result).toBeNull()
    })
  })

  describe('formatNorthernIrelandPostcode', () => {
    it('should return empty string for null postcode', () => {
      const result = formatNorthernIrelandPostcode(null)
      expect(result).toBe('')
    })

    it('should trim and uppercase postcode', () => {
      const result = formatNorthernIrelandPostcode('  bt1 1aa  ')
      expect(result).toBe('BT11AA')
    })

    it('should remove spaces from postcode', () => {
      const result = formatNorthernIrelandPostcode('BT1 1AA')
      expect(result).toBe('BT11AA')
    })

    it('should handle multiple spaces', () => {
      const result = formatNorthernIrelandPostcode('BT1    1AA')
      expect(result).toBe('BT11AA')
    })

    it('should handle already formatted postcode', () => {
      const result = formatNorthernIrelandPostcode('BT11AA')
      expect(result).toBe('BT11AA')
    })
  })

  describe('combineUKSearchTerms', () => {
    it('should return empty string when both terms are null', () => {
      const result = combineUKSearchTerms(null, null)
      expect(result).toBe('')
    })

    it('should return term2 when term1 is null', () => {
      const result = combineUKSearchTerms(null, 'London')
      expect(result).toBe('London')
    })

    it('should return term1 when term2 is null', () => {
      const result = combineUKSearchTerms('London', null)
      expect(result).toBe('London')
    })

    it('should combine both terms with space', () => {
      const result = combineUKSearchTerms('London', 'SW1A 1AA')
      expect(result).toBe('London SW1A 1AA')
    })

    it('should handle empty strings', () => {
      const result = combineUKSearchTerms('', '')
      expect(result).toBe('')
    })
  })
})
