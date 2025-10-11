import { describe, expect, vi } from 'vitest'
import { getIdMatch } from './get-id-match.js'

// Mock constants
vi.mock('../../data/constants.js', () => ({
  LOCATION_TYPE_UK: 'UK',
  LOCATION_TYPE_NI: 'NI'
}))

describe('getIdMatch', () => {
  it('should return locationDetails for UK location type', () => {
    const locationId = 'test-id'
    const locationData = {
      results: [
        { GAZETTEER_ENTRY: { ID: 'test-id', NAME: 'Test Location' } },
        { GAZETTEER_ENTRY: { ID: 'other-id', NAME: 'Other Location' } }
      ]
    }
    const resultNI = []
    const locationType = 'UK'
    const locationIndex = 0

    const result = getIdMatch(
      locationId,
      locationData,
      resultNI,
      locationType,
      locationIndex
    )

    expect(result.locationDetails).toBeDefined()
    expect(result.locationDetails.GAZETTEER_ENTRY.ID).toBe('test-id')
  })

  it('should return locationDetails for NI location type', () => {
    const locationId = 'test-ni-id'
    const locationData = {}
    const resultNI = [
      { GAZETTEER_ENTRY: { ID: 'test-ni-id', NAME: 'Test NI Location' } },
      { GAZETTEER_ENTRY: { ID: 'other-ni-id', NAME: 'Other NI Location' } }
    ]
    const locationType = 'NI'
    const locationIndex = 0

    const result = getIdMatch(
      locationId,
      locationData,
      resultNI,
      locationType,
      locationIndex
    )

    expect(result.locationDetails).toBeDefined()
    expect(result.locationDetails.GAZETTEER_ENTRY.ID).toBe('test-ni-id')
  })

  it('should handle case-insensitive matching for NI locations', () => {
    const locationId = 'TEST-NI-ID'
    const locationData = {}
    const resultNI = [
      { GAZETTEER_ENTRY: { ID: 'test-ni-id', NAME: 'Test NI Location' } }
    ]
    const locationType = 'NI'
    const locationIndex = 0

    const result = getIdMatch(
      locationId,
      locationData,
      resultNI,
      locationType,
      locationIndex
    )

    expect(result.locationDetails).toBeDefined()
    expect(result.locationDetails.GAZETTEER_ENTRY.ID).toBe('test-ni-id')
  })

  it('should return undefined when no match found', () => {
    const locationId = 'non-existent-id'
    const locationData = {
      results: [{ GAZETTEER_ENTRY: { ID: 'test-id', NAME: 'Test Location' } }]
    }
    const resultNI = []
    const locationType = 'UK'
    const locationIndex = 0

    const result = getIdMatch(
      locationId,
      locationData,
      resultNI,
      locationType,
      locationIndex
    )

    expect(result.locationDetails).toBeUndefined()
  })

  it('should return undefined when no NI match found', () => {
    const locationId = 'non-existent-ni-id'
    const locationData = {}
    const resultNI = [
      { GAZETTEER_ENTRY: { ID: 'different-id', NAME: 'Different Location' } }
    ]
    const locationType = 'NI'
    const locationIndex = 0

    const result = getIdMatch(
      locationId,
      locationData,
      resultNI,
      locationType,
      locationIndex
    )

    expect(result.locationDetails).toBeUndefined()
  })
})
