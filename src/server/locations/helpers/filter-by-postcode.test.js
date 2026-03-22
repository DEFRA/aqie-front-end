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

  it('sorts by normalized POPULATED_PLACE for full postcodes', () => {
    const matches = [
      {
        GAZETTEER_ENTRY: {
          POPULATED_PLACE: ['Westminster', 'London'],
          DISTRICT_BOROUGH: 'City of Westminster'
        }
      },
      {
        GAZETTEER_ENTRY: {
          POPULATED_PLACE: 'Aldgate',
          DISTRICT_BOROUGH: 'City of London'
        }
      }
    ]

    const result = filterByPostcode(matches, { isFullPostcode: true })

    expect(result).toHaveLength(1)
    expect(result[0].GAZETTEER_ENTRY.POPULATED_PLACE).toBe('Aldgate')
  })

  it('falls back to DISTRICT_BOROUGH and then COUNTY_UNITARY when POPULATED_PLACE is missing', () => {
    const matches = [
      {
        GAZETTEER_ENTRY: {
          DISTRICT_BOROUGH: 'York',
          COUNTY_UNITARY: 'North Yorkshire'
        }
      },
      {
        GAZETTEER_ENTRY: {
          COUNTY_UNITARY: 'Bristol'
        }
      }
    ]

    const result = filterByPostcode(matches, { isFullPostcode: true })

    expect(result).toHaveLength(1)
    expect(result[0].GAZETTEER_ENTRY.COUNTY_UNITARY).toBe('Bristol')
  })

  it('handles POPULATED_PLACE arrays without mutating the original array', () => {
    const populatedPlace = ['Zed', 'Alpha']
    const matches = [
      {
        GAZETTEER_ENTRY: {
          POPULATED_PLACE: populatedPlace,
          DISTRICT_BOROUGH: 'Test Borough'
        }
      },
      {
        GAZETTEER_ENTRY: {
          POPULATED_PLACE: 'Beta',
          DISTRICT_BOROUGH: 'Another Borough'
        }
      }
    ]

    filterByPostcode(matches, { isFullPostcode: true })

    expect(populatedPlace).toEqual(['Zed', 'Alpha'])
  })
})
