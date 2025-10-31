import { describe, it, expect, vi } from 'vitest'
import { callAndHandleForecastsResponse } from './extracted/api-utils.js'

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
      'Error fetching forecasts data: status code',
      500
    )
  })
})
