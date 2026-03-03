import { describe, it, expect, vi } from 'vitest'
import { buildAndCheckUKApiUrl } from './api-utils.js'

// Test constants
const OSNAMES_API_URL = 'https://osnames.api.com'

describe('api-utils - buildAndCheckUKApiUrl', () => {
  it('should build UK API URL with all parameters', () => {
    const mockInjected = {
      buildUKLocationFilters: vi.fn().mockReturnValue('filters'),
      config: {
        get: vi
          .fn()
          .mockReturnValueOnce(OSNAMES_API_URL)
          .mockReturnValueOnce('test-api-key')
      },
      combineUKSearchTerms: vi.fn().mockReturnValue('combined search'),
      isValidFullPostcodeUK: vi.fn(),
      isValidPartialPostcodeUK: vi.fn(),
      buildUKApiUrl: vi
        .fn()
        .mockReturnValue(`${OSNAMES_API_URL}?q=combined+search`)
    }

    const result = buildAndCheckUKApiUrl('London', 'SW1A', '1AA', mockInjected)

    expect(result.osNamesApiUrlFull).toBe(
      `${OSNAMES_API_URL}?q=combined+search`
    )
    expect(result.hasOsKey).toBe(true)
    expect(result.combinedLocation).toBe('combined search')
    expect(mockInjected.buildUKLocationFilters).toHaveBeenCalled()
    expect(mockInjected.combineUKSearchTerms).toHaveBeenCalledWith(
      'London',
      'SW1A',
      '1AA',
      mockInjected.isValidFullPostcodeUK,
      mockInjected.isValidPartialPostcodeUK
    )
  })

  it('should handle missing API key', () => {
    const mockInjected = {
      buildUKLocationFilters: vi.fn().mockReturnValue('filters'),
      config: {
        get: vi
          .fn()
          .mockReturnValueOnce(OSNAMES_API_URL)
          .mockReturnValueOnce('')
      },
      combineUKSearchTerms: vi.fn().mockReturnValue('search'),
      isValidFullPostcodeUK: vi.fn(),
      isValidPartialPostcodeUK: vi.fn(),
      buildUKApiUrl: vi.fn().mockReturnValue(OSNAMES_API_URL)
    }

    const result = buildAndCheckUKApiUrl('London', null, null, mockInjected)

    expect(result.hasOsKey).toBe(false)
  })

  it('should handle whitespace-only API key', () => {
    const mockInjected = {
      buildUKLocationFilters: vi.fn().mockReturnValue('filters'),
      config: {
        get: vi
          .fn()
          .mockReturnValueOnce(OSNAMES_API_URL)
          .mockReturnValueOnce('   ')
      },
      combineUKSearchTerms: vi.fn().mockReturnValue('search'),
      isValidFullPostcodeUK: vi.fn(),
      isValidPartialPostcodeUK: vi.fn(),
      buildUKApiUrl: vi.fn().mockReturnValue(OSNAMES_API_URL)
    }

    const result = buildAndCheckUKApiUrl('London', null, null, mockInjected)

    expect(result.hasOsKey).toBe(false)
  })
})
