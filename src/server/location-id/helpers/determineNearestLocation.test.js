import { describe, it, expect, vi } from 'vitest'
import determineNearestLocation from './determineNearestLocation.js'
import { getNearestLocation } from '../../locations/helpers/get-nearest-location.js'

// '' Mock the getNearestLocation dependency
vi.mock('../../locations/helpers/get-nearest-location.js', () => ({
  getNearestLocation: vi.fn()
}))

describe('determineNearestLocation', () => {
  const mockGetNearestLocation = vi.mocked(getNearestLocation)

  beforeEach(() => {
    mockGetNearestLocation.mockClear()
  })

  it('should call getNearestLocation with correct parameters', () => {
    const locationData = {
      results: [
        { id: '1', name: 'Cardiff', distance: 10 },
        { id: '2', name: 'Swansea', distance: 5 }
      ]
    }
    const getForecasts = vi.fn()
    const locationType = 'UK'
    const index = 0
    const lang = 'en'

    const expectedResult = { id: '2', name: 'Swansea', distance: 5 }
    mockGetNearestLocation.mockReturnValue(expectedResult)

    const result = determineNearestLocation(
      locationData,
      getForecasts,
      locationType,
      index,
      lang
    )

    expect(mockGetNearestLocation).toHaveBeenCalledWith(
      locationData.results,
      getForecasts,
      locationType,
      index,
      lang,
      undefined
    )
    expect(result).toBe(expectedResult)
  })

  it('should handle locationData with undefined results', () => {
    const locationData = { results: undefined }
    const getForecasts = vi.fn()
    const locationType = 'NI'
    const index = 1
    const lang = 'cy'

    const expectedResult = null
    mockGetNearestLocation.mockReturnValue(expectedResult)

    const result = determineNearestLocation(
      locationData,
      getForecasts,
      locationType,
      index,
      lang
    )

    expect(mockGetNearestLocation).toHaveBeenCalledWith(
      undefined,
      getForecasts,
      locationType,
      index,
      lang,
      undefined
    )
    expect(result).toBe(expectedResult)
  })
})
