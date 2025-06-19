import { filterBySearchTerms } from './filter-by-search-terms'

// Mock data
const mockLocations = [
  { name: 'London' },
  { name: 'Manchester' },
  { name: 'Liverpool' }
]

const UNDEFINED_TERM = 'UNDEFINED'

describe('filterBySearchTerms', () => {
  it('should filter locations by search term with alphanumeric check', () => {
    const result = filterBySearchTerms(
      mockLocations,
      { searchTerms: 'London', secondSearchTerm: UNDEFINED_TERM },
      true
    )
    expect(result).toEqual([{ name: 'London' }])
  })

  it('should return empty array for no matches when secondSearchTerm is undefined', () => {
    const result = filterBySearchTerms(
      mockLocations,
      { searchTerms: 'Birmingham', secondSearchTerm: UNDEFINED_TERM },
      false
    )
    expect(result).toEqual([])
  })

  it('should handle empty locations array gracefully', () => {
    const result = filterBySearchTerms(
      [],
      { searchTerms: 'London', secondSearchTerm: UNDEFINED_TERM },
      false
    )
    expect(result).toEqual([])
  })

  it('should limit to a single match when isAlphanumeric is true', () => {
    const result = filterBySearchTerms(
      mockLocations,
      { searchTerms: 'London', secondSearchTerm: 'Manchester' },
      true
    )
    expect(result).toEqual([{ name: 'London' }])
  })

  it('should return empty array when secondSearchTerm is undefined and matches exceed limit', () => {
    const result = filterBySearchTerms(
      mockLocations,
      { searchTerms: 'London', secondSearchTerm: UNDEFINED_TERM },
      false
    )
    expect(result).toEqual([])
  })
})
