import { describe, it, expect } from 'vitest'
import { filterByPostcode } from './filter-by-postcode.js'

describe('filterByPostcode', () => {
  it('should return single match when isFullPostcode is true and multiple matches exist', () => {
    const matches = [
      { id: 1, name: 'Location 1' },
      { id: 2, name: 'Location 2' },
      { id: 3, name: 'Location 3' }
    ]
    const postcodes = { isFullPostcode: true }

    const result = filterByPostcode(matches, postcodes)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ id: 1, name: 'Location 1' })
  })

  it('should return all matches when isFullPostcode is false', () => {
    const matches = [
      { id: 1, name: 'Location 1' },
      { id: 2, name: 'Location 2' }
    ]
    const postcodes = { isFullPostcode: false }

    const result = filterByPostcode(matches, postcodes)

    expect(result).toEqual(matches)
  })

  it('should return all matches when isFullPostcode is true but only one match exists', () => {
    const matches = [{ id: 1, name: 'Single Location' }]
    const postcodes = { isFullPostcode: true }

    const result = filterByPostcode(matches, postcodes)

    expect(result).toEqual(matches)
  })
})
