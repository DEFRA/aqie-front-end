import { describe, it, expect, vi } from 'vitest'
import { fetchData } from './fetch-data.js'
import {
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI,
  STATUS_BAD_REQUEST
} from '../../data/constants.js'

const ERROR_RESPONSE = 'error-response'

describe('fetchData more branches', () => {
  it('returns errorResponse for missing locationType', async () => {
    const di = {
      validateParams: vi.fn(() => false),
      errorResponse: vi.fn(() => ERROR_RESPONSE),
      isTestMode: () => false,
      logger: { error: vi.fn() },
      fetchForecasts: vi.fn(() => ({})),
      handleUKLocationData: vi.fn(),
      handleNILocationData: vi.fn()
    }
    const mockRequest = {
      headers: { host: 'localhost' },
      yar: { get: () => {}, set: () => {}, clear: () => {} }
    }
    const result = await fetchData(mockRequest, { userLocation: 'x' }, di)
    expect(result).toBe(ERROR_RESPONSE)
    expect(di.logger.error).toHaveBeenCalled()
  })

  it('returns errorResponse for unknown locationType in prod', async () => {
    const di = {
      validateParams: vi.fn(() => false),
      errorResponse: vi.fn(() => ERROR_RESPONSE),
      isTestMode: () => false,
      logger: { error: vi.fn() },
      fetchForecasts: vi.fn(() => ({})),
      handleUKLocationData: vi.fn(),
      handleNILocationData: vi.fn()
    }
    const mockRequest = {
      headers: { host: 'localhost' },
      yar: { get: () => {}, set: () => {}, clear: () => {} }
    }
    const result = await fetchData(
      mockRequest,
      { locationType: 'UNKNOWN', userLocation: 'x' },
      di
    )
    expect(result).toBe(ERROR_RESPONSE)
    expect(di.logger.error).toHaveBeenCalledWith(
      'Unsupported location type provided:',
      'UNKNOWN'
    )
  })
})

describe('fetchData - error handling', () => {
  it('returns errorResponse for invalid params', async () => {
    const di = {
      validateParams: vi.fn(() => 'validation-error'),
      errorResponse: vi.fn(() => ERROR_RESPONSE),
      isTestMode: () => false,
      logger: { error: vi.fn() }
    }
    const mockRequest = {
      headers: { host: 'localhost' },
      yar: { get: () => {}, set: () => {}, clear: () => {} }
    }
    const result = await fetchData(
      mockRequest,
      { locationType: 'UK', userLocation: null },
      di
    )
    expect(result).toBe('validation-error')
  })

  it('returns errorResponse for unsupported location type', async () => {
    const di = {
      validateParams: vi.fn(() => false),
      errorResponse: vi.fn(() => ERROR_RESPONSE),
      isTestMode: () => true,
      logger: { error: vi.fn() },
      fetchForecasts: vi.fn(() => ({}))
    }
    const mockRequest = {
      headers: { host: 'localhost' },
      yar: { get: () => {}, set: () => {}, clear: () => {} }
    }
    const result = await fetchData(
      mockRequest,
      { locationType: 'OTHER', userLocation: 'x' },
      di
    )
    expect(result).toBe(ERROR_RESPONSE)
    expect(di.logger.error).toHaveBeenCalledWith(
      'Unsupported location type in test mode:',
      'OTHER'
    )
  })
})

describe('fetchData - UK location type', () => {
  it('returns correct structure for UK in test mode', async () => {
    const di = {
      validateParams: vi.fn(() => false),
      isTestMode: () => true,
      isMockEnabled: true,
      logger: { error: vi.fn() },
      fetchForecasts: vi.fn(() => 'summary'),
      handleUKLocationData: vi.fn(() => ({ results: ['ukData'] })),
      handleNILocationData: vi.fn(),
      refreshOAuthToken: vi.fn(),
      config: { get: vi.fn() },
      options: {},
      optionsEphemeralProtected: {},
      errorResponse: vi.fn(() => ({
        error: true,
        message: 'should not be called',
        statusCode: STATUS_BAD_REQUEST
      }))
    }
    const result = await fetchData(
      {},
      { locationType: LOCATION_TYPE_UK, userLocation: 'x' },
      di
    )
    expect(result).toEqual({
      getDailySummary: 'summary',
      getForecasts: 'summary',
      getOSPlaces: { results: ['ukData'] }
    })
  })
})

