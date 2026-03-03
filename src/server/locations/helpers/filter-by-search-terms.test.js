import { describe, it, expect } from 'vitest'
import { filterBySearchTerms } from './filter-by-search-terms.js'

describe('filterBySearchTerms - alphanumeric matching', () => {
  it('should filter matches for alphanumeric search with undefined second term', () => {
    const matches = [
      { GAZETTEER_ENTRY: { NAME1: 'SW1A 1AA' } },
      { GAZETTEER_ENTRY: { NAME1: 'SW2A 2BB' } }
    ]
    const search = {
      searchTerms: 'SW1A',
      secondSearchTerm: 'UNDEFINED'
    }
    const isAlphanumeric = true

    const result = filterBySearchTerms(matches, search, isAlphanumeric)

    expect(result).toHaveLength(1)
    expect(result[0].GAZETTEER_ENTRY.NAME1).toBe('SW1A 1AA')
  })

  it('should return all matches when single match exists', () => {
    const matches = [{ GAZETTEER_ENTRY: { NAME1: 'London' } }]
    const search = {
      searchTerms: 'London',
      secondSearchTerm: 'UNDEFINED'
    }
    const isAlphanumeric = false

    const result = filterBySearchTerms(matches, search, isAlphanumeric)

    expect(result).toEqual(matches)
  })

  it('should handle case insensitive matching', () => {
    const matches = [{ GAZETTEER_ENTRY: { NAME1: 'london' } }]
    const search = {
      searchTerms: 'LONDON',
      secondSearchTerm: 'UNDEFINED'
    }
    const isAlphanumeric = true

    const result = filterBySearchTerms(matches, search, isAlphanumeric)

    expect(result).toHaveLength(1)
    expect(result[0].GAZETTEER_ENTRY.NAME1).toBe('london')
  })
})

describe('filterBySearchTerms - multiple match handling', () => {
  it('should return empty array when multiple matches with undefined second term', () => {
    const matches = [
      { GAZETTEER_ENTRY: { NAME1: 'London' } },
      { GAZETTEER_ENTRY: { NAME1: 'Londonderry' } }
    ]
    const search = {
      searchTerms: 'London',
      secondSearchTerm: 'UNDEFINED'
    }
    const isAlphanumeric = false

    const result = filterBySearchTerms(matches, search, isAlphanumeric)

    expect(result).toEqual([])
  })

  it('should return single match when multiple matches with defined second term', () => {
    const matches = [
      { GAZETTEER_ENTRY: { NAME1: 'London' } },
      { GAZETTEER_ENTRY: { NAME1: 'Londonderry' } }
    ]
    const search = {
      searchTerms: 'London',
      secondSearchTerm: 'Greater'
    }
    const isAlphanumeric = false

    const result = filterBySearchTerms(matches, search, isAlphanumeric)

    expect(result).toHaveLength(1)
    expect(result[0].GAZETTEER_ENTRY.NAME1).toBe('London')
  })
})

describe('filterBySearchTerms - edge cases', () => {
  it('should handle null/undefined searchTerms gracefully', () => {
    const matches = [{ GAZETTEER_ENTRY: { NAME1: 'Test' } }]
    const search = {
      searchTerms: null,
      secondSearchTerm: 'UNDEFINED'
    }
    const isAlphanumeric = true

    const result = filterBySearchTerms(matches, search, isAlphanumeric)

    expect(result).toEqual(matches)
  })

  it('should handle matches without GAZETTEER_ENTRY', () => {
    const matches = [{ GAZETTEER_ENTRY: { NAME1: 'Valid' } }, {}]
    const search = {
      searchTerms: 'Valid',
      secondSearchTerm: 'UNDEFINED'
    }
    const isAlphanumeric = true

    const result = filterBySearchTerms(matches, search, isAlphanumeric)

    expect(result).toHaveLength(1)
    expect(result[0].GAZETTEER_ENTRY.NAME1).toBe('Valid')
  })
})
