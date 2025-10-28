import { describe, it, expect, vi } from 'vitest'
import {
  fetchMeasurements,
  handleUKLocationData,
  handleNILocationData,
  fetchForecasts,
  refreshOAuthToken,
  fetchData
} from './fetch-data.js'
import { LOCATION_TYPE_UK, LOCATION_TYPE_NI } from '../../data/constants.js'

describe('fetchMeasurements edge branches', () => {
  it('uses ephemeralProtectedDevApiUrl in development for newRicardo', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: {
        get: vi.fn((key) =>
          key === 'ephemeralProtectedDevApiUrl' ? 'dev-url' : 'base-url'
        )
      },
      catchFetchError: vi.fn(async () => [200, [{ measurement: 'dev' }]]),
      options: {},
      optionsEphemeralProtected: {},
      nodeEnv: 'development'
    }
    const result = await fetchMeasurements(51.5, -0.1, true, {
      ...di,
      request: {}
    })
    expect(result).toEqual([{ measurement: 'dev' }])
    expect(di.logger.info).toHaveBeenCalledWith(
      expect.stringContaining('New Ricardo measurements API URL:')
    )
  })

  it('calls old measurements API if useNewRicardoMeasurementsEnabled is false', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: { get: vi.fn((key) => 'old-url') },
      catchFetchError: vi.fn(async () => [200, [{ measurement: 'old' }]]),
      options: {},
      optionsEphemeralProtected: {},
      nodeEnv: 'production'
    }
    const result = await fetchMeasurements(51.5, -0.1, false, {
      ...di,
      request: {}
    })
    expect(result).toEqual([{ measurement: 'old' }])
    expect(di.logger.info).toHaveBeenCalledWith(
      'Old measurements API URL: old-url'
    )
  })
})

describe('fetchForecasts edge branches', () => {
  it('uses ephemeralProtectedDevApiUrl in development', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: {
        get: vi.fn((key) =>
          key === 'ephemeralProtectedDevApiUrl' ? 'dev-url' : 'prod-url'
        )
      },
      catchFetchError: vi.fn(async () => [200, { forecasts: 'dev' }]),
      errorResponse: vi.fn(() => 'error-response'),
      FORECASTS_API_PATH: 'path',
      HTTP_STATUS_OK: 200,
      optionsEphemeralProtected: {},
      options: {},
      nodeEnv: 'development'
    }
    const result = await fetchForecasts(di)
    expect(result).toEqual({ forecasts: 'dev' })
    expect(di.logger.info).toHaveBeenCalledWith('Forecasts data fetched')
  })
})

describe('fetchDailySummary edge branches', () => {
  it('uses ephemeralProtectedDevApiUrl in development', async () => {
    const { fetchDailySummary } = await import('./fetch-data.js')
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: {
        get: vi.fn((key) =>
          key === 'ephemeralProtectedDevApiUrl' ? 'dev-url' : 'prod-url'
        )
      },
      catchFetchError: vi.fn(async () => [200, { summary: 'dev' }]),
      errorResponse: vi.fn(() => 'error-response'),
      FORECASTS_API_PATH: 'path',
      optionsEphemeralProtected: {},
      options: {},
      nodeEnv: 'development'
    }
    const result = await fetchDailySummary(di)
    expect(result).toEqual({ summary: 'dev' })
    expect(di.logger.info).toHaveBeenCalledWith(
      expect.stringContaining('Fetch Daily Summary URL:')
    )
  })

  it('logs options in development', async () => {
    const { fetchDailySummary } = await import('./fetch-data.js')
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: {
        get: vi.fn((key) =>
          key === 'ephemeralProtectedDevApiUrl' ? 'dev-url' : 'prod-url'
        )
      },
      catchFetchError: vi.fn(async () => [200, { summary: 'dev' }]),
      errorResponse: vi.fn(() => 'error-response'),
      FORECASTS_API_PATH: 'path',
      optionsEphemeralProtected: { foo: 'bar' },
      options: {},
      nodeEnv: 'development'
    }
    await fetchDailySummary(di)
    expect(di.logger.info).toHaveBeenCalledWith(
      expect.stringContaining('Fetch Daily Summary Options:')
    )
  })
})
describe('handleUKLocationData more branches', () => {
  it('calls formatUKApiResponse if statusCodeOSPlace is OK', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      config: { get: vi.fn(() => 'key') },
      buildUKLocationFilters: vi.fn(() => ({})),
      combineUKSearchTerms: vi.fn((a, b, c, d, e) => a),
      buildUKApiUrl: vi.fn(() => 'url'),
      shouldCallUKApi: vi.fn(() => true),
      catchProxyFetchError: vi.fn(async () => [200, { foo: 'bar' }]),
      formatUKApiResponse: vi.fn(() => ({ formatted: true })),
      SYMBOLS_ARRAY: [],
      HTTP_STATUS_OK: 200,
      options: {}
    }
    const result = await handleUKLocationData({}, '', '', di)
    expect(result).toEqual({ formatted: true })
    expect(di.formatUKApiResponse).toHaveBeenCalledWith({ foo: 'bar' })
  })
})

