import { describe, it, expect, vi } from 'vitest'
import matchLocationId from './matchLocationId.js'
import { getIdMatch } from '../../locations/helpers/get-id-match.js'

// '' Mock the getIdMatch dependency
vi.mock('../../locations/helpers/get-id-match.js', () => ({
  getIdMatch: vi.fn()
}))

describe('matchLocationId', () => {
  const mockGetIdMatch = vi.mocked(getIdMatch)

  beforeEach(() => {
    mockGetIdMatch.mockClear()
  })

  it('should call getIdMatch with correct parameters', () => {
    const locationId = '12345'
    const locationData = { results: [{ id: '12345', name: 'Cardiff' }] }
    const resultNI = { data: [] }
    const locationType = 'UK'
    const indexNI = 0

    const expectedResult = { id: '12345', name: 'Cardiff', match: true }
    mockGetIdMatch.mockReturnValue(expectedResult)

    const result = matchLocationId(
      locationId,
      locationData,
      resultNI,
      locationType,
      indexNI
    )

    expect(mockGetIdMatch).toHaveBeenCalledWith(
      locationId,
      locationData,
      resultNI,
      locationType,
      indexNI
    )
    expect(result).toBe(expectedResult)
  })

  it('should handle null/undefined parameters', () => {
    const locationId = null
    const locationData = undefined
    const resultNI = null
    const locationType = ''
    const indexNI = -1

    const expectedResult = null
    mockGetIdMatch.mockReturnValue(expectedResult)

    const result = matchLocationId(
      locationId,
      locationData,
      resultNI,
      locationType,
      indexNI
    )

    expect(mockGetIdMatch).toHaveBeenCalledWith(null, undefined, null, '', -1)
    expect(result).toBe(expectedResult)
  })
})
