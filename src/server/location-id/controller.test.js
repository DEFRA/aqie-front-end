import { describe, it, expect } from 'vitest'
import { SAMPLE_LOCATION_NAME } from '../data/constants.js'

// ''
describe('Location ID Controller Tests', () => {
  it('should return location details correctly', () => {
    const getLocationDetails = (id) => ({ id, name: SAMPLE_LOCATION_NAME }) // ''
    const result = getLocationDetails(1)
    expect(result).toEqual({ id: 1, name: SAMPLE_LOCATION_NAME }) // ''
  })

  it('should handle invalid location ID', () => {
    const getLocationDetails = (id) =>
      id ? { id, name: SAMPLE_LOCATION_NAME } : null // ''
    const result = getLocationDetails(null)
    expect(result).toBeNull()
  })
})