describe('fetchData - NI location type', () => {
  it('returns correct structure for NI in test mode', async () => {
    const di = {
      validateParams: vi.fn(() => false),
      isTestMode: () => true,
      isMockEnabled: true,
      logger: { error: vi.fn() },
      fetchForecasts: vi.fn(() => ({ 'forecast-summary': 'summary' })),
      handleNILocationData: vi.fn(() => ({ results: ['niData'] })),
      handleUKLocationData: vi.fn(),
      refreshOAuthToken: vi.fn(),
      config: { get: vi.fn() },
      options: {},
      optionsEphemeralProtected: {},
      errorResponse: vi.fn(() => ({
        error: true,
        message: 'should not be called',
        statusCode: STATUS_BAD_REQUEST
      }))
    }
    const result = await fetchData(
      {},
      { locationType: LOCATION_TYPE_NI, userLocation: 'x' },
      di
    )
    expect(result).toEqual({
      getDailySummary: 'summary',
      getForecasts: { 'forecast-summary': 'summary' },
      getNIPlaces: { results: ['niData'] }
    })
  })
})

describe('fetchData branch coverage - getDailySummary assignment', () => {
  it('assigns getDailySummary from getForecasts["forecast-summary"]', async () => {
    const mockRequest = { yar: { get: vi.fn() } }
    const diUK = {
      validateParams: () => null,
      errorResponse: vi.fn(),
      logger: { error: vi.fn() },
      isTestMode: () => false,
      handleUKLocationData: vi.fn(async () => 'uk-places'),
      handleNILocationData: vi.fn(),
      fetchForecasts: vi.fn(async () => ({
        'forecast-summary': { today: null }
      })),
      options: {},
      config: { get: vi.fn() },
      isMockEnabled: false
    }
    const resultUK = await fetchData(
      mockRequest,
      {
        locationType: LOCATION_TYPE_UK,
        userLocation: 'loc',
        searchTerms: 'st',
        secondSearchTerm: 'sst'
      },
      diUK
    )
    expect(resultUK).toBeDefined()
    expect(resultUK.getDailySummary).toEqual({ today: null })
  })

  it('assigns getDailySummary as fallback object if getForecasts is string', async () => {
    const mockRequest = { yar: { get: vi.fn() } }
    const diUKString = {
      validateParams: () => null,
      errorResponse: vi.fn(),
      logger: { error: vi.fn() },
      isTestMode: () => false,
      handleUKLocationData: vi.fn(async () => 'uk-places'),
      handleNILocationData: vi.fn(),
      fetchForecasts: vi.fn(async () => 'string-forecast'),
      options: {},
      config: { get: vi.fn() },
      isMockEnabled: false
    }
    const resultUKString = await fetchData(
      mockRequest,
      {
        locationType: LOCATION_TYPE_UK,
        userLocation: 'loc',
        searchTerms: 'st',
        secondSearchTerm: 'sst'
      },
      diUKString
    )
    expect(resultUKString).toBeDefined()
    expect(resultUKString.getDailySummary).toEqual({ today: null })
  })
})

describe('fetchData branch coverage - NI places null handling', () => {
  it('returns getNIPlaces as { results: [] } if injectedHandleNILocationData returns null in test mode', async () => {
    const mockRequest = { yar: { get: vi.fn() } }
    const diNI = {
      validateParams: () => null,
      errorResponse: vi.fn(),
      logger: { error: vi.fn() },
      isTestMode: () => true,
      handleUKLocationData: vi.fn(),
      handleNILocationData: vi.fn(async () => null),
      fetchForecasts: vi.fn(async () => ({})),
      fetchDailySummary: vi.fn(async () => ({})),
      options: {},
      config: { get: vi.fn() },
      isMockEnabled: true
    }
    const resultNI = await fetchData(
      mockRequest,
      { locationType: LOCATION_TYPE_NI, userLocation: 'loc' },
      diNI
    )
    expect(resultNI).toBeDefined()
    expect(resultNI.getNIPlaces).toEqual({ results: [] })
  })
})

