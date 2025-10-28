import { describe, it, expect, vi } from 'vitest'
import {
  fetchForecastsTestMode,
  selectForecastsUrlAndOptions,
  callAndHandleForecastsResponse
} from './fetch-data.js'

describe('fetchForecastsTestMode', () => {
  it('returns mock forecasts and logs in test mode', () => {
    const logger = { info: vi.fn() }
    const result = fetchForecastsTestMode(() => true, logger)
    expect(result).toEqual({ forecasts: 'mock-forecasts' })
    expect(logger.info).toHaveBeenCalledWith(
      'Test mode: fetchForecasts returning mock forecasts'
    )
  })
  it('returns null if not in test mode', () => {
    const logger = { info: vi.fn() }
    const result = fetchForecastsTestMode(() => false, logger)
    expect(result).toBeNull()
  })
})

describe('selectForecastsUrlAndOptions', () => {
  // ''
  it('returns optsEphemeralProtected if request host is localhost', () => {
    const result = selectForecastsUrlAndOptions({
      request: { headers: { host: 'localhost:3000' } },
      forecastsApiUrl: 'http://localhost:3000/api',
      optionsEphemeralProtected: 'dev-opts',
      options: 'prod-opts'
    })
    expect(result.url).toBe('http://localhost:3000/api')
    expect(result.opts).toBe('dev-opts')
  })
  it('returns optsEphemeralProtected if request host is 127.0.0.1', () => {
    const result = selectForecastsUrlAndOptions({
      request: { headers: { host: '127.0.0.1:4000' } },
      forecastsApiUrl: 'http://127.0.0.1:4000/api',
      optionsEphemeralProtected: 'dev-opts',
      options: 'prod-opts'
    })
    expect(result.url).toBe('http://127.0.0.1:4000/api')
    expect(result.opts).toBe('dev-opts')
  })
  it('returns opts if request host is not local', () => {
    const result = selectForecastsUrlAndOptions({
      request: { headers: { host: 'api.defra.gov.uk' } },
      forecastsApiUrl: 'https://api.defra.gov.uk/api',
      optionsEphemeralProtected: 'dev-opts',
      options: 'prod-opts'
    })
    expect(result.url).toBe('https://api.defra.gov.uk/api')
    expect(result.opts).toBe('prod-opts')
  })
  it('falls back to URL-based detection if request is missing', () => {
    const result = selectForecastsUrlAndOptions({
      request: undefined,
      forecastsApiUrl: 'http://localhost:3000/api',
      optionsEphemeralProtected: 'dev-opts',
      options: 'prod-opts'
    })
    expect(result.url).toBe('http://localhost:3000/api')
    expect(result.opts).toBe('dev-opts')
  })
  it('falls back to opts if neither request nor url is local', () => {
    const result = selectForecastsUrlAndOptions({
      request: undefined,
      forecastsApiUrl: 'https://api.defra.gov.uk/api',
      optionsEphemeralProtected: 'dev-opts',
      options: 'prod-opts'
    })
    expect(result.url).toBe('https://api.defra.gov.uk/api')
    expect(result.opts).toBe('prod-opts')
  })
})

describe('callAndHandleForecastsResponse', () => {
  it('returns forecasts if status is OK', async () => {
    const injectedCatchFetchError = vi.fn(async () => [200, { foo: 'bar' }])
    const injectedLogger = { info: vi.fn(), error: vi.fn() }
    const injectedErrorResponse = vi.fn()
    const result = await callAndHandleForecastsResponse(
      'url',
      {},
      injectedCatchFetchError,
      200,
      injectedLogger,
      injectedErrorResponse
    )
    expect(result).toEqual({ foo: 'bar' })
    expect(injectedLogger.info).toHaveBeenCalledWith('Forecasts data fetched')
  })
  it('returns error response and logs error if status is not OK', async () => {
    const injectedCatchFetchError = vi.fn(async () => [500, null])
    const injectedLogger = { info: vi.fn(), error: vi.fn() }
    const injectedErrorResponse = vi.fn((msg, code) => ({ error: msg, code }))
    const result = await callAndHandleForecastsResponse(
      'url',
      {},
      injectedCatchFetchError,
      200,
      injectedLogger,
      injectedErrorResponse
    )
    expect(result).toEqual({ error: 'Forecasts fetch failed', code: 500 })
    expect(injectedLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error fetching forecasts data: status code 500')
    )
  })
})