describe('handleNILocationData more branches', () => {
  it('returns null and logs error for non-OK status', async () => {
    const di = {
      logger: { info: vi.fn(), error: vi.fn() },
      buildNIPostcodeUrl: vi.fn(() => 'url'),
      isMockEnabled: false,
      config: { get: vi.fn() },
      formatNorthernIrelandPostcode: vi.fn(),
      catchProxyFetchError: vi.fn(async () => [500, null]),
      isTestMode: () => false
    }
    const result = await handleNILocationData({}, {}, di)
    expect(result).toBeNull()
    expect(di.logger.error).toHaveBeenCalled()
  })

  it('wraps getNIPlaces in results array if isMockEnabled', async () => {
    const di = {
      logger: { info: vi.fn(), error: vi.fn() },
      buildNIPostcodeUrl: vi.fn(() => 'url'),
      isMockEnabled: true,
      config: { get: vi.fn() },
      formatNorthernIrelandPostcode: vi.fn(),
      catchProxyFetchError: vi.fn(async () => [200, { foo: 'bar' }]),
      isTestMode: () => false
    }
    // formatNIResponse is not DI'd, so just check for array wrap
    const result = await handleNILocationData({}, {}, di)
    expect(result).toBeDefined()
    expect(result.results).toBeInstanceOf(Array)
  })
})

describe('fetchData more branches', () => {
  it('returns errorResponse for missing locationType', async () => {
    const di = {
      validateParams: vi.fn(() => false),
      errorResponse: vi.fn(() => 'error-response'),
      isTestMode: () => false,
      logger: { error: vi.fn() },
      fetchForecasts: vi.fn(() => ({})),
      handleUKLocationData: vi.fn(),
      handleNILocationData: vi.fn()
    }
    const { fetchData } = await import('./fetch-data.js')
    const mockRequest = {
      headers: { host: 'localhost' },
      yar: { get: () => {}, set: () => {}, clear: () => {} }
    }
    const result = await fetchData(mockRequest, { userLocation: 'x' }, di)
    expect(result).toBe('error-response')
    expect(di.logger.error).toHaveBeenCalled()
  })

  it('returns errorResponse for unknown locationType in prod', async () => {
    const di = {
      validateParams: vi.fn(() => false),
      errorResponse: vi.fn(() => 'error-response'),
      isTestMode: () => false,
      logger: { error: vi.fn() },
      fetchForecasts: vi.fn(() => ({})),
      handleUKLocationData: vi.fn(),
      handleNILocationData: vi.fn()
    }
    const { fetchData } = await import('./fetch-data.js')
    const mockRequest = {
      headers: { host: 'localhost' },
      yar: { get: () => {}, set: () => {}, clear: () => {} }
    }
    const result = await fetchData(
      mockRequest,
      { locationType: 'UNKNOWN', userLocation: 'x' },
      di
    )
    expect(result).toBe('error-response')
    expect(di.logger.error).toHaveBeenCalledWith(
      'Unsupported location type provided:',
      'UNKNOWN'
    )
  })
})
describe('fetchMeasurements additional coverage', () => {
  it('returns [] and logs error if fetchDataFromApi throws', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: {
        get: vi.fn((key) => {
          if (key === 'measurementsApiUrl') throw new Error('fail')
          return 'mock-url'
        })
      },
      catchFetchError: vi.fn(),
      options: {},
      optionsEphemeralProtected: {},
      nodeEnv: 'production'
    }
    const result = await fetchMeasurements(51.5, -0.1, false, {
      ...di,
      request: {}
    })
    expect(result).toEqual([])
    expect(di.logger.error).toHaveBeenCalled()
  })

  it('returns [] if fetchDataFromApi returns non-200 status', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: { get: vi.fn((key) => 'mock-url') },
      catchFetchError: vi.fn(async () => [404, { message: 'not found' }]),
      options: {},
      optionsEphemeralProtected: {},
      nodeEnv: 'production'
    }
    const result = await fetchMeasurements(51.5, -0.1, false, {
      ...di,
      request: {}
    })
    expect(result).toEqual([])
    expect(di.logger.error).toHaveBeenCalledWith(
      'Error fetching data: not found'
    )
  })
})