describe('fetchData missing request parameter', () => {
  it('throws error if request parameter is missing', async () => {
    await expect(
      fetchData(null, { locationType: LOCATION_TYPE_UK })
    ).rejects.toThrow(
      "fetchData: 'request' argument is required and was not provided."
    )
  })

  it('throws error if request parameter is undefined', async () => {
    await expect(
      fetchData(undefined, { locationType: LOCATION_TYPE_UK })
    ).rejects.toThrow(
      "fetchData: 'request' argument is required and was not provided."
    )
  })
})

describe('fetchData getDailySummary fallback coverage', () => {
  it('uses fallback object when getDailySummary is invalid', async () => {
    const mockRequest = { yar: { get: vi.fn() } }
    const di = {
      validateParams: () => null,
      errorResponse: vi.fn(),
      logger: { error: vi.fn() },
      isTestMode: () => false,
      handleUKLocationData: vi.fn(async () => 'uk-places'),
      handleNILocationData: vi.fn(),
      fetchForecasts: vi.fn(async () => ({
        'forecast-summary': null
      })),
      options: {},
      config: { get: vi.fn() },
      isMockEnabled: false
    }
    const result = await fetchData(
      mockRequest,
      {
        locationType: LOCATION_TYPE_UK,
        userLocation: 'loc',
        searchTerms: 'st',
        secondSearchTerm: 'sst'
      },
      di
    )
    expect(result.getDailySummary).toEqual({ today: null })
  })

  it('uses fallback object when getDailySummary is not an object', async () => {
    const mockRequest = { yar: { get: vi.fn() } }
    const di = {
      validateParams: () => null,
      errorResponse: vi.fn(),
      logger: { error: vi.fn() },
      isTestMode: () => false,
      handleUKLocationData: vi.fn(async () => 'uk-places'),
      handleNILocationData: vi.fn(),
      fetchForecasts: vi.fn(async () => ({
        'forecast-summary': 'invalid-string'
      })),
      options: {},
      config: { get: vi.fn() },
      isMockEnabled: false
    }
    const result = await fetchData(
      mockRequest,
      {
        locationType: LOCATION_TYPE_UK,
        userLocation: 'loc',
        searchTerms: 'st',
        secondSearchTerm: 'sst'
      },
      di
    )
    expect(result.getDailySummary).toEqual({ today: null })
  })
})

describe('fetchData unsupported location type coverage', () => {
  it('returns errorResponse for unsupported location type', async () => {
    const mockRequest = { yar: { get: vi.fn() } }
    const mockLogger = { error: vi.fn() }
    const mockErrorResponse = vi.fn(() => ({
      error: 'Unsupported location type'
    }))
    const di = {
      validateParams: () => null,
      errorResponse: mockErrorResponse,
      logger: mockLogger,
      isTestMode: () => false,
      handleUKLocationData: vi.fn(),
      handleNILocationData: vi.fn(),
      fetchForecasts: vi.fn(async () => ({
        'forecast-summary': { today: null }
      })),
      options: {},
      config: { get: vi.fn() },
      isMockEnabled: false
    }
    const result = await fetchData(
      mockRequest,
      {
        locationType: 'INVALID_TYPE',
        userLocation: 'loc'
      },
      di
    )
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Unsupported location type provided:',
      'INVALID_TYPE'
    )
    expect(mockErrorResponse).toHaveBeenCalledWith(
      'Unsupported location type provided',
      STATUS_BAD_REQUEST
    )
    expect(result).toEqual({ error: 'Unsupported location type' })
  })
})
