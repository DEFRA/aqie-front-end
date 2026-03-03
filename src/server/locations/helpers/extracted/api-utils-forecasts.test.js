import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  callAndHandleForecastsResponse,
  callForecastsApi,
  selectForecastsUrlAndOptions
} from './api-utils.js'
import {
  STATUS_OK,
  STATUS_INTERNAL_SERVER_ERROR
} from '../../../data/constants.js'

// Test constants
const TEST_URL = 'http://test.com'
const TEST_HOST = 'example.com'
const LOCALHOST_HOST = 'localhost:3000'
const DEV_API_URL = 'https://dev.api.com'
const PROD_API_URL = 'https://prod.api.com'

describe('api-utils - callAndHandleForecastsResponse', () => {
  let mockLogger

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn()
    }
  })

  it('should return forecast data on successful fetch', async () => {
    const mockForecastData = { forecasts: [] }
    const mockCatchFetchError = vi
      .fn()
      .mockResolvedValue([STATUS_OK, mockForecastData])
    const mockErrorResponse = vi.fn()

    const result = await callAndHandleForecastsResponse(
      TEST_URL,
      {},
      mockCatchFetchError,
      STATUS_OK,
      mockLogger,
      mockErrorResponse
    )

    expect(result).toEqual(mockForecastData)
    expect(mockLogger.info).toHaveBeenCalledWith('Forecasts data fetched')
    expect(mockErrorResponse).not.toHaveBeenCalled()
  })

  it('should handle fetch error with non-200 status', async () => {
    const mockCatchFetchError = vi
      .fn()
      .mockResolvedValue([STATUS_INTERNAL_SERVER_ERROR, null])
    const mockErrorResponse = vi.fn().mockReturnValue({ error: 'failed' })

    const result = await callAndHandleForecastsResponse(
      TEST_URL,
      {},
      mockCatchFetchError,
      STATUS_OK,
      mockLogger,
      mockErrorResponse
    )

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error fetching forecasts data: status code',
      STATUS_INTERNAL_SERVER_ERROR
    )
    expect(mockErrorResponse).toHaveBeenCalledWith(
      'Forecasts fetch failed',
      STATUS_INTERNAL_SERVER_ERROR
    )
    expect(result).toEqual({ error: 'failed' })
  })

  it('should handle fetch error with no status code', async () => {
    const mockCatchFetchError = vi.fn().mockResolvedValue([null, null])
    const mockErrorResponse = vi.fn().mockReturnValue({ error: 'failed' })

    await callAndHandleForecastsResponse(
      TEST_URL,
      {},
      mockCatchFetchError,
      STATUS_OK,
      mockLogger,
      mockErrorResponse
    )

    expect(mockErrorResponse).toHaveBeenCalledWith(
      'Forecasts fetch failed',
      STATUS_INTERNAL_SERVER_ERROR
    )
  })
})

describe('api-utils - callForecastsApi', () => {
  let mockLogger
  let mockConfig

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn()
    }
    mockConfig = {
      get: vi.fn()
    }
  })

  it('should call forecasts API with correct parameters', async () => {
    const mockRequest = { headers: { host: TEST_HOST } }
    const mockForecastData = { forecasts: [] }
    const mockCatchFetchError = vi
      .fn()
      .mockResolvedValue([STATUS_OK, mockForecastData])
    const mockErrorResponse = vi.fn()
    const mockOptionsEphemeralProtected = { headers: {} }
    const mockOptions = { headers: {} }

    mockConfig.get.mockReturnValue('http://api.test.com')

    const result = await callForecastsApi({
      config: mockConfig,
      optionsEphemeralProtected: mockOptionsEphemeralProtected,
      options: mockOptions,
      catchFetchError: mockCatchFetchError,
      httpStatusOk: STATUS_OK,
      logger: mockLogger,
      errorResponse: mockErrorResponse,
      request: mockRequest
    })

    expect(mockConfig.get).toHaveBeenCalledWith('forecastsApiUrl')
    expect(result).toEqual(mockForecastData)
  })
})

describe('api-utils - selectForecastsUrlAndOptions localhost', () => {
  it('should use ephemeral protected URL for localhost requests', () => {
    const mockRequest = {
      headers: { host: LOCALHOST_HOST },
      app: { config: { ephemeralProtectedDevApiUrl: DEV_API_URL } }
    }
    const mockOptionsEphemeralProtected = {
      headers: { 'x-api-key': 'test-key' }
    }
    const mockOptions = { headers: {} }

    const result = selectForecastsUrlAndOptions({
      request: mockRequest,
      forecastsApiUrl: PROD_API_URL,
      optionsEphemeralProtected: mockOptionsEphemeralProtected,
      options: mockOptions
    })

    expect(result.url).toContain(DEV_API_URL)
    expect(result.opts.headers['x-api-key']).toBe('test-key')
  })

  it('should use production URL for remote requests', () => {
    const mockRequest = {
      headers: { host: TEST_HOST }
    }
    const mockOptions = { headers: {} }

    const result = selectForecastsUrlAndOptions({
      request: mockRequest,
      forecastsApiUrl: PROD_API_URL,
      optionsEphemeralProtected: {},
      options: mockOptions
    })

    expect(result.url).toBe(PROD_API_URL)
    expect(result.opts.headers['Content-Type']).toBe('application/json')
  })

  it('should handle 127.0.0.1 as local request', () => {
    const mockRequest = {
      headers: { host: '127.0.0.1:3000' },
      app: { config: { ephemeralProtectedDevApiUrl: DEV_API_URL } }
    }
    const mockOptionsEphemeralProtected = {
      headers: { 'x-api-key': 'test-key' }
    }

    const result = selectForecastsUrlAndOptions({
      request: mockRequest,
      forecastsApiUrl: PROD_API_URL,
      optionsEphemeralProtected: mockOptionsEphemeralProtected,
      options: {}
    })

    expect(result.url).toContain(DEV_API_URL)
  })
})

describe('api-utils - selectForecastsUrlAndOptions edge cases', () => {
  it('should handle missing request object', () => {
    const mockOptions = { headers: {} }

    const result = selectForecastsUrlAndOptions({
      request: null,
      forecastsApiUrl: PROD_API_URL,
      optionsEphemeralProtected: {},
      options: mockOptions
    })

    expect(result.url).toBe(PROD_API_URL)
  })

  it('should throw error when ephemeralProtectedDevApiUrl missing for local', () => {
    const mockRequest = {
      headers: { host: LOCALHOST_HOST },
      app: { config: {} }
    }

    expect(() =>
      selectForecastsUrlAndOptions({
        request: mockRequest,
        forecastsApiUrl: PROD_API_URL,
        optionsEphemeralProtected: {},
        options: {}
      })
    ).toThrow(
      'ephemeralProtectedDevApiUrl must be provided in config for local requests'
    )
  })
})
