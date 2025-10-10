// ''
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchData, fetchMeasurements } from './fetch-data.js'

// Mock all dependencies
vi.mock('../../../config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      const mockConfig = {
        clientIdNIreland: 'test-client-id',
        clientSecretNIreland: 'test-client-secret',
        redirectUriNIreland: 'http://test-redirect.com',
        scopeNIreland: 'test-scope',
        oauthTokenUrlNIreland: 'https://test-oauth.com',
        enabledMock: false,
        oauthTokenNorthernIrelandTenantId: 'test-tenant-id',
        osNamesApiUrl: 'https://test-os-names.com/search?query=',
        osNamesApiKey: 'test-os-key',
        osPlacesApiPostcodeNorthernIrelandUrl:
          'https://test-ni-places.com/postcode/',
        mockOsPlacesApiPostcodeNorthernIrelandUrl:
          'https://mock-ni-places.com/postcode/',
        forecastsApiUrl: 'https://test-forecasts.com',
        measurementsApiUrl: 'https://test-measurements.com',
        ricardoMeasurementsApiUrl: 'https://test-ricardo.com/measurements',
        forecastSummaryUrl: 'https://test-summary.com'
      }
      return mockConfig[key]
    })
  }
}))

vi.mock('../../common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  })
}))

vi.mock('../../common/helpers/catch-fetch-error.js', () => ({
  catchFetchError: vi.fn()
}))

vi.mock('../../common/helpers/catch-proxy-fetch-error.js', () => ({
  catchProxyFetchError: vi.fn()
}))

vi.mock('../../data/constants.js', () => ({
  LOCATION_TYPE_NI: 'NI',
  LOCATION_TYPE_UK: 'UK',
  SYMBOLS_ARRAY: ['!', '@', '#', '$', '%'],
  HTTP_STATUS_OK: 200,
  ROUND_OF_SIX: 6
}))

vi.mock('./convert-string.js', () => ({
  isValidFullPostcodeUK: vi.fn(),
  isValidPartialPostcodeUK: vi.fn(),
  formatNorthernIrelandPostcode: vi.fn()
}))

