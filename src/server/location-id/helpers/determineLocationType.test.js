import { describe, it, expect } from 'vitest'
import determineLocationType from './determineLocationType.js'
import { LOCATION_TYPE_UK, LOCATION_TYPE_NI } from '../../data/constants.js'

describe('determineLocationType', () => {
  it('should return LOCATION_TYPE_UK when locationType is UK', () => {
    const locationData = {
      locationType: LOCATION_TYPE_UK,
      id: '12345',
      name: 'London'
    }

    const result = determineLocationType(locationData)
    expect(result).toBe(LOCATION_TYPE_UK)
  })

  it('should return LOCATION_TYPE_NI when locationType is not UK', () => {
    const locationData = {
      locationType: LOCATION_TYPE_NI,
      id: '67890',
      name: 'Belfast'
    }

    const result = determineLocationType(locationData)
    expect(result).toBe(LOCATION_TYPE_NI)
  })

  it('should return LOCATION_TYPE_NI when locationType is undefined', () => {
    const locationData = {
      id: '54321',
      name: 'Unknown Location'
    }

    const result = determineLocationType(locationData)
    expect(result).toBe(LOCATION_TYPE_NI)
  })

  it('should return LOCATION_TYPE_NI when locationType has any other value', () => {
    const locationData = {
      locationType: 'SCOTLAND',
      id: '99999',
      name: 'Edinburgh'
    }

    const result = determineLocationType(locationData)
    expect(result).toBe(LOCATION_TYPE_NI)
  })
})
