import { describe, it, expect, vi } from 'vitest'
import {
  fetchDailySummaryTestMode,
  selectDailySummaryUrlAndOptions,
  callAndHandleDailySummaryResponse
} from './fetch-data.js'

describe('fetchDailySummaryTestMode', () => {
  it('returns mock summary and logs in test mode', () => {
    const logger = { info: vi.fn() }
    const result = fetchDailySummaryTestMode(() => true, logger)
    expect(result).toEqual({ summary: 'mock-summary' })
    expect(logger.info).toHaveBeenCalledWith(
      'Test mode: fetchDailySummary returning mock summary'
    )
  })
  it('returns null if not in test mode', () => {
    const logger = { info: vi.fn() }
    const result = fetchDailySummaryTestMode(() => false, logger)
    expect(result).toBeNull()
  })
})

describe('selectDailySummaryUrlAndOptions', () => {
  it('returns dev url and opts in development', () => {
    const result = selectDailySummaryUrlAndOptions(
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
    const result = selectDailySummaryUrlAndOptions(
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

describe('callAndHandleDailySummaryResponse', () => {
  it('returns data if status is OK', async () => {
    const injectedCatchFetchError = vi.fn(async () => [200, { foo: 'bar' }])
    const injectedLogger = { info: vi.fn(), error: vi.fn() }
    const injectedErrorResponse = vi.fn()
    const result = await callAndHandleDailySummaryResponse(
      'url',
      {},
      injectedCatchFetchError,
      injectedLogger,
      injectedErrorResponse
    )
    expect(result).toEqual({ foo: 'bar' })
    expect(injectedLogger.info).toHaveBeenCalledWith(
      'Daily summary data fetched'
    )
  })
  it('returns error response and logs error if status is not OK', async () => {
    const injectedCatchFetchError = vi.fn(async () => [500, null])
    const injectedLogger = { info: vi.fn(), error: vi.fn() }
    const injectedErrorResponse = vi.fn((msg, code) => ({ error: msg, code }))
    const result = await callAndHandleDailySummaryResponse(
      'url',
      {},
      injectedCatchFetchError,
      injectedLogger,
      injectedErrorResponse
    )
    expect(result).toEqual({ error: 'Daily summary fetch failed', code: 500 })
    expect(injectedLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error fetching daily summary: status code 500')
    )
  })
})
