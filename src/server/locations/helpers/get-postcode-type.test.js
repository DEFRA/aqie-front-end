import { describe, it, expect } from 'vitest'
import { getPostcode } from './get-postcode-type.js'

describe('getPostcode', () => {
  // ''

  // Test full Northern Ireland postcodes
  describe('Full Northern Ireland Postcodes', () => {
    it('should identify BT1 1AB as Full Northern Ireland Postcode', () => {
      // ''
      const result = getPostcode('BT1 1AB')
      expect(result.postcodeType).toBe('Full Northern Ireland Postcode')
    })

    it('should identify BT12 1AB as Full Northern Ireland Postcode', () => {
      // ''
      const result = getPostcode('BT12 1AB')
      expect(result.postcodeType).toBe('Full Northern Ireland Postcode')
    })

    it('should identify BT15 2CD without space as Full Northern Ireland Postcode', () => {
      // ''
      const result = getPostcode('BT152CD')
      expect(result.postcodeType).toBe('Full Northern Ireland Postcode')
    })

    it('should be case insensitive for Full Northern Ireland Postcode', () => {
      // ''
      const result = getPostcode('bt1 1ab')
      expect(result.postcodeType).toBe('Full Northern Ireland Postcode')
    })
  })

  // Test partial Northern Ireland postcodes
  describe('Partial Northern Ireland Postcodes', () => {
    it('should identify BT1 as Partial Northern Ireland Postcode', () => {
      // ''
      const result = getPostcode('BT1')
      expect(result.postcodeType).toBe('Partial Northern Ireland Postcode')
    })

    it('should identify BT12 as Partial Northern Ireland Postcode', () => {
      // ''
      const result = getPostcode('BT12')
      expect(result.postcodeType).toBe('Partial Northern Ireland Postcode')
    })

    it('should be case insensitive for Partial Northern Ireland Postcode', () => {
      // ''
      const result = getPostcode('bt15')
      expect(result.postcodeType).toBe('Partial Northern Ireland Postcode')
    })
  })

  // Test full UK postcodes
  describe('Full UK Postcodes', () => {
    it('should identify M1 1AA as Full UK Postcode', () => {
      // ''
      const result = getPostcode('M1 1AA')
      expect(result.postcodeType).toBe('Full UK Postcode')
    })

    it('should identify SW1A 1AA as Full UK Postcode', () => {
      // ''
      const result = getPostcode('SW1A 1AA')
      expect(result.postcodeType).toBe('Full UK Postcode')
    })

    it('should identify W1A 0AX as Full UK Postcode', () => {
      // ''
      const result = getPostcode('W1A 0AX')
      expect(result.postcodeType).toBe('Full UK Postcode')
    })

    it('should identify postcode without space as Full UK Postcode', () => {
      // ''
      const result = getPostcode('M11AA')
      expect(result.postcodeType).toBe('Full UK Postcode')
    })

    it('should be case insensitive for Full UK Postcode', () => {
      // ''
      const result = getPostcode('m1 1aa')
      expect(result.postcodeType).toBe('Full UK Postcode')
    })
  })

  // Test partial UK postcodes
  describe('Partial UK Postcodes', () => {
    it('should identify M1 as Partial UK Postcode', () => {
      // ''
      const result = getPostcode('M1')
      expect(result.postcodeType).toBe('Partial UK Postcode')
    })

    it('should identify SW1A as Partial UK Postcode', () => {
      // ''
      const result = getPostcode('SW1A')
      expect(result.postcodeType).toBe('Partial UK Postcode')
    })

    it('should identify W1A as Partial UK Postcode', () => {
      // ''
      const result = getPostcode('W1A')
      expect(result.postcodeType).toBe('Partial UK Postcode')
    })

    it('should be case insensitive for Partial UK Postcode', () => {
      // ''
      const result = getPostcode('sw1a')
      expect(result.postcodeType).toBe('Partial UK Postcode')
    })
  })

  // Test invalid postcodes
  describe('Invalid Postcodes', () => {
    it('should identify empty string as Invalid Postcode', () => {
      // ''
      const result = getPostcode('')
      expect(result.postcodeType).toBe('Invalid Postcode')
    })

    it('should identify random string as Invalid Postcode', () => {
      // ''
      const result = getPostcode('INVALID')
      expect(result.postcodeType).toBe('Invalid Postcode')
    })

    it('should identify numbers only as Invalid Postcode', () => {
      // ''
      const result = getPostcode('12345')
      expect(result.postcodeType).toBe('Invalid Postcode')
    })

    it('should identify incomplete UK postcode as Invalid Postcode', () => {
      // ''
      const result = getPostcode('M1 1')
      expect(result.postcodeType).toBe('Invalid Postcode')
    })

    it('should identify incomplete Northern Ireland postcode as Invalid Postcode', () => {
      // ''
      const result = getPostcode('BT1 1')
      expect(result.postcodeType).toBe('Invalid Postcode')
    })
  })

  // Edge cases
  describe('Edge Cases', () => {
    it('should handle null input', () => {
      // ''
      const result = getPostcode(null)
      expect(result.postcodeType).toBe('Invalid Postcode')
    })

    it('should handle undefined input', () => {
      // ''
      const result = getPostcode(undefined)
      expect(result.postcodeType).toBe('Invalid Postcode')
    })
  })
})
