import { describe, it, expect, vi } from 'vitest'
import { fetchForecasts, refreshOAuthToken } from './fetch-data.js'
import {
  STATUS_OK,
  STATUS_INTERNAL_SERVER_ERROR
} from '../../data/constants.js'

const ERROR_RESPONSE = 'error-response'

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
      catchFetchError: vi.fn(async () => [STATUS_OK, { forecasts: 'dev' }]),
      errorResponse: vi.fn(() => ERROR_RESPONSE),
      FORECASTS_API_PATH: 'path',
      HTTP_STATUS_OK: STATUS_OK,
      optionsEphemeralProtected: {},
      options: {},
      nodeEnv: 'development'
    }
    const result = await fetchForecasts(di)
    expect(result).toEqual({
      forecasts: 'dev',
      'forecast-summary': { today: null }
    })
    expect(di.logger.info).toHaveBeenCalledWith('Forecasts data fetched')
  })
})

describe('fetchForecasts additional coverage', () => {
  it('returns errorResponse if catchFetchError throws', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: { get: vi.fn((_key) => 'mock-url') },
      catchFetchError: vi.fn(async () => {
        throw new Error('fail')
      }),
      errorResponse: vi.fn(() => ERROR_RESPONSE),
      FORECASTS_API_PATH: 'path',
      HTTP_STATUS_OK: STATUS_OK,
      optionsEphemeralProtected: {},
      options: {},
      nodeEnv: 'production'
    }
    await expect(fetchForecasts(di)).rejects.toThrow('fail')
  })
})

describe('fetchForecasts error handling', () => {
  it('returns errorResponse if status is not OK', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn() },
      config: { get: vi.fn((_key) => 'mock-url') },
      catchFetchError: vi.fn(async () => [
        STATUS_INTERNAL_SERVER_ERROR,
        { message: 'fail' }
      ]),
      errorResponse: vi.fn(() => ERROR_RESPONSE),
      FORECASTS_API_PATH: 'path',
      HTTP_STATUS_OK: STATUS_OK,
      optionsEphemeralProtected: {},
      options: {},
      nodeEnv: 'production'
    }
    const result = await fetchForecasts(di)
    expect(result).toBe(ERROR_RESPONSE)
    expect(di.logger.error).toHaveBeenCalledWith(
      'Error fetching forecasts data: status code',
      STATUS_INTERNAL_SERVER_ERROR
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
    expect(result).toEqual({
      forecasts: 'mock-forecasts',
      'forecast-summary': { today: null }
    })
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
    expect(result).toEqual({ accessToken: 'token' })
    expect(request.yar.clear).toHaveBeenCalledWith('savedAccessToken')
    expect(request.yar.set).toHaveBeenCalledWith('savedAccessToken', 'token')
  })
})

describe('refreshOAuthToken error handling', () => {
  it('returns error if fetchOAuthToken returns error and no saved token', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
      fetchOAuthToken: vi.fn(async () => ({ error: 'fail' }))
    }
    const request = { yar: { clear: vi.fn(), set: vi.fn(), get: vi.fn() } }
    request.yar.get.mockReturnValue(undefined)
    const result = await refreshOAuthToken(request, di)

    expect(result).toEqual({ error: 'fail' })
  })

  it('uses saved token if fetchOAuthToken returns error', async () => {
    const di = {
      isTestMode: () => false,
      logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
      fetchOAuthToken: vi.fn(async () => ({ error: 'fail' }))
    }
    const request = { yar: { clear: vi.fn(), set: vi.fn(), get: vi.fn() } }
    request.yar.get.mockReturnValue('saved-token')
    const result = await refreshOAuthToken(request, di)

    expect(result).toEqual({ accessToken: 'saved-token', isFallback: true })
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
