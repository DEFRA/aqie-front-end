import { describe, it, expect } from 'vitest'

describe('Filter by Postcode Tests', () => {
  it('should filter locations by valid postcode', () => {
    const filterByPostcode = (locations, postcode) =>
      locations.filter((location) => location.postcode === postcode)
    const locations = [
      { name: 'Cardiff', postcode: 'CF10' },
      { name: 'Swansea', postcode: 'SA1' },
      { name: 'Newport', postcode: 'NP20' }
    ]
    const result = filterByPostcode(locations, 'CF10')
    expect(result).toEqual([{ name: 'Cardiff', postcode: 'CF10' }])
  })

  it('should return an empty array for invalid postcode', () => {
    const filterByPostcode = (locations, postcode) =>
      locations.filter((location) => location.postcode === postcode)
    const locations = [
      { name: 'Cardiff', postcode: 'CF10' },
      { name: 'Swansea', postcode: 'SA1' },
      { name: 'Newport', postcode: 'NP20' }
    ]
    const result = filterByPostcode(locations, 'INVALID')
    expect(result).toEqual([])
  })
})
