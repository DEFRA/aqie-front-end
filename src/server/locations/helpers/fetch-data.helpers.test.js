import {
  handleTestModeFetchData,
  buildNIOptionsOAuth,
  fetchForecastsAndSummary,
  handleUKLocationDataTestMode,
  buildAndCheckUKApiUrl,
  callAndHandleUKApiResponse
} from './fetch-data.js'
import { describe, it, expect, vi } from 'vitest'

describe('handleTestModeFetchData', () => {
  it('returns UK places in test mode', () => {
    const injectedHandleUKLocationData = vi.fn(() => 'ukPlaces')
    const injectedHandleNILocationData = vi.fn()
    const injectedLogger = { error: vi.fn() }
    const injectedErrorResponse = vi.fn((msg, code) => ({ msg, code }))
    const result = handleTestModeFetchData({
      locationType: 'UK',
      userLocation: 'loc',
      searchTerms: 'search',
      secondSearchTerm: 'second',
      optionsOAuth: {},
      getDailySummary: 'summary',
      getForecasts: 'forecasts',
      injectedHandleUKLocationData,
      injectedHandleNILocationData,
      injectedLogger,
      injectedErrorResponse,
      args: {}
    })
    expect(result).toEqual({
      getDailySummary: 'summary',
      getForecasts: 'summary',
      getOSPlaces: { results: ['ukPlaces'] }
    })
  })
  it('returns NI places in test mode', () => {
    const injectedHandleUKLocationData = vi.fn()
    const injectedHandleNILocationData = vi.fn(() => 'niPlaces')
    const injectedLogger = { error: vi.fn() }
    const injectedErrorResponse = vi.fn((msg, code) => ({ msg, code }))
    const result = handleTestModeFetchData({
      locationType: 'NI',
      userLocation: 'loc',
      searchTerms: 'search',
      secondSearchTerm: 'second',
      optionsOAuth: {},
      getDailySummary: 'summary',
      getForecasts: 'forecasts',
      injectedHandleUKLocationData,
      injectedHandleNILocationData,
      injectedLogger,
      injectedErrorResponse,
      args: {}
    })
    expect(result).toEqual({
      getDailySummary: 'summary',
      getForecasts: { 'forecast-summary': 'summary' },
      getNIPlaces: 'niPlaces'
    })
  })
  it('returns error for unsupported location type', () => {
    const injectedHandleUKLocationData = vi.fn()
    const injectedHandleNILocationData = vi.fn()
    const injectedLogger = { error: vi.fn() }
    const injectedErrorResponse = vi.fn((msg, code) => ({ msg, code }))
    const result = handleTestModeFetchData({
      locationType: 'OTHER',
      userLocation: 'loc',
      searchTerms: 'search',
      secondSearchTerm: 'second',
      optionsOAuth: {},
      getDailySummary: 'summary',
      getForecasts: 'forecasts',
      injectedHandleUKLocationData,
      injectedHandleNILocationData,
      injectedLogger,
      injectedErrorResponse,
      args: {}
    })
    expect(result).toEqual({
      msg: 'Unsupported location type provided',
      code: 400
    })
    expect(injectedLogger.error).toHaveBeenCalledWith(
      'Unsupported location type provided:',
      'OTHER'
    )
  })
})

describe('buildNIOptionsOAuth', () => {
  it('returns optionsOAuth and accessToken if not mock', async () => {
    const request = { yar: { get: vi.fn(() => 'token') } }
    const injectedIsMockEnabled = false
    const injectedRefreshOAuthToken = vi.fn()
    const result = await buildNIOptionsOAuth({
      request,
      injectedIsMockEnabled,
      injectedRefreshOAuthToken
    })
    expect(result.optionsOAuth).toBeDefined()
    expect(result.accessToken).toBe('token')
  })
  it('calls refreshOAuthToken if no saved token', async () => {
    const request = { yar: { get: vi.fn(() => null) } }
    const injectedIsMockEnabled = false
    const injectedRefreshOAuthToken = vi.fn(() => 'newtoken')
    const result = await buildNIOptionsOAuth({
      request,
      injectedIsMockEnabled,
      injectedRefreshOAuthToken
    })
    expect(result.accessToken).toBe('newtoken')
  })
  it('returns undefined if mock enabled', async () => {
    const request = { yar: { get: vi.fn() } }
    const injectedIsMockEnabled = true
    const injectedRefreshOAuthToken = vi.fn()
    const result = await buildNIOptionsOAuth({
      request,
      injectedIsMockEnabled,
      injectedRefreshOAuthToken
    })
    expect(result.optionsOAuth).toBeUndefined()
    expect(result.accessToken).toBeUndefined()
  })
})

