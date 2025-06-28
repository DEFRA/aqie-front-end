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

describe('getSearchTermsFromUrl', () => {
  beforeEach(() => {
    getPostcode.mockImplementation((searchTerms) => ({
      postcodeType: 'Invalid Postcode'
    }))
    isOnlyWords.mockImplementation((searchTerms) => true)
  })

  test('returns correct search terms, language, and location type for Welsh location', () => {
    const url = 'https://example.com/lleoliad/some-location'
    const result = getSearchTermsFromUrl(url)
    expect(result).toEqual({
      searchTerms: 'some location',
      secondSearchTerm: undefined,
      searchTermsLang: 'cy',
      searchTermsLocationType: LOCATION_TYPE_UK
    })
  })

  test('returns correct search terms, language, and location type for English location', () => {
    const url = 'https://example.com/location/some-location'
    const result = getSearchTermsFromUrl(url)
    expect(result).toEqual({
      searchTerms: 'some location',
      secondSearchTerm: undefined,
      searchTermsLang: 'en',
      searchTermsLocationType: LOCATION_TYPE_UK
    })
  })

  test('returns correct search terms, language, and location type for Northern Ireland postcode', () => {
    getPostcode.mockImplementation((searchTerms) => ({
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
    getPostcode.mockImplementation((searchTerms) => ({
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

  test('returns correct search terms, language, and location type for invalid postcode with words', () => {
    const url = 'https://example.com/location/some-location_invalid'
    const result = getSearchTermsFromUrl(url)
    expect(result).toEqual({
      searchTerms: 'some location',
      secondSearchTerm: 'invalid',
      searchTermsLang: 'en',
      searchTermsLocationType: LOCATION_TYPE_UK
    })
  })

  test('handles URL without interrogation sign', () => {
    const url = 'https://example.com/location/some-location'
    const result = getSearchTermsFromUrl(url)
    expect(result).toEqual({
      searchTerms: 'some location',
      secondSearchTerm: undefined,
      searchTermsLang: 'en',
      searchTermsLocationType: LOCATION_TYPE_UK
    })
  })

  test('handles URL with interrogation sign', () => {
    const url = 'https://example.com/location/some-location?query=123'
    const result = getSearchTermsFromUrl(url)
    expect(result).toEqual({
      searchTerms: 'some location',
      secondSearchTerm: undefined,
      searchTermsLang: 'en',
      searchTermsLocationType: LOCATION_TYPE_UK
    })
  })
})
