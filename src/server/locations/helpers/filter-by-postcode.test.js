import { filterByPostcode } from './filter-by-postcode'

// Mock data
const mockLocations = [
  { GAZETTEER_ENTRY: { ID: 'SW1A 1AA' } },
  { GAZETTEER_ENTRY: { ID: 'M1 1AE' } },
  { GAZETTEER_ENTRY: { ID: 'L1 1AB' } }
]

describe('filterByPostcode', () => {
  it('should filter locations by exact postcode match', () => {
    const result = filterByPostcode(mockLocations, 'SW1A 1AA')
    expect(result).toEqual([{ GAZETTEER_ENTRY: { ID: 'SW1A 1AA' } }])
  })

  it('should return empty array for no matches', () => {
    const result = filterByPostcode(mockLocations, 'B1 1AA')
    expect(result).toEqual([])
  })

  it('should handle empty locations array gracefully', () => {
    const result = filterByPostcode([], 'SW1A 1AA')
    expect(result).toEqual([])
  })

  it('should handle case-insensitive postcode matches', () => {
    const result = filterByPostcode(mockLocations, 'sw1a 1aa')
    expect(result).toEqual([{ GAZETTEER_ENTRY: { ID: 'SW1A 1AA' } }])
  })

  it('should return empty array for undefined postcode', () => {
    const result = filterByPostcode(mockLocations, undefined)
    expect(result).toEqual([])
  })

  it('should return empty array for null postcode', () => {
    const result = filterByPostcode(mockLocations, null)
    expect(result).toEqual([])
  })
})