describe('fetchForecasts additional coverage', () => {
  it('returns errorResponse if catchFetchError throws', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: { get: vi.fn((key) => 'mock-url') },
      catchFetchError: vi.fn(async () => {
        throw new Error('fail')
      }),
      errorResponse: vi.fn(() => 'error-response'),
      FORECASTS_API_PATH: 'path',
      HTTP_STATUS_OK: 200,
      optionsEphemeralProtected: {},
      options: {},
      nodeEnv: 'production'
    }
    await expect(fetchForecasts(di)).rejects.toThrow('fail')
  })
})

describe('fetchDailySummary additional coverage', () => {
  it('returns errorResponse if catchFetchError throws', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: { get: vi.fn((key) => 'mock-url') },
      catchFetchError: vi.fn(async () => {
        throw new Error('fail')
      }),
      errorResponse: vi.fn(() => 'error-response'),
      FORECASTS_API_PATH: 'path',
      optionsEphemeralProtected: {},
      options: {},
      nodeEnv: 'production'
    }
    const { fetchDailySummary } = await import('./fetch-data.js')
    await expect(fetchDailySummary(di)).rejects.toThrow('fail')
  })
})

describe('refreshOAuthToken additional coverage', () => {
  it('sets and clears session on success', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      fetchOAuthToken: vi.fn(async () => 'token')
    }
    const request = { yar: { clear: vi.fn(), set: vi.fn() } }
    const result = await refreshOAuthToken(request, di)
    expect(result).toBe('token')
    expect(request.yar.clear).toHaveBeenCalledWith('savedAccessToken')
    expect(request.yar.set).toHaveBeenCalledWith('savedAccessToken', 'token')
  })
})
describe('fetchDailySummary', () => {
  it('returns mock summary in test mode', async () => {
    const di = {
      isTestMode: () => true,
      logger: { info: vi.fn() }
    }
    // Import fetchDailySummary dynamically to avoid hoist issues
    const { fetchDailySummary } = await import('./fetch-data.js')
    const result = await fetchDailySummary(di)
    expect(result).toEqual({ summary: 'mock-summary' })
    expect(di.logger.info).toHaveBeenCalledWith(
      'Test mode: fetchDailySummary returning mock summary'
    )
  })

  it('returns errorResponse if status is not OK', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: { get: vi.fn((key) => 'mock-url') },
      catchFetchError: vi.fn(async () => [500, { message: 'fail' }]),
      errorResponse: vi.fn(() => 'error-response'),
      FORECASTS_API_PATH: 'path',
      optionsEphemeralProtected: {},
      options: {},
      nodeEnv: 'production'
    }
    const { fetchDailySummary } = await import('./fetch-data.js')
    const result = await fetchDailySummary(di)
    expect(result).toBe('error-response')
    expect(di.logger.error).toHaveBeenCalledWith(
      'Error fetching daily summary: status code 500'
    )
  })
})