describe('fetchForecastsAndSummary', () => {
  it('returns forecasts and summary from object', async () => {
    const injectedFetchForecasts = vi.fn(() => ({
      'forecast-summary': 'sum',
      foo: 'bar'
    }))
    const result = await fetchForecastsAndSummary({
      injectedFetchForecasts,
      args: {}
    })
    expect(result.getForecasts).toEqual({
      'forecast-summary': 'sum',
      foo: 'bar'
    })
    expect(result.getDailySummary).toBe('sum')
  })
  it('returns summary string if forecasts is string', async () => {
    const injectedFetchForecasts = vi.fn(() => 'somestring')
    const result = await fetchForecastsAndSummary({
      injectedFetchForecasts,
      args: {}
    })
    expect(result.getForecasts).toBe('somestring')
    expect(result.getDailySummary).toBe('summary')
  })
  it('returns null summary if forecasts is null', async () => {
    const injectedFetchForecasts = vi.fn(() => null)
    const result = await fetchForecastsAndSummary({
      injectedFetchForecasts,
      args: {}
    })
    expect(result.getForecasts).toBeNull()
    expect(result.getDailySummary).toBeNull()
  })
})

// Helper for mock injected dependencies
const mockInjected = {
  buildUKLocationFilters: vi.fn(() => 'filters'),
  config: {
    get: vi.fn((key) =>
      key === 'osNamesApiUrl' ? 'url' : key === 'osNamesApiKey' ? 'key' : ''
    )
  },
  combineUKSearchTerms: vi.fn((a, b, c) => 'combined'),
  isValidFullPostcodeUK: vi.fn(),
  isValidPartialPostcodeUK: vi.fn(),
  buildUKApiUrl: vi.fn(() => 'full-url')
}

describe('handleUKLocationDataTestMode', () => {
  it('returns mock data and logs in test mode', () => {
    const logger = { info: vi.fn() }
    const result = handleUKLocationDataTestMode(() => true, logger)
    expect(result).toEqual({ results: ['ukData'] })
    expect(logger.info).toHaveBeenCalledWith(
      'Test mode: handleUKLocationData returning mock data'
    )
  })
  it('returns null if not in test mode', () => {
    const logger = { info: vi.fn() }
    const result = handleUKLocationDataTestMode(() => false, logger)
    expect(result).toBeNull()
  })
})

describe('buildAndCheckUKApiUrl', () => {
  it('returns correct url, key, and combined location', () => {
    const result = buildAndCheckUKApiUrl(
      'loc',
      'search',
      'second',
      mockInjected
    )
    expect(result.osNamesApiUrlFull).toBe('full-url')
    expect(result.hasOsKey).toBe(true)
    expect(result.combinedLocation).toBe('combined')
  })
  it('returns hasOsKey false if key is missing', () => {
    const injected = { ...mockInjected, config: { get: vi.fn(() => '') } }
    const result = buildAndCheckUKApiUrl('loc', 'search', 'second', injected)
    expect(result.hasOsKey).toBe(false)
  })
})

describe('callAndHandleUKApiResponse', () => {
  it('returns formatted response if status is OK', async () => {
    const injectedCatchProxyFetchError = vi.fn(async () => [
      200,
      { foo: 'bar' }
    ])
    const injectedLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    const injectedFormatUKApiResponse = vi.fn((data) => ({ formatted: data }))
    const result = await callAndHandleUKApiResponse(
      'url',
      {},
      true,
      injectedCatchProxyFetchError,
      200,
      injectedLogger,
      injectedFormatUKApiResponse
    )
    expect(result).toEqual({ formatted: { foo: 'bar' } })
    expect(injectedLogger.info).toHaveBeenCalledWith(
      'getOSPlaces data fetched:'
    )
  })
  it('returns null and warns if status is 401', async () => {
    const injectedCatchProxyFetchError = vi.fn(async () => [401, null])
    const injectedLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    const injectedFormatUKApiResponse = vi.fn()
    const result = await callAndHandleUKApiResponse(
      'url',
      {},
      true,
      injectedCatchProxyFetchError,
      200,
      injectedLogger,
      injectedFormatUKApiResponse
    )
    expect(result).toBeNull()
    expect(injectedLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('OS Names API returned 401')
    )
  })
  it('returns null and logs error for other status', async () => {
    const injectedCatchProxyFetchError = vi.fn(async () => [500, null])
    const injectedLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    const injectedFormatUKApiResponse = vi.fn()
    const result = await callAndHandleUKApiResponse(
      'url',
      {},
      true,
      injectedCatchProxyFetchError,
      200,
      injectedLogger,
      injectedFormatUKApiResponse
    )
    expect(result).toBeNull()
    expect(injectedLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error fetching statusCodeOSPlace data: 500')
    )
  })
})
