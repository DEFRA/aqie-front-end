/* global vi, describe, beforeEach, test, expect */
import { getSearchTermsFromUrl } from './get-search-terms-from-url.js'
import { getPostcode } from './get-postcode-type.js'
import { isOnlyWords } from './convert-string.js'
import { LOCATION_TYPE_NI, LOCATION_TYPE_UK } from '../../data/constants.js'

vi.mock('./get-postcode-type.js', () => ({
  getPostcode: vi.fn()
}))

vi.mock('./convert-string.js', () => ({
  isOnlyWords: vi.fn()
}))

const MOCK_LOCATION = 'some location'
const INVALID_POSTCODE = 'Invalid Postcode'

describe('getSearchTermsFromUrl - language detection', () => {
  beforeEach(() => {
    getPostcode.mockImplementation((_searchTerms) => ({
      postcodeType: INVALID_POSTCODE
    }))
    isOnlyWords.mockImplementation((_searchTerms) => true)
  })

  test('returns correct search terms, language, and location type for Welsh location', () => {
    const url = 'https://example.com/lleoliad/some-location'
    const result = getSearchTermsFromUrl(url)
    expect(result).toEqual({
      searchTerms: MOCK_LOCATION,
      secondSearchTerm: null,
      searchTermsLang: 'cy',
      searchTermsLocationType: LOCATION_TYPE_UK
    })
  })

  test('returns correct search terms, language, and location type for English location', () => {
    const url = 'https://example.com/location/some-location'
    const result = getSearchTermsFromUrl(url)
    expect(result).toEqual({
      searchTerms: MOCK_LOCATION,
      secondSearchTerm: null,
      searchTermsLang: 'en',
      searchTermsLocationType: LOCATION_TYPE_UK
    })
  })

  test('handles URL with unknown language path', () => {
    const url = 'https://example.com/unknown/some-location'
    const result = getSearchTermsFromUrl(url)
    expect(result).toEqual({
      searchTerms: MOCK_LOCATION,
      secondSearchTerm: null,
      searchTermsLang: '',
      searchTermsLocationType: LOCATION_TYPE_UK
    })
  })
})

describe('getSearchTermsFromUrl - postcode handling', () => {
  beforeEach(() => {
    getPostcode.mockImplementation((_searchTerms) => ({
      postcodeType: INVALID_POSTCODE
    }))
    isOnlyWords.mockImplementation((_searchTerms) => true)
  })

  test('returns correct search terms, language, and location type for Northern Ireland postcode', () => {
    getPostcode.mockImplementation((_searchTerms) => ({
      postcodeType: 'Full Northern Ireland Postcode'
    }))
    const url = 'https://example.com/location/BT1-1AA'
    const result = getSearchTermsFromUrl(url)
    expect(result).toEqual({
      searchTerms: 'BT1 1AA',
      secondSearchTerm: '',
      searchTermsLang: 'en',
      searchTermsLocationType: LOCATION_TYPE_NI
    })
  })

  test('returns correct search terms, language, and location type for UK postcode', () => {
    getPostcode.mockImplementation((_searchTerms) => ({
      postcodeType: 'Full UK Postcode'
    }))
    const url = 'https://example.com/location/SW1A-1AA'
    const result = getSearchTermsFromUrl(url)
    expect(result).toEqual({
      searchTerms: 'SW1A 1AA',
      secondSearchTerm: '',
      searchTermsLang: 'en',
      searchTermsLocationType: LOCATION_TYPE_UK
    })
  })

  test('handles partial Northern Ireland postcode type', () => {
    getPostcode.mockImplementation((_searchTerms) => ({
      postcodeType: 'Partial Northern Ireland Postcode'
    }))
    const url = 'https://example.com/location/BT1'
    const result = getSearchTermsFromUrl(url)
    expect(result).toEqual({
      searchTerms: 'BT1',
      secondSearchTerm: '',
      searchTermsLang: 'en',
      searchTermsLocationType: LOCATION_TYPE_NI
    })
  })

  test('handles partial UK postcode type', () => {
    getPostcode.mockImplementation((_searchTerms) => ({
      postcodeType: 'Partial UK Postcode'
    }))
    const url = 'https://example.com/location/SW1A'
    const result = getSearchTermsFromUrl(url)
    expect(result).toEqual({
      searchTerms: 'SW1A',
      secondSearchTerm: '',
      searchTermsLang: 'en',
      searchTermsLocationType: LOCATION_TYPE_UK
    })
  })

  test('handles unknown postcode type', () => {
    getPostcode.mockImplementation((_searchTerms) => ({
      postcodeType: 'Unknown Type'
    }))
    const url = 'https://example.com/location/unknown-location'
    const result = getSearchTermsFromUrl(url)
    expect(result).toEqual({
      searchTerms: 'unknown location',
      secondSearchTerm: '',
      searchTermsLang: 'en',
      searchTermsLocationType: 'Unknown Type'
    })
  })
})

describe('getSearchTermsFromUrl - search terms parsing and URL handling', () => {
  beforeEach(() => {
    getPostcode.mockImplementation((_searchTerms) => ({
      postcodeType: INVALID_POSTCODE
    }))
    isOnlyWords.mockImplementation((_searchTerms) => true)
  })

  test('returns correct search terms, language, and location type for invalid postcode with words', () => {
    const url = 'https://example.com/location/some-location_invalid'
    const result = getSearchTermsFromUrl(url)
    expect(result).toEqual({
      searchTerms: MOCK_LOCATION,
      secondSearchTerm: 'invalid',
      searchTermsLang: 'en',
      searchTermsLocationType: LOCATION_TYPE_UK
    })
  })

  test('handles invalid postcode with no underscores but not only words', () => {
    isOnlyWords.mockImplementation((_searchTerms) => false)
    const url = 'https://example.com/location/some123location'
    const result = getSearchTermsFromUrl(url)
    expect(result).toEqual({
      searchTerms: 'some123location',
      secondSearchTerm: '',
      searchTermsLang: 'en',
      searchTermsLocationType: INVALID_POSTCODE
    })
  })

  test('handles URL without interrogation sign', () => {
    const url = 'https://example.com/location/some-location'
    const result = getSearchTermsFromUrl(url)
    expect(result).toEqual({
      searchTerms: MOCK_LOCATION,
      secondSearchTerm: null,
      searchTermsLang: 'en',
      searchTermsLocationType: LOCATION_TYPE_UK
    })
  })

  test('handles URL with interrogation sign', () => {
    const url = 'https://example.com/location/some-location?query=123'
    const result = getSearchTermsFromUrl(url)
    expect(result).toEqual({
      searchTerms: MOCK_LOCATION,
      secondSearchTerm: null,
      searchTermsLang: 'en',
      searchTermsLocationType: LOCATION_TYPE_UK
    })
  })
})