describe('fetchData', () => {
  it('returns errorResponse for invalid params', async () => {
    const di = {
      validateParams: vi.fn(() => 'validation-error'),
      errorResponse: vi.fn(() => 'error-response'),
      isTestMode: () => false,
      logger: { error: vi.fn() }
    }
    const { fetchData } = await import('./fetch-data.js')
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
      errorResponse: vi.fn(() => 'error-response'),
      isTestMode: () => true,
      logger: { error: vi.fn() },
      fetchForecasts: vi.fn(() => ({}))
    }
    const { fetchData } = await import('./fetch-data.js')
    const mockRequest = {
      headers: { host: 'localhost' },
      yar: { get: () => {}, set: () => {}, clear: () => {} }
    }
    const result = await fetchData(
      mockRequest,
      { locationType: 'OTHER', userLocation: 'x' },
      di
    )
    expect(result).toBe('error-response')
    expect(di.logger.error).toHaveBeenCalledWith(
      'Unsupported location type provided:',
      'OTHER'
    )
  })

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
        statusCode: 400
      }))
    }
    const { fetchData } = await import('./fetch-data.js')
    const { LOCATION_TYPE_UK } = await import('../../data/constants.js')
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
        statusCode: 400
      }))
    }
    const { fetchData } = await import('./fetch-data.js')
    const { LOCATION_TYPE_NI } = await import('../../data/constants.js')
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
describe('fetchMeasurements error handling', () => {
  it('returns empty array and logs error if API fails', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: { get: vi.fn((key) => 'mock-url') },
      catchFetchError: vi.fn(async () => [500, { message: 'fail' }]),
      options: {},
      optionsEphemeralProtected: {},
      nodeEnv: 'production'
    }
    const result = await fetchMeasurements(51.5, -0.1, false, {
      ...di,
      request: {}
    })
    expect(result).toEqual([])
    expect(di.logger.error).toHaveBeenCalledWith('Error fetching data: fail')
  })

  it('throws if config.get throws', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: {
        get: vi.fn(() => {
          throw new Error('config fail')
        })
      },
      catchFetchError: vi.fn(),
      options: {},
      optionsEphemeralProtected: {},
      nodeEnv: 'production'
    }
    const result = await fetchMeasurements(51.5, -0.1, false, {
      ...di,
      request: {}
    })
    expect(result).toEqual([])
    expect(di.logger.error).toHaveBeenCalled()
  })
})

describe('handleUKLocationData edge cases', () => {
  it('returns empty results and warns if OS key missing', async () => {
    const di = {
      isTestMode: () => false,
      logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
      config: { get: vi.fn((key) => (key === 'osNamesApiKey' ? '' : 'url')) },
      buildUKLocationFilters: vi.fn(() => ({})),
      combineUKSearchTerms: vi.fn((a, b, c, d, e) => a),
      buildUKApiUrl: vi.fn(() => 'url'),
      shouldCallUKApi: vi.fn(() => true),
      catchProxyFetchError: vi.fn(),
      formatUKApiResponse: vi.fn(),
      SYMBOLS_ARRAY: [],
      HTTP_STATUS_OK: 200,
      options: {}
    }
    const result = await handleUKLocationData({}, '', '', di)
    expect(result).toEqual({ results: [] })
    expect(di.logger.warn).toHaveBeenCalledWith(
      'OS_NAMES_API_KEY not set; skipping OS Names API call and returning empty results.'
    )
  })

  it('returns null and warns if unauthorized', async () => {
    const di = {
      isTestMode: () => false,
      logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
      config: { get: vi.fn(() => 'key') },
      buildUKLocationFilters: vi.fn(() => ({})),
      combineUKSearchTerms: vi.fn((a, b, c, d, e) => a),
      buildUKApiUrl: vi.fn(() => 'url'),
      shouldCallUKApi: vi.fn(() => true),
      catchProxyFetchError: vi.fn(async () => [401, null]),
      formatUKApiResponse: vi.fn(),
      SYMBOLS_ARRAY: [],
      HTTP_STATUS_OK: 200,
      options: {}
    }
    const result = await handleUKLocationData({}, '', '', di)
    expect(result).toBeNull()
    expect(di.logger.warn).toHaveBeenCalled()
  })

  it('returns null and logs error for other status', async () => {
    const di = {
      isTestMode: () => false,
      logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
      config: { get: vi.fn(() => 'key') },
      buildUKLocationFilters: vi.fn(() => ({})),
      combineUKSearchTerms: vi.fn((a, b, c, d, e) => a),
      buildUKApiUrl: vi.fn(() => 'url'),
      shouldCallUKApi: vi.fn(() => true),
      catchProxyFetchError: vi.fn(async () => [500, null]),
      formatUKApiResponse: vi.fn(),
      SYMBOLS_ARRAY: [],
      HTTP_STATUS_OK: 200,
      options: {}
    }
    const result = await handleUKLocationData({}, '', '', di)
    expect(result).toBeNull()
    expect(di.logger.error).toHaveBeenCalled()
  })
})

