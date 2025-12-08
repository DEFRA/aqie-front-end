import { describe, it, expect, vi } from 'vitest'
import { callAndHandleForecastsResponse } from './extracted/api-utils.js'

const STATUS_OK = 200
const STATUS_INTERNAL_SERVER_ERROR = 500

describe('callAndHandleForecastsResponse', () => {
  it('returns forecasts if status is OK', async () => {
    const injectedCatchFetchError = vi.fn(async () => [
      STATUS_OK,
      { foo: 'bar' }
    ])
    const injectedLogger = { info: vi.fn(), error: vi.fn() }
    const injectedErrorResponse = vi.fn()
    const result = await callAndHandleForecastsResponse(
      'url',
      {},
      injectedCatchFetchError,
      STATUS_OK,
      injectedLogger,
      injectedErrorResponse
    )
    expect(result).toEqual({ foo: 'bar' })
    expect(injectedLogger.info).toHaveBeenCalledWith('Forecasts data fetched')
  })
  it('returns error response and logs error if status is not OK', async () => {
    const injectedCatchFetchError = vi.fn(async () => [
      STATUS_INTERNAL_SERVER_ERROR,
      null
    ])
    const injectedLogger = { info: vi.fn(), error: vi.fn() }
    const injectedErrorResponse = vi.fn((msg, code) => ({ error: msg, code }))
    const result = await callAndHandleForecastsResponse(
      'url',
      {},
      injectedCatchFetchError,
      STATUS_OK,
      injectedLogger,
      injectedErrorResponse
    )
    expect(result).toEqual({
      error: 'Forecasts fetch failed',
      code: STATUS_INTERNAL_SERVER_ERROR
    })
    expect(injectedLogger.error).toHaveBeenCalledWith(
      'Error fetching forecasts data: status code',
      STATUS_INTERNAL_SERVER_ERROR
    )
  })
})
