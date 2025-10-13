// '' - Additional tests specifically to improve SonarCloud new code coverage
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getSearchTermsFromUrl } from './get-search-terms-from-url.js'
import { getPostcode } from './get-postcode-type.js'
import { isOnlyWords } from './convert-string.js'

// Mock the dependencies
vi.mock('./get-postcode-type.js', () => ({
  getPostcode: vi.fn()
}))

vi.mock('./convert-string.js', () => ({
  isOnlyWords: vi.fn()
}))

describe('Search Terms Coverage Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Edge cases for new helper functions', () => {
    it('should handle null/undefined URL edge cases', () => {
      const result = getSearchTermsFromUrl(null)
      expect(result.searchTermsLang).toBe('')
      expect(result.searchTerms).toBe('')
      expect(result.searchTermsLocationType).toBe('')
    })

    it('should handle URL without proper language segment', () => {
      getPostcode.mockReturnValue({ postcodeType: 'Invalid Postcode' })
      isOnlyWords.mockReturnValue(false)

      const result = getSearchTermsFromUrl('https://example.com/short')
      expect(result.searchTermsLang).toBe('')
      expect(result.searchTermsLocationType).toBe('Invalid Postcode')
    })

    it('should handle URL with empty extracted string', () => {
      getPostcode.mockReturnValue({ postcodeType: 'Invalid Postcode' })
      isOnlyWords.mockReturnValue(false)

      const result = getSearchTermsFromUrl('https://example.com/')
      expect(result.searchTerms).toBe('')
      expect(result.secondSearchTerm).toBe('')
    })

    it('should handle getPostcode returning undefined', () => {
      getPostcode.mockReturnValue(undefined)

      const result = getSearchTermsFromUrl('https://example.com/location/test')
      expect(result.searchTermsLocationType).toBe('Invalid Postcode')
    })

    it('should handle hyphen splitting in underscore parts', () => {
      getPostcode.mockReturnValue({ postcodeType: 'Invalid Postcode' })
      isOnlyWords.mockReturnValue(true)

      const result = getSearchTermsFromUrl(
        'https://example.com/location/first-second_third-fourth'
      )
      expect(result.searchTerms).toBe('first second')
      expect(result.secondSearchTerm).toBe('third fourth')
    })

    it('should handle undefined splits in URL parsing', () => {
      const result = getSearchTermsFromUrl('')
      expect(result.searchTermsLang).toBe('')
    })

    it('should handle malformed underscore parsing', () => {
      getPostcode.mockReturnValue({ postcodeType: 'Invalid Postcode' })
      isOnlyWords.mockReturnValue(false)

      const result = getSearchTermsFromUrl('https://example.com/location/__')
      expect(result.searchTerms).toBe('')
      expect(result.secondSearchTerm).toBe('')
    })
  })
})
