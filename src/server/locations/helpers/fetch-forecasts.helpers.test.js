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
  it('returns dev url and opts in development', () => {
    const result = selectForecastsUrlAndOptions(
      'development',
      'prod-url',
      'dev-url',
      'forecast-path',
      'dev-opts',
      'prod-opts'
    )
    expect(result.url).toBe('dev-url/forecast-path')
    expect(result.opts).toBe('dev-opts')
  })
  it('returns prod url and opts in production', () => {
    const result = selectForecastsUrlAndOptions(
      'production',
      'prod-url',
      'dev-url',
      'forecast-path',
      'dev-opts',
      'prod-opts'
    )
    expect(result.url).toBe('prod-url')
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
