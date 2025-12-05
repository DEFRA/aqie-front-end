import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  callAndHandleForecastsResponse,
  callForecastsApi,
  selectForecastsUrlAndOptions,
  selectMeasurementsUrlAndOptions,
  callAndHandleMeasurementsResponse,
  buildAndCheckUKApiUrl,
  callAndHandleUKApiResponse
} from './api-utils.js'

describe('api-utils', () => {
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

  describe('callAndHandleForecastsResponse', () => {
    it('should return forecast data on successful fetch', async () => {
      const mockForecastData = { forecasts: [] }
      const mockCatchFetchError = vi
        .fn()
        .mockResolvedValue([200, mockForecastData])
      const mockErrorResponse = vi.fn()

      const result = await callAndHandleForecastsResponse(
        'http://test.com',
        {},
        mockCatchFetchError,
        200,
        mockLogger,
        mockErrorResponse
      )

      expect(result).toEqual(mockForecastData)
      expect(mockLogger.info).toHaveBeenCalledWith('Forecasts data fetched')
      expect(mockErrorResponse).not.toHaveBeenCalled()
    })

    it('should handle fetch error with non-200 status', async () => {
      const mockCatchFetchError = vi.fn().mockResolvedValue([500, null])
      const mockErrorResponse = vi.fn().mockReturnValue({ error: 'failed' })

      const result = await callAndHandleForecastsResponse(
        'http://test.com',
        {},
        mockCatchFetchError,
        200,
        mockLogger,
        mockErrorResponse
      )

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error fetching forecasts data: status code',
        500
      )
      expect(mockErrorResponse).toHaveBeenCalledWith(
        'Forecasts fetch failed',
        500
      )
      expect(result).toEqual({ error: 'failed' })
    })

    it('should handle fetch error with no status code', async () => {
      const mockCatchFetchError = vi.fn().mockResolvedValue([null, null])
      const mockErrorResponse = vi.fn().mockReturnValue({ error: 'failed' })

      await callAndHandleForecastsResponse(
        'http://test.com',
        {},
        mockCatchFetchError,
        200,
        mockLogger,
        mockErrorResponse
      )

      expect(mockErrorResponse).toHaveBeenCalledWith(
        'Forecasts fetch failed',
        500
      )
    })
  })

  describe('callForecastsApi', () => {
    it('should call forecasts API with correct parameters', async () => {
      const mockRequest = { headers: { host: 'example.com' } }
      const mockForecastData = { forecasts: [] }
      const mockCatchFetchError = vi
        .fn()
        .mockResolvedValue([200, mockForecastData])
      const mockErrorResponse = vi.fn()
      const mockOptionsEphemeralProtected = { headers: {} }
      const mockOptions = { headers: {} }

      mockConfig.get.mockReturnValue('http://api.test.com')

      const result = await callForecastsApi({
        config: mockConfig,
        optionsEphemeralProtected: mockOptionsEphemeralProtected,
        options: mockOptions,
        catchFetchError: mockCatchFetchError,
        httpStatusOk: 200,
        logger: mockLogger,
        errorResponse: mockErrorResponse,
        request: mockRequest
      })

      expect(mockConfig.get).toHaveBeenCalledWith('forecastsApiUrl')
      expect(result).toEqual(mockForecastData)
    })
  })

  describe('selectForecastsUrlAndOptions', () => {
    it('should use ephemeral protected URL for localhost requests', () => {
      const mockRequest = {
        headers: { host: 'localhost:3000' },
        app: { config: { ephemeralProtectedDevApiUrl: 'http://dev.api.com' } }
      }
      const mockOptionsEphemeralProtected = {
        headers: { 'x-api-key': 'test-key' }
      }
      const mockOptions = { headers: {} }

      const result = selectForecastsUrlAndOptions({
        request: mockRequest,
        forecastsApiUrl: 'http://prod.api.com',
        optionsEphemeralProtected: mockOptionsEphemeralProtected,
        options: mockOptions
      })

      expect(result.url).toContain('http://dev.api.com')
      expect(result.opts.headers['x-api-key']).toBe('test-key')
    })

    it('should use production URL for remote requests', () => {
      const mockRequest = {
        headers: { host: 'example.com' }
      }
      const mockOptions = { headers: {} }

      const result = selectForecastsUrlAndOptions({
        request: mockRequest,
        forecastsApiUrl: 'http://prod.api.com',
        optionsEphemeralProtected: {},
        options: mockOptions
      })

      expect(result.url).toBe('http://prod.api.com')
      expect(result.opts.headers['Content-Type']).toBe('application/json')
    })

    it('should handle 127.0.0.1 as local request', () => {
      const mockRequest = {
        headers: { host: '127.0.0.1:3000' },
        app: { config: { ephemeralProtectedDevApiUrl: 'http://dev.api.com' } }
      }
      const mockOptionsEphemeralProtected = {
        headers: { 'x-api-key': 'test-key' }
      }

      const result = selectForecastsUrlAndOptions({
        request: mockRequest,
        forecastsApiUrl: 'http://prod.api.com',
        optionsEphemeralProtected: mockOptionsEphemeralProtected,
        options: {}
      })

      expect(result.url).toContain('http://dev.api.com')
    })

    it('should handle missing request object', () => {
      const mockOptions = { headers: {} }

      const result = selectForecastsUrlAndOptions({
        request: null,
        forecastsApiUrl: 'http://prod.api.com',
        optionsEphemeralProtected: {},
        options: mockOptions
      })

      expect(result.url).toBe('http://prod.api.com')
    })

    it('should throw error when ephemeralProtectedDevApiUrl missing for local', () => {
      const mockRequest = {
        headers: { host: 'localhost:3000' },
        app: { config: {} }
      }

      expect(() =>
        selectForecastsUrlAndOptions({
          request: mockRequest,
          forecastsApiUrl: 'http://prod.api.com',
          optionsEphemeralProtected: {},
          options: {}
        })
      ).toThrow(
        'ephemeralProtectedDevApiUrl must be provided in config for local requests'
      )
    })
  })

  describe('selectMeasurementsUrlAndOptions', () => {
    it('should build new Ricardo measurements URL when feature enabled', () => {
      mockConfig.get.mockReturnValue('http://ricardo.api.com')
      const mockOptionsEphemeralProtected = { headers: {} }
      const mockOptions = { headers: {} }
      const mockRequest = { headers: { host: 'example.com' } }

      const result = selectMeasurementsUrlAndOptions(51.5074, -0.1278, true, {
        config: mockConfig,
        logger: mockLogger,
        optionsEphemeralProtected: mockOptionsEphemeralProtected,
        options: mockOptions,
        request: mockRequest
      })

      expect(result.url).toContain('ricardo.api.com')
      expect(result.url).toContain('latitude=51.507400')
      expect(result.url).toContain('longitude=-0.127800')
      expect(result.url).toContain('page=1')
      expect(result.url).toContain('latest-measurement=true')
      expect(mockLogger.info).toHaveBeenCalled()
    })

    it('should use old measurements API when feature disabled', () => {
      mockConfig.get.mockReturnValue('http://old.measurements.api.com')
      const mockOptions = { headers: {} }

      const result = selectMeasurementsUrlAndOptions(51.5074, -0.1278, false, {
        config: mockConfig,
        logger: mockLogger,
        optionsEphemeralProtected: {},
        options: mockOptions,
        request: {}
      })

      expect(result.url).toBe('http://old.measurements.api.com')
      expect(result.opts.headers['Content-Type']).toBe('application/json')
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Old measurements API URL: http://old.measurements.api.com'
      )
    })

    it('should format coordinates to 6 decimal places', () => {
      mockConfig.get.mockReturnValue('http://ricardo.api.com')
      const mockOptions = { headers: {} }
      const mockRequest = { headers: { host: 'example.com' } }

      const result = selectMeasurementsUrlAndOptions(
        51.50741234567,
        -0.12781234567,
        true,
        {
          config: mockConfig,
          logger: mockLogger,
          optionsEphemeralProtected: {},
          options: mockOptions,
          request: mockRequest
        }
      )

      expect(result.url).toContain('latitude=51.507412')
      expect(result.url).toContain('longitude=-0.127812')
    })

    it('should use ephemeral protected URL for localhost with new Ricardo', () => {
      mockConfig.get
        .mockReturnValueOnce('http://ricardo.api.com')
        .mockReturnValueOnce('http://dev.api.com')
      const mockOptionsEphemeralProtected = { headers: {} }
      const mockRequest = { headers: { host: 'localhost:3000' } }

      const result = selectMeasurementsUrlAndOptions(51.5074, -0.1278, true, {
        config: mockConfig,
        logger: mockLogger,
        optionsEphemeralProtected: mockOptionsEphemeralProtected,
        options: {},
        request: mockRequest
      })

      expect(result.url).toContain('http://dev.api.com')
      expect(result.opts).toBe(mockOptionsEphemeralProtected)
    })

    it('should throw error when URLSearchParams not available', () => {
      const originalURLSearchParams = global.URLSearchParams
      global.URLSearchParams = undefined

      expect(() =>
        selectMeasurementsUrlAndOptions(51.5074, -0.1278, true, {
          config: mockConfig,
          logger: mockLogger,
          optionsEphemeralProtected: {},
          options: {},
          request: {}
        })
      ).toThrow('URLSearchParams is not available in this environment')

      global.URLSearchParams = originalURLSearchParams
    })

    it('should throw error when ephemeralProtectedDevApiUrl missing for local new Ricardo', () => {
      mockConfig.get
        .mockReturnValueOnce('http://ricardo.api.com')
        .mockReturnValueOnce(null)
      const mockRequest = { headers: { host: 'localhost:3000' } }

      expect(() =>
        selectMeasurementsUrlAndOptions(51.5074, -0.1278, true, {
          config: mockConfig,
          logger: mockLogger,
          optionsEphemeralProtected: {},
          options: {},
          request: mockRequest
        })
      ).toThrow(
        'ephemeralProtectedDevApiUrl must be provided in config for local requests'
      )
    })
  })

  describe('callAndHandleMeasurementsResponse', () => {
    it('should return data on successful fetch', async () => {
      const mockData = [{ site: 'test' }]
      const mockCatchFetchError = vi.fn().mockResolvedValue([200, mockData])

      const result = await callAndHandleMeasurementsResponse(
        'http://test.com',
        {},
        mockCatchFetchError,
        mockLogger
      )

      expect(result).toEqual(mockData)
      expect(mockLogger.info).toHaveBeenCalledWith('Data fetched successfully.')
    })

    it('should return empty array on error', async () => {
      const mockCatchFetchError = vi
        .fn()
        .mockResolvedValue([500, { message: 'Server error' }])

      const result = await callAndHandleMeasurementsResponse(
        'http://test.com',
        {},
        mockCatchFetchError,
        mockLogger
      )

      expect(result).toEqual([])
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error fetching data: Server error'
      )
    })

    it('should handle null data response', async () => {
      const mockCatchFetchError = vi.fn().mockResolvedValue([200, null])

      const result = await callAndHandleMeasurementsResponse(
        'http://test.com',
        {},
        mockCatchFetchError,
        mockLogger
      )

      expect(result).toEqual([])
    })
  })

  describe('buildAndCheckUKApiUrl', () => {
    it('should build UK API URL with all parameters', () => {
      const mockInjected = {
        buildUKLocationFilters: vi.fn().mockReturnValue('filters'),
        config: {
          get: vi
            .fn()
            .mockReturnValueOnce('http://osnames.api.com')
            .mockReturnValueOnce('test-api-key')
        },
        combineUKSearchTerms: vi.fn().mockReturnValue('combined search'),
        isValidFullPostcodeUK: vi.fn(),
        isValidPartialPostcodeUK: vi.fn(),
        buildUKApiUrl: vi
          .fn()
          .mockReturnValue('http://osnames.api.com?q=combined+search')
      }

      const result = buildAndCheckUKApiUrl(
        'London',
        'SW1A',
        '1AA',
        mockInjected
      )

      expect(result.osNamesApiUrlFull).toBe(
        'http://osnames.api.com?q=combined+search'
      )
      expect(result.hasOsKey).toBe(true)
      expect(result.combinedLocation).toBe('combined search')
      expect(mockInjected.buildUKLocationFilters).toHaveBeenCalled()
      expect(mockInjected.combineUKSearchTerms).toHaveBeenCalledWith(
        'London',
        'SW1A',
        '1AA',
        mockInjected.isValidFullPostcodeUK,
        mockInjected.isValidPartialPostcodeUK
      )
    })

    it('should handle missing API key', () => {
      const mockInjected = {
        buildUKLocationFilters: vi.fn().mockReturnValue('filters'),
        config: {
          get: vi
            .fn()
            .mockReturnValueOnce('http://osnames.api.com')
            .mockReturnValueOnce('')
        },
        combineUKSearchTerms: vi.fn().mockReturnValue('search'),
        isValidFullPostcodeUK: vi.fn(),
        isValidPartialPostcodeUK: vi.fn(),
        buildUKApiUrl: vi.fn().mockReturnValue('http://osnames.api.com')
      }

      const result = buildAndCheckUKApiUrl('London', null, null, mockInjected)

      expect(result.hasOsKey).toBe(false)
    })

    it('should handle whitespace-only API key', () => {
      const mockInjected = {
        buildUKLocationFilters: vi.fn().mockReturnValue('filters'),
        config: {
          get: vi
            .fn()
            .mockReturnValueOnce('http://osnames.api.com')
            .mockReturnValueOnce('   ')
        },
        combineUKSearchTerms: vi.fn().mockReturnValue('search'),
        isValidFullPostcodeUK: vi.fn(),
        isValidPartialPostcodeUK: vi.fn(),
        buildUKApiUrl: vi.fn().mockReturnValue('http://osnames.api.com')
      }

      const result = buildAndCheckUKApiUrl('London', null, null, mockInjected)

      expect(result.hasOsKey).toBe(false)
    })
  })

  describe('callAndHandleUKApiResponse', () => {
    it('should return formatted data on successful UK API call', async () => {
      const mockFormattedData = { results: [] }
      const mockCatchProxyFetchError = vi
        .fn()
        .mockResolvedValue([200, { data: 'raw' }])
      const mockFormatUKApiResponse = vi.fn().mockReturnValue(mockFormattedData)
      const mockOptions = { headers: {} }

      const result = await callAndHandleUKApiResponse(
        'http://osnames.api.com',
        mockOptions,
        {},
        true,
        mockCatchProxyFetchError,
        200,
        mockLogger,
        mockFormatUKApiResponse
      )

      expect(result).toEqual(mockFormattedData)
      expect(mockLogger.info).toHaveBeenCalledWith('getOSPlaces data fetched:')
      expect(mockFormatUKApiResponse).toHaveBeenCalledWith({ data: 'raw' })
    })

    it('should use ephemeral protected options for localhost URLs', async () => {
      const mockCatchProxyFetchError = vi
        .fn()
        .mockResolvedValue([200, { data: 'raw' }])
      const mockFormatUKApiResponse = vi.fn().mockReturnValue({})
      const mockOptionsEphemeralProtected = {
        headers: { 'x-api-key': 'dev-key' }
      }
      const mockOptions = { headers: {} }

      await callAndHandleUKApiResponse(
        'http://localhost:3000/api',
        mockOptions,
        mockOptionsEphemeralProtected,
        true,
        mockCatchProxyFetchError,
        200,
        mockLogger,
        mockFormatUKApiResponse
      )

      expect(mockCatchProxyFetchError).toHaveBeenCalledWith(
        'http://localhost:3000/api',
        mockOptionsEphemeralProtected,
        true
      )
    })

    it('should handle 401 unauthorized error', async () => {
      const mockCatchProxyFetchError = vi.fn().mockResolvedValue([401, null])
      const mockFormatUKApiResponse = vi.fn()

      const result = await callAndHandleUKApiResponse(
        'http://osnames.api.com',
        {},
        {},
        true,
        mockCatchProxyFetchError,
        200,
        mockLogger,
        mockFormatUKApiResponse
      )

      expect(result).toBeNull()
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('OS Names API returned 401')
      )
    })

    it('should handle other error status codes', async () => {
      const mockCatchProxyFetchError = vi.fn().mockResolvedValue([500, null])
      const mockFormatUKApiResponse = vi.fn()

      const result = await callAndHandleUKApiResponse(
        'http://osnames.api.com',
        {},
        {},
        true,
        mockCatchProxyFetchError,
        200,
        mockLogger,
        mockFormatUKApiResponse
      )

      expect(result).toBeNull()
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error fetching statusCodeOSPlace data:',
        500
      )
    })

    it('should use regular options for remote URLs', async () => {
      const mockCatchProxyFetchError = vi
        .fn()
        .mockResolvedValue([200, { data: 'raw' }])
      const mockFormatUKApiResponse = vi.fn().mockReturnValue({})
      const mockOptions = { headers: { auth: 'token' } }
      const mockOptionsEphemeralProtected = {
        headers: { 'x-api-key': 'dev-key' }
      }

      await callAndHandleUKApiResponse(
        'http://osnames.api.com',
        mockOptions,
        mockOptionsEphemeralProtected,
        true,
        mockCatchProxyFetchError,
        200,
        mockLogger,
        mockFormatUKApiResponse
      )

      expect(mockCatchProxyFetchError).toHaveBeenCalledWith(
        'http://osnames.api.com',
        mockOptions,
        true
      )
    })
  })
})