describe('fetch-data.js', () => {
  let mockRequest
  let mockCatchFetchError
  let mockCatchProxyFetchError
  let mockIsValidFullPostcodeUK
  let mockIsValidPartialPostcodeUK
  let mockFormatNorthernIrelandPostcode

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks()

    // Import mocked modules
    const { catchFetchError } = await import(
      '../../common/helpers/catch-fetch-error.js'
    )
    const { catchProxyFetchError } = await import(
      '../../common/helpers/catch-proxy-fetch-error.js'
    )
    const {
      isValidFullPostcodeUK,
      isValidPartialPostcodeUK,
      formatNorthernIrelandPostcode
    } = await import('./convert-string.js')

    mockCatchFetchError = catchFetchError
    mockCatchProxyFetchError = catchProxyFetchError
    mockIsValidFullPostcodeUK = isValidFullPostcodeUK
    mockIsValidPartialPostcodeUK = isValidPartialPostcodeUK
    mockFormatNorthernIrelandPostcode = formatNorthernIrelandPostcode

    // Mock request object
    mockRequest = {
      yar: {
        get: vi.fn(),
        set: vi.fn(),
        clear: vi.fn()
      }
    }

    // Default mock returns - reset for each test
    mockCatchFetchError.mockReset()
    mockCatchProxyFetchError.mockReset()
    mockIsValidFullPostcodeUK.mockReturnValue(false)
    mockIsValidPartialPostcodeUK.mockReturnValue(false)
    mockFormatNorthernIrelandPostcode.mockReturnValue('BT1 1AA')
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('fetchData', () => {
    it('should fetch UK location data successfully', async () => {
      // ''
      const mockOSPlacesData = { results: [{ name: 'London' }] }
      const mockForecastsData = { forecasts: 'data' }
      const mockSummaryData = { summary: 'data' }

      mockCatchFetchError.mockResolvedValue([null, mockForecastsData])
      mockCatchProxyFetchError
        .mockResolvedValueOnce([200, mockSummaryData]) // Daily summary (called first)
        .mockResolvedValueOnce([200, mockOSPlacesData]) // OS Places (called second)

      const result = await fetchData(mockRequest, {
        locationType: 'UK',
        userLocation: 'London',
        searchTerms: 'London',
        secondSearchTerm: 'City'
      })

      expect(result).toEqual({
        getDailySummary: mockSummaryData,
        getForecasts: mockForecastsData,
        getOSPlaces: mockOSPlacesData
      })
    })

    it('should fetch NI location data successfully with existing token', async () => {
      // ''
      const mockNIPlacesData = { results: [{ name: 'Belfast' }] }
      const mockForecastsData = { forecasts: 'data' }
      const mockSummaryData = { summary: 'data' }

      mockRequest.yar.get.mockReturnValue('existing-token')
      mockCatchFetchError.mockResolvedValue([null, mockForecastsData])
      mockCatchProxyFetchError
        .mockResolvedValueOnce([200, mockSummaryData]) // Daily summary (first)
        .mockResolvedValueOnce([200, mockNIPlacesData]) // NI Places (second)

      const result = await fetchData(mockRequest, {
        locationType: 'NI',
        userLocation: 'BT1 1AA',
        searchTerms: 'Belfast',
        secondSearchTerm: 'City'
      })

      expect(result).toEqual({
        getDailySummary: mockSummaryData,
        getForecasts: mockForecastsData,
        getNIPlaces: mockNIPlacesData
      })
    })

    it('should fetch NI location data with OAuth token refresh', async () => {
      // ''
      const mockNIPlacesData = { results: [{ name: 'Belfast' }] }
      const mockForecastsData = { forecasts: 'data' }
      const mockSummaryData = { summary: 'data' }

      mockRequest.yar.get.mockReturnValue(null) // No existing token
      mockCatchFetchError.mockResolvedValue([null, mockForecastsData])
      mockCatchProxyFetchError
        .mockResolvedValueOnce([200, { access_token: 'new-token' }]) // OAuth token (first)
        .mockResolvedValueOnce([200, mockSummaryData]) // Daily summary (second)
        .mockResolvedValueOnce([200, mockNIPlacesData]) // NI Places (third)

      const result = await fetchData(mockRequest, {
        locationType: 'NI',
        userLocation: 'BT1 1AA',
        searchTerms: 'Belfast',
        secondSearchTerm: 'City'
      })

      expect(mockRequest.yar.clear).toHaveBeenCalledWith('savedAccessToken')
      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'savedAccessToken',
        'new-token'
      )
      expect(result).toEqual({
        getDailySummary: mockSummaryData,
        getForecasts: mockForecastsData,
        getNIPlaces: mockNIPlacesData
      })
    })

    it('should handle unsupported location type', async () => {
      // ''
      const mockForecastsData = { forecasts: 'data' }
      const mockSummaryData = { summary: 'data' }

      mockCatchFetchError.mockResolvedValue([null, mockForecastsData])
      mockCatchProxyFetchError.mockResolvedValue([200, mockSummaryData])

      const result = await fetchData(mockRequest, {
        locationType: 'INVALID',
        userLocation: 'Test',
        searchTerms: 'Test',
        secondSearchTerm: 'Location'
      })

      expect(result).toBeNull()
    })

    it('should handle UK location with no OS API key', async () => {
      // ''
      const { config } = await import('../../../config/index.js')
      config.get.mockImplementation((key) => {
        if (key === 'osNamesApiKey') return ''
        return 'test-value'
      })

      const mockForecastsData = { forecasts: 'data' }
      const mockSummaryData = { summary: 'data' }

      mockCatchFetchError.mockResolvedValue([null, mockForecastsData])
      mockCatchProxyFetchError.mockResolvedValue([200, mockSummaryData])

      const result = await fetchData(mockRequest, {
        locationType: 'UK',
        userLocation: 'London',
        searchTerms: 'London',
        secondSearchTerm: 'City'
      })

      expect(result.getOSPlaces).toEqual({ results: [] })
    })

    it('should handle UK location with valid postcode', async () => {
      // ''
      mockIsValidFullPostcodeUK.mockReturnValue(true)

      const mockOSPlacesData = { results: [{ name: 'London' }] }
      const mockForecastsData = { forecasts: 'data' }
      const mockSummaryData = { summary: 'data' }

      mockCatchFetchError.mockResolvedValue([null, mockForecastsData])
      mockCatchProxyFetchError
        .mockResolvedValueOnce([200, mockSummaryData]) // fetchDailySummary call
        .mockResolvedValueOnce([200, mockOSPlacesData]) // handleUKLocationData call

      const result = await fetchData(mockRequest, {
        locationType: 'UK',
        userLocation: 'SW1A 1AA',
        searchTerms: 'London',
        secondSearchTerm: 'City'
      })

      expect(result.getOSPlaces).toEqual(mockOSPlacesData)
    })

    it('should handle UK location with partial postcode', async () => {
      // ''
      mockIsValidFullPostcodeUK.mockReturnValue(false)
      mockIsValidPartialPostcodeUK.mockReturnValue(true)

      const mockOSPlacesData = { results: [{ name: 'London' }] }
      const mockForecastsData = { forecasts: 'data' }
      const mockSummaryData = { summary: 'data' }

      mockCatchFetchError.mockResolvedValue([null, mockForecastsData])
      mockCatchProxyFetchError
        .mockResolvedValueOnce([200, mockSummaryData]) // fetchDailySummary call
        .mockResolvedValueOnce([200, mockOSPlacesData]) // handleUKLocationData call

      const result = await fetchData(mockRequest, {
        locationType: 'UK',
        userLocation: 'SW1A',
        searchTerms: 'London',
        secondSearchTerm: 'City'
      })

      expect(result.getOSPlaces).toEqual(mockOSPlacesData)
    })

    it('should handle UK location with symbols in query', async () => {
      // ''
      const mockOSPlacesData = { results: [] }
      const mockForecastsData = { forecasts: 'data' }
      const mockSummaryData = { summary: 'data' }

      mockCatchFetchError.mockResolvedValue([null, mockForecastsData])
      mockCatchProxyFetchError
        .mockResolvedValueOnce([200, mockSummaryData]) // fetchDailySummary call
        .mockResolvedValueOnce([200, mockOSPlacesData]) // handleUKLocationData call

      const result = await fetchData(mockRequest, {
        locationType: 'UK',
        userLocation: 'London@city',
        searchTerms: 'London',
        secondSearchTerm: 'City'
      })

      expect(result.getOSPlaces).toEqual(mockOSPlacesData)
    })

    it.skip('should handle NI location in mock mode', async () => {
      // ''
      // Reset all mocks first to ensure clean state
      vi.resetAllMocks()

      const { config } = await import('../../../config/index.js')
      config.get.mockImplementation((key) => {
        const mockConfig = {
          clientIdNIreland: 'test-client-id',
          clientSecretNIreland: 'test-client-secret',
          redirectUriNIreland: 'http://test-redirect.com',
          scopeNIreland: 'test-scope',
          oauthTokenUrlNIreland: 'https://test-oauth.com',
          enabledMock: true, // This is the key difference
          oauthTokenNorthernIrelandTenantId: 'test-tenant-id',
          osNamesApiUrl: 'https://test-os-names.com/search?query=',
          osNamesApiKey: 'test-os-key',
          osPlacesApiPostcodeNorthernIrelandUrl:
            'https://test-ni-places.com/postcode/',
          mockOsPlacesApiPostcodeNorthernIrelandUrl:
            'https://mock-ni-places.com/postcode/',
          forecastsApiUrl: 'https://test-forecasts.com',
          measurementsApiUrl: 'https://test-measurements.com',
          ricardoMeasurementsApiUrl: 'https://test-ricardo.com/measurements',
          forecastSummaryUrl: 'https://test-summary.com'
        }
        return mockConfig[key]
      })

      // Re-import mocked modules after config change
      const { catchFetchError } = await import(
        '../../common/helpers/catch-fetch-error.js'
      )
      const { catchProxyFetchError } = await import(
        '../../common/helpers/catch-proxy-fetch-error.js'
      )
      await import('./convert-string.js')

      mockFormatNorthernIrelandPostcode.mockReturnValue('BT1 1AA')

      const mockNIData = { name: 'Belfast' } // Single object for mock mode
      const mockForecastsData = { forecasts: 'data' }
      const mockSummaryData = { summary: 'data' }

      catchFetchError.mockResolvedValue([null, mockForecastsData])
      catchProxyFetchError
        .mockResolvedValueOnce([200, mockSummaryData]) // fetchDailySummary call
        .mockResolvedValueOnce([200, mockNIData]) // handleNILocationData call

      const result = await fetchData(mockRequest, {
        locationType: 'NI',
        userLocation: 'BT1 1AA',
        searchTerms: 'Belfast',
        secondSearchTerm: 'City'
      })

      expect(result.getNIPlaces.results).toEqual([mockNIData])
    })

    it('should handle OAuth token fetch error', async () => {
      // ''
      mockRequest.yar.get.mockReturnValue(null)
      mockCatchProxyFetchError
        .mockResolvedValueOnce([401, { access_token: 'fake-token' }]) // OAuth token call (needs token property even if error)
        .mockResolvedValueOnce([200, { summary: 'data' }]) // fetchDailySummary call
        .mockResolvedValueOnce([200, { results: [] }]) // handleNILocationData call

      mockCatchFetchError.mockResolvedValue([null, { forecasts: 'data' }])

      const result = await fetchData(mockRequest, {
        locationType: 'NI',
        userLocation: 'BT1 1AA',
        searchTerms: 'Belfast',
        secondSearchTerm: 'City'
      })

      expect(result.getNIPlaces).toEqual({ results: [] })
    })

    it('should handle OS Places API 401 error', async () => {
      // ''
      const mockForecastsData = { forecasts: 'data' }
      const mockSummaryData = { summary: 'data' }

      mockCatchFetchError.mockResolvedValue([null, mockForecastsData])
      mockCatchProxyFetchError
        .mockResolvedValueOnce([200, mockSummaryData]) // fetchDailySummary call
        .mockResolvedValueOnce([401, null]) // handleUKLocationData call (401 error)

      const result = await fetchData(mockRequest, {
        locationType: 'UK',
        userLocation: 'London',
        searchTerms: 'London',
        secondSearchTerm: 'City'
      })

      expect(result.getOSPlaces).toEqual({ results: [] })
    })

    it('should handle OS Places API non-401 error', async () => {
      // ''
      const mockForecastsData = { forecasts: 'data' }
      const mockSummaryData = { summary: 'data' }

      mockCatchFetchError.mockResolvedValue([null, mockForecastsData])
      mockCatchProxyFetchError
        .mockResolvedValueOnce([200, mockSummaryData]) // fetchDailySummary call
        .mockResolvedValueOnce([500, null]) // handleUKLocationData call (500 error)

      const result = await fetchData(mockRequest, {
        locationType: 'UK',
        userLocation: 'London',
        searchTerms: 'London',
        secondSearchTerm: 'City'
      })

      expect(result.getOSPlaces).toBeNull()
    })

    it('should handle forecasts fetch error', async () => {
      // ''
      const mockError = new Error('Forecast fetch failed')
      const mockSummaryData = { summary: 'data' }

      mockCatchFetchError.mockResolvedValue([mockError, null])
      mockCatchProxyFetchError
        .mockResolvedValueOnce([200, mockSummaryData]) // fetchDailySummary call
        .mockResolvedValueOnce([200, { results: [] }]) // handleUKLocationData call

      const result = await fetchData(mockRequest, {
        locationType: 'UK',
        userLocation: 'London',
        searchTerms: 'London',
        secondSearchTerm: 'City'
      })

      expect(result.getForecasts).toBeNull()
    })

    it('should handle daily summary fetch error', async () => {
      // ''
      const mockForecastsData = { forecasts: 'data' }

      mockCatchFetchError.mockResolvedValue([null, mockForecastsData])
      mockCatchProxyFetchError
        .mockResolvedValueOnce([500, null]) // fetchDailySummary call (error)
        .mockResolvedValueOnce([200, { results: [] }]) // handleUKLocationData call

      const result = await fetchData(mockRequest, {
        locationType: 'UK',
        userLocation: 'London',
        searchTerms: 'London',
        secondSearchTerm: 'City'
      })

      expect(result.getDailySummary).toBeNull()
    })

    it('should handle NI location fetch error', async () => {
      // ''
      const mockForecastsData = { forecasts: 'data' }
      const mockSummaryData = { summary: 'data' }

      mockRequest.yar.get.mockReturnValue('existing-token')
      mockCatchFetchError.mockResolvedValue([null, mockForecastsData])
      mockCatchProxyFetchError
        .mockResolvedValueOnce([200, mockSummaryData]) // fetchDailySummary call
        .mockResolvedValueOnce([500, null]) // handleNILocationData call (error)

      const result = await fetchData(mockRequest, {
        locationType: 'NI',
        userLocation: 'BT1 1AA',
        searchTerms: 'Belfast',
        secondSearchTerm: 'City'
      })

      expect(result.getNIPlaces).toBeNull()
    })

    it('should construct combined search term for non-postcode UK location', async () => {
      // ''
      mockIsValidFullPostcodeUK.mockReturnValue(false)
      mockIsValidPartialPostcodeUK.mockReturnValue(false)

      const mockOSPlacesData = { results: [{ name: 'London Bridge' }] }
      const mockForecastsData = { forecasts: 'data' }
      const mockSummaryData = { summary: 'data' }

      mockCatchFetchError.mockResolvedValue([null, mockForecastsData])
      mockCatchProxyFetchError
        .mockResolvedValueOnce([200, mockSummaryData]) // fetchDailySummary call
        .mockResolvedValueOnce([200, mockOSPlacesData]) // handleUKLocationData call

      const result = await fetchData(mockRequest, {
        locationType: 'UK',
        userLocation: 'London',
        searchTerms: 'London',
        secondSearchTerm: 'Bridge'
      })

      expect(result.getOSPlaces).toEqual(mockOSPlacesData)
    })

    it('should skip search term combination when secondSearchTerm is UNDEFINED', async () => {
      // ''
      mockIsValidFullPostcodeUK.mockReturnValue(false)
      mockIsValidPartialPostcodeUK.mockReturnValue(false)

      const mockOSPlacesData = { results: [{ name: 'London' }] }
      const mockForecastsData = { forecasts: 'data' }
      const mockSummaryData = { summary: 'data' }

      mockCatchFetchError.mockResolvedValue([null, mockForecastsData])
      mockCatchProxyFetchError
        .mockResolvedValueOnce([200, mockSummaryData]) // fetchDailySummary call
        .mockResolvedValueOnce([200, mockOSPlacesData]) // handleUKLocationData call

      const result = await fetchData(mockRequest, {
        locationType: 'UK',
        userLocation: 'London',
        searchTerms: 'London',
        secondSearchTerm: 'UNDEFINED'
      })

      expect(result.getOSPlaces).toEqual(mockOSPlacesData)
    })
  })

  describe('fetchMeasurements', () => {
    it('should fetch measurements using new Ricardo API when enabled', async () => {
      // ''
      const mockMeasurementsData = [{ site: 'test', value: 10 }]
      mockCatchFetchError.mockResolvedValue([null, mockMeasurementsData])

      const result = await fetchMeasurements(51.5074, -0.1278, true)

      expect(mockCatchFetchError).toHaveBeenCalledWith(
        expect.stringContaining('latitude=51.507400&longitude=-0.127800'),
        expect.any(Object)
      )
      expect(result).toEqual(mockMeasurementsData)
    })

    it('should fetch measurements using old API when new Ricardo API is disabled', async () => {
      // ''
      const mockMeasurementsData = [{ site: 'test', value: 10 }]
      mockCatchFetchError.mockResolvedValue([null, mockMeasurementsData])

      const result = await fetchMeasurements(51.5074, -0.1278, false)

      expect(mockCatchFetchError).toHaveBeenCalledWith(
        'https://test-measurements.com',
        expect.any(Object)
      )
      expect(result).toEqual(mockMeasurementsData)
    })

    it('should handle fetchMeasurements API error', async () => {
      // ''
      const mockError = new Error('Measurements fetch failed')
      mockCatchFetchError.mockResolvedValue([mockError, null])

      const result = await fetchMeasurements(51.5074, -0.1278, true)

      expect(result).toEqual([])
    })

    it('should handle fetchMeasurements unexpected error', async () => {
      // ''
      mockCatchFetchError.mockRejectedValue(new Error('Unexpected error'))

      const result = await fetchMeasurements(51.5074, -0.1278, true)

      expect(result).toEqual([])
    })

    it('should handle null measurements data', async () => {
      // ''
      mockCatchFetchError.mockResolvedValue([null, null])

      const result = await fetchMeasurements(51.5074, -0.1278, true)

      expect(result).toEqual([])
    })

    it('should format coordinates to 6 decimal places', async () => {
      // ''
      const mockMeasurementsData = [{ site: 'test', value: 10 }]
      mockCatchFetchError.mockResolvedValue([null, mockMeasurementsData])

      await fetchMeasurements(51.50740123, -0.12780456, true)

      expect(mockCatchFetchError).toHaveBeenCalledWith(
        expect.stringContaining('latitude=51.507401&longitude=-0.127805'),
        expect.any(Object)
      )
    })
  })
})
