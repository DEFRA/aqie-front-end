import reduceMatches from './reduce-matches'
import { filterByPostcode } from './filter-by-postcode'
import { filterBySearchTerms } from './filter-by-search-terms'

vi.mock('./filter-by-postcode')
vi.mock('./filter-by-search-terms')

describe('reduceMatches', () => {
  const fullPostcodePattern = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i
  const partialPostcodePattern = /^[A-Z]{1,2}\d[A-Z\d]?$/i

  beforeEach(() => {
    filterByPostcode.mockImplementation(
      (matches, location, postcodes) => matches
    )
    filterBySearchTerms.mockImplementation(
      (matches, search, isAlphanumeric) => matches
    )
  })

  test('filters by postcode and search terms', () => {
    const selectedMatches = [{ id: 1 }, { id: 2 }]
    const options = {
      searchTerms: 'search',
      secondSearchTerm: 'second',
      fullPostcodePattern,
      partialPostcodePattern,
      isFullPostcode: true
    }
    const result = reduceMatches(selectedMatches, 'location', options)
    expect(result).toEqual(selectedMatches)
  })

  test('returns single match when partial postcode pattern matches and length is within limit', () => {
    const selectedMatches = [{ id: 1 }, { id: 2 }]
    const options = {
      searchTerms: 'search',
      secondSearchTerm: 'second',
      fullPostcodePattern,
      partialPostcodePattern,
      isFullPostcode: false
    }
    const result = reduceMatches(selectedMatches, 'SW1', options)
    expect(result).toEqual([selectedMatches[0]])
  })

  test('returns single match when selectedMatches length is 1', () => {
    const selectedMatches = [{ id: 1 }]
    const options = {
      searchTerms: 'search',
      secondSearchTerm: 'second',
      fullPostcodePattern,
      partialPostcodePattern,
      isFullPostcode: false
    }
    const result = reduceMatches(selectedMatches, 'location', options)
    expect(result).toEqual(selectedMatches)
  })

  test('returns filtered matches when input is not a postcode', () => {
    const selectedMatches = [{ id: 1 }, { id: 2 }]
    const options = {
      searchTerms: 'search',
      secondSearchTerm: 'second',
      fullPostcodePattern,
      partialPostcodePattern,
      isFullPostcode: false
    }
    const result = reduceMatches(selectedMatches, 'location', options)
    expect(result).toEqual(selectedMatches)
  })

  test('handles empty selectedMatches array', () => {
    const selectedMatches = []
    const options = {
      searchTerms: 'search',
      secondSearchTerm: 'second',
      fullPostcodePattern,
      partialPostcodePattern,
      isFullPostcode: false
    }
    const result = reduceMatches(selectedMatches, 'location', options)
    expect(result).toEqual([])
  })

  test.skip('handles null input for locationNameOrPostcode', () => {
    const selectedMatches = [{ id: 1 }, { id: 2 }]
    const options = {
      searchTerms: 'search',
      secondSearchTerm: 'second',
      fullPostcodePattern,
      partialPostcodePattern,
      isFullPostcode: false
    }
    const result = reduceMatches(selectedMatches, null, options)
    expect(result).toEqual(selectedMatches)
  })

  test('handles empty string input for locationNameOrPostcode', () => {
    const selectedMatches = [{ id: 1 }, { id: 2 }]
    const options = {
      searchTerms: 'search',
      secondSearchTerm: 'second',
      fullPostcodePattern,
      partialPostcodePattern,
      isFullPostcode: false
    }
    const result = reduceMatches(selectedMatches, '', options)
    expect(result).toEqual(selectedMatches)
  })

  test('handles alphanumeric input for locationNameOrPostcode', () => {
    const selectedMatches = [{ id: 1 }, { id: 2 }]
    const options = {
      searchTerms: 'search',
      secondSearchTerm: 'second',
      fullPostcodePattern,
      partialPostcodePattern,
      isFullPostcode: false
    }
    const result = reduceMatches(selectedMatches, 'A1B2C3', options)
    expect(result).toEqual(selectedMatches)
  })

  // Unit tests for reduce-matches.js
  const { reduceMatches: reduceMatchesHelper } = require('./reduce-matches')

  // Mock data
  const mockMatches = [
    { id: '1', name: 'Location 1' },
    { id: '2', name: 'Location 2' }
  ]

  test('should reduce matches to a simplified format', () => {
    const result = reduceMatchesHelper(mockMatches)
    expect(result).toEqual(mockMatches)
  })

  test('should handle empty matches array gracefully', () => {
    const result = reduceMatchesHelper([])
    expect(result).toEqual([])
  })
})
