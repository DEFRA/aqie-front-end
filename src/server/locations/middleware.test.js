import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchMiddleware } from './middleware.js'
import { fetchData } from './helpers/fetch-data.js'
// Removed unused imports 'english', 'calendarEnglish', 'calendarWelsh'
import { transformKeys } from './helpers/transform-summary-keys.js'
import {
  getFormattedDateSummary,
  getLanguageDates
} from './helpers/middleware-helpers.js'
import { handleUKLocationType } from './helpers/extra-middleware-helpers.js'
import { handleErrorInputAndRedirect } from './helpers/error-input-and-redirect.js'
import { getMonth } from './helpers/location-type-util.js'
import {
  isValidPartialPostcodeNI,
  isValidPartialPostcodeUK
} from './helpers/convert-string.js'
import { sentenceCase } from '../common/helpers/sentence-case.js'
import { convertFirstLetterIntoUppercase } from './helpers/convert-first-letter-into-upper-case.js'
import {
  LANG_EN,
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI,
  LOCATION_NOT_FOUND_URL,
  WRONG_POSTCODE,
  STATUS_NOT_FOUND
  // REDIRECT_STATUS_CODE (unused)
} from '../data/constants.js'

// '' Mock all dependencies
vi.mock('./helpers/fetch-data.js', () => ({
  fetchData: vi.fn()
}))

vi.mock('../data/en/en.js', () => ({
  english: {
    notFoundUrl: {
      nonService: {
        pageTitle: 'Page not found'
      }
    },
    phaseBanner: 'Beta',
    footerTxt: 'Footer text',
    cookieBanner: 'Cookie banner',
    multipleLocations: {
      serviceName: 'Air Quality Service',
      titlePrefix: 'Air quality in'
    },
    home: {
      pageTitle: 'Check local air quality'
    }
  },
  calendarEnglish: {
    January: 'January',
    February: 'February'
  }
}))

vi.mock('../data/cy/cy.js', () => ({
  calendarWelsh: {
    January: 'Ionawr',
    February: 'Chwefror'
  }
}))

vi.mock('./helpers/transform-summary-keys.js', () => ({
  transformKeys: vi.fn()
}))

vi.mock('./helpers/middleware-helpers.js', () => ({
  getFormattedDateSummary: vi.fn(),
  getLanguageDates: vi.fn()
}))

vi.mock('./helpers/extra-middleware-helpers.js', () => ({
  handleUKLocationType: vi.fn()
}))

vi.mock('./helpers/error-input-and-redirect.js', () => ({
  handleErrorInputAndRedirect: vi.fn()
}))

vi.mock('./helpers/location-type-util.js', () => ({
  getMonth: vi.fn()
}))

vi.mock('../data/en/air-quality.js', () => ({
  default: { commonMessages: { good: 'Good air quality' } }
}))

vi.mock('./helpers/convert-string.js', () => ({
  isValidPartialPostcodeNI: vi.fn(),
  isValidPartialPostcodeUK: vi.fn()
}))

vi.mock('../common/helpers/sentence-case.js', () => ({
  sentenceCase: vi.fn()
}))

vi.mock('./helpers/convert-first-letter-into-upper-case.js', () => ({
  convertFirstLetterIntoUppercase: vi.fn()
}))