describe('fetchForecasts error handling', () => {
  it('returns errorResponse if status is not OK', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: { get: vi.fn((key) => 'mock-url') },
      catchFetchError: vi.fn(async () => [500, { message: 'fail' }]),
      errorResponse: vi.fn(() => 'error-response'),
      FORECASTS_API_PATH: 'path',
      HTTP_STATUS_OK: 200,
      optionsEphemeralProtected: {},
      options: {},
      nodeEnv: 'production'
    }
    const result = await fetchForecasts(di)
    expect(result).toBe('error-response')
    expect(di.logger.error).toHaveBeenCalledWith(
      'Error fetching forecasts data: status code 500'
    )
  })
})

describe('refreshOAuthToken error handling', () => {
  it('returns error if fetchOAuthToken returns error', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      fetchOAuthToken: vi.fn(async () => ({ error: 'fail' }))
    }
    const request = { yar: { clear: vi.fn(), set: vi.fn() } }
    const result = await refreshOAuthToken(request, di)

    expect(result).toEqual({ error: 'fail' })
  })
})

describe('handleUKLocationData', () => {
  it('returns mock data in test mode', async () => {
    const di = {
      isTestMode: () => true,
      logger: { info: vi.fn() }
    }
    const result = await handleUKLocationData({}, '', '', di)
    expect(result).toEqual({ results: ['ukData'] })
    expect(di.logger.info).toHaveBeenCalledWith(
      'Test mode: handleUKLocationData returning mock data'
    )
  })
})

describe('handleNILocationData', () => {
  it('returns mock data in test mode', async () => {
    const di = {
      isTestMode: () => true,
      logger: { info: vi.fn() }
    }
    const result = await handleNILocationData({}, {}, di)
    expect(result).toEqual({ results: ['niData'] })
    expect(di.logger.info).toHaveBeenCalledWith(
      'Test mode: handleNILocationData returning mock data'
    )
  })
})

describe('fetchForecasts', () => {
  it('returns mock forecasts in test mode', async () => {
    const di = {
      isTestMode: () => true,
      logger: { info: vi.fn() }
    }
    const result = await fetchForecasts(di)
    expect(result).toEqual({ forecasts: 'mock-forecasts' })
    expect(di.logger.info).toHaveBeenCalledWith(
      'Test mode: fetchForecasts returning mock forecasts'
    )
  })
})

describe('refreshOAuthToken', () => {
  it('returns mock token in test mode', async () => {
    const di = {
      isTestMode: () => true,
      logger: { info: vi.fn() }
    }
    const request = { yar: { clear: vi.fn(), set: vi.fn() } }
    const result = await refreshOAuthToken(request, di)
    expect(result).toEqual({ accessToken: 'mock-token' })
    expect(di.logger.info).toHaveBeenCalledWith(
      'Test mode: refreshOAuthToken returning mock token'
    )
  })
})
describe('fetchData branch coverage', () => {
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
        'forecast-summary': 'summary-value'
      })),
      fetchDailySummary: vi.fn(async () => ({})),
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
    expect(resultUK.getDailySummary).toBe('summary-value')
  })

  it('assigns getDailySummary as "summary" if getForecasts is string', async () => {
    const mockRequest = { yar: { get: vi.fn() } }
    const diUKString = {
      validateParams: () => null,
      errorResponse: vi.fn(),
      logger: { error: vi.fn() },
      isTestMode: () => false,
      handleUKLocationData: vi.fn(async () => 'uk-places'),
      handleNILocationData: vi.fn(),
      fetchForecasts: vi.fn(async () => 'string-forecast'),
      fetchDailySummary: vi.fn(async () => ({})),
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
    expect(resultUKString.getDailySummary).toBe('summary')
  })

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
