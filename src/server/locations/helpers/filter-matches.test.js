import { describe, it, expect, vi } from 'vitest'

// Mock the helper modules
vi.mock('./convert-string.js', () => ({
  hasExactMatch: vi.fn((searchTerm, name1, name2) => true),
  splitAndCheckSpecificWords: vi.fn(() => false)
}))

vi.mock('./search-terms-borough.js', () => ({
  searchTermsAndBorough: vi.fn(() => true)
}))

vi.mock('./search-terms-unitary.js', () => ({
  searchTermsAndUnitary: vi.fn(() => true)
}))

describe('Filter Matches Tests', () => {
  const mockItem = {
    GAZETTEER_ENTRY: {
      NAME1: 'Cardiff',
      NAME2: 'Caerdydd',
      DISTRICT_BOROUGH: 'Cardiff',
      COUNTY_UNITARY: 'South Glamorgan'
    }
  }

  it('should handle search terms with borough', async () => {
    // ''
    const { filterMatches } = await import('./filter-matches.js')

    const result = filterMatches(mockItem, {
      searchTerms: 'Cardiff',
      secondSearchTerm: 'Cardiff',
      isFullPostcode: false,
      userLocation: ''
    })

    expect(result).toBe(true)
  })

  it('should handle search terms with unitary when no borough', async () => {
    // ''
    const { filterMatches } = await import('./filter-matches.js')
    const itemNoBorough = {
      GAZETTEER_ENTRY: {
        NAME1: 'Swansea',
        NAME2: 'Abertawe',
        DISTRICT_BOROUGH: null,
        COUNTY_UNITARY: 'West Glamorgan'
      }
    }

    const result = filterMatches(itemNoBorough, {
      searchTerms: 'Swansea',
      secondSearchTerm: 'Glamorgan',
      isFullPostcode: false,
      userLocation: ''
    })

    expect(result).toBe(true)
  })

  it('should handle full postcode matching', async () => {
    // ''
    const { filterMatches } = await import('./filter-matches.js')
    const postcodeItem = {
      GAZETTEER_ENTRY: {
        NAME1: 'CF10',
        NAME2: null,
        DISTRICT_BOROUGH: null,
        COUNTY_UNITARY: null
      }
    }

    const result = filterMatches(postcodeItem, {
      searchTerms: null,
      secondSearchTerm: null,
      isFullPostcode: true,
      userLocation: 'CF10'
    })

    expect(result).toBe(true)
  })

  it('should handle generic matching when no specific criteria', async () => {
    // ''
    const { filterMatches } = await import('./filter-matches.js')
    const genericItem = {
      GAZETTEER_ENTRY: {
        NAME1: 'Newport',
        NAME2: 'Casnewydd',
        DISTRICT_BOROUGH: null,
        COUNTY_UNITARY: null
      }
    }

    const result = filterMatches(genericItem, {
      searchTerms: null,
      secondSearchTerm: null,
      isFullPostcode: false,
      userLocation: 'Newport'
    })

    expect(result).toBe(true)
  })
})
