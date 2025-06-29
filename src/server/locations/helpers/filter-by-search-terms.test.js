import { describe, it, expect } from 'vitest'

describe('Filter by Search Terms Tests', () => {
  it('should filter locations by valid search term', () => {
    const filterBySearchTerms = (locations, term) =>
      locations.filter((location) => location.name.includes(term))
    const locations = [
      { name: 'Cardiff', postcode: 'CF10' },
      { name: 'Swansea', postcode: 'SA1' },
      { name: 'Newport', postcode: 'NP20' }
    ]
    const result = filterBySearchTerms(locations, 'Cardiff')
    expect(result).toEqual([{ name: 'Cardiff', postcode: 'CF10' }])
  })

  it('should return an empty array for invalid search term', () => {
    const filterBySearchTerms = (locations, term) =>
      locations.filter((location) => location.name.includes(term))
    const locations = [
      { name: 'Cardiff', postcode: 'CF10' },
      { name: 'Swansea', postcode: 'SA1' },
      { name: 'Newport', postcode: 'NP20' }
    ]
    const result = filterBySearchTerms(locations, 'InvalidTerm')
    expect(result).toEqual([])
  })
})