describe('locations middleware', () => {
  let mockRequest, mockH, mockRedirect, mockCode, mockTakeover, mockView

  beforeEach(() => {
    vi.clearAllMocks()

    // '' Setup comprehensive mock objects
    mockTakeover = vi.fn().mockReturnValue('takeover-result')
    mockCode = vi.fn().mockReturnValue({ takeover: mockTakeover })
    mockRedirect = vi.fn().mockReturnValue({
      code: mockCode,
      takeover: mockTakeover
    })
    mockView = vi.fn().mockReturnValue({
      code: mockCode,
      takeover: mockTakeover
    })

    mockH = {
      redirect: mockRedirect,
      view: mockView
    }

    mockRequest = {
      query: {},
      payload: {},
      path: '/test-path',
      yar: {
        set: vi.fn(),
        clear: vi.fn(),
        get: vi.fn()
      }
    }

    // '' Setup default mocks
    vi.mocked(getMonth).mockReturnValue(0)
    vi.mocked(handleErrorInputAndRedirect).mockReturnValue({
      locationType: LOCATION_TYPE_UK,
      userLocation: 'Cardiff',
      locationNameOrPostcode: 'Cardiff'
    })
    vi.mocked(fetchData).mockResolvedValue({
      getDailySummary: { issue_date: '2024-01-15' },
      getForecasts: { forecasts: [] },
      getOSPlaces: { results: [{ id: '1', name: 'Cardiff' }] },
      getNIPlaces: null
    })
    vi.mocked(transformKeys).mockReturnValue({
      transformedDailySummary: { date: '2024-01-15' }
    })
    vi.mocked(getFormattedDateSummary).mockReturnValue({
      formattedDateSummary: '15 January 2024',
      getMonthSummary: 'January'
    })
    vi.mocked(getLanguageDates).mockReturnValue({
      englishDate: '15 January 2024',
      welshDate: '15 Ionawr 2024'
    })
    vi.mocked(handleUKLocationType).mockReturnValue('uk-location-result')
  })

  describe('searchMiddleware', () => {
    it('should handle UK location type processing successfully', async () => {
      mockRequest.query = {
        searchTerms: 'cardiff',
        secondSearchTerm: 'wales'
      }

      const result = await searchMiddleware(mockRequest, mockH)

      expect(handleErrorInputAndRedirect).toHaveBeenCalledWith(
        mockRequest,
        mockH,
        LANG_EN,
        mockRequest.payload,
        'CARDIFF'
      )

      expect(fetchData).toHaveBeenCalledWith(mockRequest, {
        locationType: LOCATION_TYPE_UK,
        userLocation: 'Cardiff',
        searchTerms: 'CARDIFF',
        secondSearchTerm: 'WALES'
      })

      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'searchTermsSaved',
        'CARDIFF'
      )
      expect(handleUKLocationType).toHaveBeenCalled()
      expect(result).toBe('uk-location-result')
    })

    it('should handle NI location type processing successfully', async () => {
      mockRequest.query = {
        searchTerms: 'belfast',
        secondSearchTerm: 'ni'
      }

      vi.mocked(handleErrorInputAndRedirect).mockReturnValue({
        locationType: LOCATION_TYPE_NI,
        userLocation: 'Belfast',
        locationNameOrPostcode: 'Belfast'
      })

      vi.mocked(fetchData).mockResolvedValue({
        getDailySummary: { issue_date: '2024-01-15' },
        getForecasts: { forecasts: [] },
        getOSPlaces: null,
        getNIPlaces: {
          results: [
            {
              postcode: 'BT1 1AA',
              town: 'belfast',
              id: '1'
            }
          ]
        }
      })

      vi.mocked(sentenceCase).mockReturnValue('Belfast')
      vi.mocked(convertFirstLetterIntoUppercase).mockReturnValue(
        'BT1 1AA, Belfast'
      )

      const result = await searchMiddleware(mockRequest, mockH)

      expect(fetchData).toHaveBeenCalledWith(mockRequest, {
        locationType: LOCATION_TYPE_NI,
        userLocation: 'Belfast',
        searchTerms: 'BELFAST',
        secondSearchTerm: 'NI'
      })

      expect(mockRequest.yar.clear).toHaveBeenCalledWith('locationData')
      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'locationData',
        expect.objectContaining({
          locationType: LOCATION_TYPE_NI,
          urlRoute: 'bt11aa'
        })
      )

      expect(mockRedirect).toHaveBeenCalledWith('/location/bt11aa?lang=en')
      expect(result).toBe('takeover-result')
    })

    it('should handle location data not found for UK type', async () => {
      mockRequest.query = {
        searchTerms: 'unknown',
        secondSearchTerm: 'location'
      }

      vi.mocked(fetchData).mockResolvedValue({
        getDailySummary: { issue_date: '2024-01-15' },
        getForecasts: { forecasts: [] },
        getOSPlaces: null, // No results
        getNIPlaces: null
      })

      vi.mocked(isValidPartialPostcodeUK).mockReturnValue(false)
      vi.mocked(isValidPartialPostcodeNI).mockReturnValue(false)

      const result = await searchMiddleware(mockRequest, mockH)

      expect(mockRequest.yar.set).toHaveBeenCalledWith('locationDataNotFound', {
        locationNameOrPostcode: 'Cardiff',
        lang: LANG_EN
      })

      expect(mockRequest.yar.clear).toHaveBeenCalledWith('searchTermsSaved')
      expect(mockView).toHaveBeenCalledWith(
        'error/index',
        expect.objectContaining({
          statusCode: STATUS_NOT_FOUND,
          message: 'Page not found'
        })
      )

      expect(result).toBe('takeover-result')
    })

    it('should handle NI location with no results', async () => {
      mockRequest.query = {
        searchTerms: 'unknown',
        secondSearchTerm: 'ni'
      }

      vi.mocked(handleErrorInputAndRedirect).mockReturnValue({
        locationType: LOCATION_TYPE_NI,
        userLocation: 'Unknown',
        locationNameOrPostcode: 'Unknown'
      })

      vi.mocked(fetchData).mockResolvedValue({
        getDailySummary: { issue_date: '2024-01-15' },
        getForecasts: { forecasts: [] },
        getOSPlaces: null,
        getNIPlaces: { results: [] } // Empty results
      })

      await searchMiddleware(mockRequest, mockH)

      expect(mockRequest.yar.set).toHaveBeenCalledWith('locationDataNotFound', {
        locationNameOrPostcode: 'Unknown',
        lang: LANG_EN
      })

      expect(mockRequest.yar.clear).toHaveBeenCalledWith('searchTermsSaved')
      expect(mockView).toHaveBeenCalledWith(
        'error/index',
        expect.objectContaining({
          statusCode: STATUS_NOT_FOUND
        })
      )
    })

    it('should handle partial postcode validation', async () => {
      mockRequest.query = {
        searchTerms: 'cf1',
        secondSearchTerm: ''
      }

      vi.mocked(isValidPartialPostcodeUK).mockReturnValue(true)
      vi.mocked(isValidPartialPostcodeNI).mockReturnValue(false)

      vi.mocked(fetchData).mockResolvedValue({
        getDailySummary: { issue_date: '2024-01-15' },
        getForecasts: { forecasts: [] },
        getOSPlaces: { results: [{ id: '1' }] },
        getNIPlaces: null
      })

      await searchMiddleware(mockRequest, mockH)

      expect(mockRequest.yar.set).toHaveBeenCalledWith('locationDataNotFound', {
        locationNameOrPostcode: 'Cardiff',
        lang: LANG_EN
      })
    })

    it('should handle wrong postcode error', async () => {
      mockRequest.query = {
        searchTerms: 'invalid',
        secondSearchTerm: ''
      }

      vi.mocked(fetchData).mockResolvedValue({
        getDailySummary: { issue_date: '2024-01-15' },
        getForecasts: { forecasts: [] },
        getOSPlaces: WRONG_POSTCODE,
        getNIPlaces: null
      })

      await searchMiddleware(mockRequest, mockH)

      expect(mockView).toHaveBeenCalledWith(
        'error/index',
        expect.objectContaining({
          statusCode: STATUS_NOT_FOUND,
          heading: 'Page not found'
        })
      )
    })

    it('should handle error input redirect', async () => {
      vi.mocked(handleErrorInputAndRedirect).mockReturnValue({
        locationType: null // Error case
      })

      const result = await searchMiddleware(mockRequest, mockH)

      expect(result).toEqual({ locationType: null })
    })

    it('should handle unknown location type', async () => {
      mockRequest.query = {
        searchTerms: 'test'
      }

      vi.mocked(handleErrorInputAndRedirect).mockReturnValue({
        locationType: 'UNKNOWN_TYPE', // Not UK or NI
        userLocation: 'Test',
        locationNameOrPostcode: 'Test'
      })

      vi.mocked(fetchData).mockResolvedValue({
        getDailySummary: { issue_date: '2024-01-15' },
        getForecasts: { forecasts: [] },
        getOSPlaces: { results: [{ id: '1' }] },
        getNIPlaces: null
      })

      // '' Mock the postcode validation functions to return false
      vi.mocked(isValidPartialPostcodeUK).mockReturnValue(false)
      vi.mocked(isValidPartialPostcodeNI).mockReturnValue(false)

      await searchMiddleware(mockRequest, mockH)

      expect(mockRequest.yar.clear).toHaveBeenCalledWith('searchTermsSaved')
      expect(mockRedirect).toHaveBeenCalledWith(
        `${LOCATION_NOT_FOUND_URL}?lang=en`
      )
    })

    it('should handle direct location not found redirect without search terms', async () => {
      mockRequest.query = {} // No search terms

      vi.mocked(handleErrorInputAndRedirect).mockReturnValue({
        locationType: LOCATION_TYPE_UK,
        userLocation: 'Unknown',
        locationNameOrPostcode: 'Unknown'
      })

      vi.mocked(fetchData).mockResolvedValue({
        getDailySummary: { issue_date: '2024-01-15' },
        getForecasts: { forecasts: [] },
        getOSPlaces: null,
        getNIPlaces: null
      })

      await searchMiddleware(mockRequest, mockH)

      expect(mockRedirect).toHaveBeenCalledWith('location-not-found')
      expect(mockTakeover).toHaveBeenCalled()
    })

    it('should process date formatting correctly', async () => {
      mockRequest.query = {
        searchTerms: 'cardiff'
      }

      // '' Reset mocks to default working values for this test
      vi.mocked(handleErrorInputAndRedirect).mockReturnValue({
        locationType: LOCATION_TYPE_UK,
        userLocation: 'Cardiff',
        locationNameOrPostcode: 'Cardiff'
      })

      await searchMiddleware(mockRequest, mockH)

      expect(transformKeys).toHaveBeenCalledWith(
        { issue_date: '2024-01-15' },
        LANG_EN
      )
      expect(getFormattedDateSummary).toHaveBeenCalled()
      expect(getLanguageDates).toHaveBeenCalled()
    })

    it('should set search terms saved in session', async () => {
      mockRequest.query = {
        searchTerms: 'test location'
      }

      // '' Reset mocks to default working values for this test
      vi.mocked(handleErrorInputAndRedirect).mockReturnValue({
        locationType: LOCATION_TYPE_UK,
        userLocation: 'Test Location',
        locationNameOrPostcode: 'Test Location'
      })

      // '' Ensure location data is found to avoid early return
      vi.mocked(fetchData).mockResolvedValue({
        getDailySummary: { issue_date: '2024-01-15' },
        getForecasts: { forecasts: [] },
        getOSPlaces: { results: [{ id: '1', name: 'Test Location' }] }, // Valid data
        getNIPlaces: null
      })

      // '' Mock the postcode validation to avoid location not found path
      vi.mocked(isValidPartialPostcodeUK).mockReturnValue(false)
      vi.mocked(isValidPartialPostcodeNI).mockReturnValue(false)

      await searchMiddleware(mockRequest, mockH)

      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'searchTermsSaved',
        'TEST LOCATION'
      )
    })
  })
})
