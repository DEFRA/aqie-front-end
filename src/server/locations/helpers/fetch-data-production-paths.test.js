import { describe, it, expect, vi } from 'vitest'
import { fetchData } from './fetch-data.js'
import {
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI,
  STATUS_BAD_REQUEST
} from '../../data/constants.js'

describe('fetchData UK location in production mode', () => {
  describe('UK location handling', () => {
    it('handles UK location when isTestMode is false', async () => {
      const mockRequest = {
        headers: { host: 'localhost' },
        yar: { get: () => null, set: () => {}, clear: () => {} }
      }

      const mockOSPlacesResult = { results: ['uk-place-1'] }
      const mockForecasts = {
        'forecast-summary': { today: 'good' },
        data: 'forecasts'
      }

      const di = {
        validateParams: vi.fn(() => null), // No validation error
        isTestMode: () => false, // Production mode
        isMockEnabled: false,
        logger: { info: vi.fn(), error: vi.fn() },
        fetchForecasts: vi.fn(async () => mockForecasts),
        handleUKLocationData: vi.fn(async () => mockOSPlacesResult),
        handleNILocationData: vi.fn(),
        errorResponse: vi.fn(),
        refreshOAuthToken: vi.fn(),
        config: { get: vi.fn() },
        buildUKLocationFilters: vi.fn(),
        combineUKSearchTerms: vi.fn(),
        isValidFullPostcodeUK: vi.fn(),
        isValidPartialPostcodeUK: vi.fn(),
        buildUKApiUrl: vi.fn(),
        shouldCallUKApi: vi.fn()
      }

      const result = await fetchData(
        mockRequest,
        {
          locationType: LOCATION_TYPE_UK,
          userLocation: 'London',
          searchTerms: ['London'],
          secondSearchTerm: null
        },
        di
      )

      // Verify the production path was taken
      expect(di.fetchForecasts).toHaveBeenCalled()
      expect(di.handleUKLocationData).toHaveBeenCalledWith(
        'London',
        expect.any(Object)
      )
      expect(result).toEqual({
        getDailySummary: { today: 'good' },
        getForecasts: mockForecasts,
        getOSPlaces: mockOSPlacesResult
      })
    })
  })
})

describe('fetchData NI location in production mode', () => {
  describe('NI location handling', () => {
    it('handles NI location when isTestMode is false', async () => {
      const mockRequest = {
        headers: { host: 'localhost' },
        yar: {
          get: () => ({ access_token: 'test-token' }),
          set: () => {},
          clear: () => {}
        }
      }

      const mockNIPlacesResult = { results: ['ni-place-1'] }
      const mockForecasts = {
        'forecast-summary': { today: 'moderate' },
        data: 'forecasts'
      }

      const di = {
        validateParams: vi.fn(() => null),
        isTestMode: () => false, // Production mode
        isMockEnabled: false,
        logger: { info: vi.fn(), error: vi.fn() },
        fetchForecasts: vi.fn(async () => mockForecasts),
        handleUKLocationData: vi.fn(),
        handleNILocationData: vi.fn(async () => mockNIPlacesResult),
        errorResponse: vi.fn(),
        refreshOAuthToken: vi.fn(async () => ({
          access_token: 'refreshed-token'
        })),
        config: { get: vi.fn() }
      }

      const result = await fetchData(
        mockRequest,
        {
          locationType: LOCATION_TYPE_NI,
          userLocation: 'Belfast',
          searchTerms: ['Belfast'],
          secondSearchTerm: null
        },
        di
      )

      // Verify the NI production path was taken
      expect(di.fetchForecasts).toHaveBeenCalled()
      expect(di.handleNILocationData).toHaveBeenCalled()
      expect(result).toEqual({
        getDailySummary: { today: 'moderate' },
        getForecasts: mockForecasts,
        getNIPlaces: mockNIPlacesResult
      })
    })
  })
})

describe('fetchData extractDailySummary coverage', () => {
  describe('daily summary extraction', () => {
    it('returns default when forecast-summary is missing', async () => {
      const mockRequest = {
        headers: { host: 'localhost' },
        yar: { get: () => null, set: () => {}, clear: () => {} }
      }

      const mockForecasts = { data: 'forecasts' } // No forecast-summary

      const di = {
        validateParams: vi.fn(() => null),
        isTestMode: () => false,
        logger: { info: vi.fn(), error: vi.fn() },
        fetchForecasts: vi.fn(async () => mockForecasts),
        handleUKLocationData: vi.fn(async () => ({ results: [] })),
        config: { get: vi.fn() }
      }

      const result = await fetchData(
        mockRequest,
        { locationType: LOCATION_TYPE_UK, userLocation: 'test' },
        di
      )

      expect(result.getDailySummary).toEqual({ today: null })
    })

    it('returns default when forecast-summary is not an object', async () => {
      const mockRequest = {
        headers: { host: 'localhost' },
        yar: { get: () => null, set: () => {}, clear: () => {} }
      }

      const mockForecasts = { 'forecast-summary': 'invalid' } // Not an object

      const di = {
        validateParams: vi.fn(() => null),
        isTestMode: () => false,
        logger: { info: vi.fn(), error: vi.fn() },
        fetchForecasts: vi.fn(async () => mockForecasts),
        handleUKLocationData: vi.fn(async () => ({ results: [] })),
        config: { get: vi.fn() }
      }

      const result = await fetchData(
        mockRequest,
        { locationType: LOCATION_TYPE_UK, userLocation: 'test' },
        di
      )

      expect(result.getDailySummary).toEqual({ today: null })
    })
  })
})

describe('fetchData unsupported location type', () => {
  describe('error handling', () => {
    it('returns error response for unsupported location type', async () => {
      const mockRequest = {
        headers: { host: 'localhost' },
        yar: { get: () => null, set: () => {}, clear: () => {} }
      }

      const mockErrorResponse = {
        error: 'Unsupported location type',
        statusCode: STATUS_BAD_REQUEST
      }

      const di = {
        validateParams: vi.fn(() => null),
        isTestMode: () => false,
        logger: { info: vi.fn(), error: vi.fn() },
        fetchForecasts: vi.fn(async () => ({
          'forecast-summary': { today: null }
        })),
        errorResponse: vi.fn(() => mockErrorResponse),
        config: { get: vi.fn() }
      }

      const result = await fetchData(
        mockRequest,
        { locationType: 'INVALID_TYPE', userLocation: 'test' },
        di
      )

      expect(di.logger.error).toHaveBeenCalledWith(
        'Unsupported location type provided:',
        'INVALID_TYPE'
      )
      expect(result).toEqual(mockErrorResponse)
    })
  })
})
