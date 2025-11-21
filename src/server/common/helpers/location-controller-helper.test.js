''
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  initializeLocationVariables,
  processLocationData,
  buildLocationViewData,
  renderLocationView,
  buildNotFoundViewData,
  renderNotFoundView,
  optimizeLocationDataInSession,
  shouldRedirectToEnglish,
  getPreviousUrl,
  buildRedirectUrl
} from './location-controller-helper.js'
import { LANG_EN, LANG_CY } from '../../data/constants.js'

// Mock modules
vi.mock('../logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn()
  }))
}))

vi.mock('moment-timezone', () => ({
  default: vi.fn(() => ({
    format: vi.fn(() => '15 March 2024')
  }))
}))

vi.mock('../get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn(() => 'https://example.com')
}))

vi.mock('../../locations/helpers/get-location-type.js', () => ({
  getLocationType: vi.fn(() => 'UK')
}))

vi.mock('../../locations/helpers/get-nearest-location.js', () => ({
  getNearestLocation: vi.fn(() =>
    Promise.resolve({
      forecastNum: 3,
      nearestLocationsRange: [],
      nearestLocation: {}
    })
  )
}))

vi.mock('../../locations/helpers/get-id-match.js', () => ({
  getIdMatch: vi.fn(() => ({
    locationIndex: 0,
    locationDetails: { name: 'Test Location' }
  }))
}))

vi.mock('../../locations/helpers/get-ni-single-data.js', () => ({
  getNIData: vi.fn(() => ({ resultNI: {} }))
}))

vi.mock('../../locations/helpers/gazetteer-util.js', () => ({
  gazetteerEntryFilter: vi.fn(() => ({
    title: 'test location',
    headerTitle: 'test location'
  }))
}))

vi.mock(
  '../../locations/helpers/convert-first-letter-into-upper-case.js',
  () => ({
    convertFirstLetterIntoUppercase: vi.fn(
      (str) => str.charAt(0).toUpperCase() + str.slice(1)
    )
  })
)

vi.mock('../../locations/helpers/transform-summary-keys.js', () => ({
  transformKeys: vi.fn(() => ({
    transformedDailySummary: {}
  }))
}))

vi.mock('../../locations/helpers/air-quality-values.js', () => ({
  airQualityValues: vi.fn(() => ({
    airQuality: { index: 3 }
  }))
}))

vi.mock('object-sizeof', () => ({
  default: vi.fn(() => 1024)
}))

describe('Location Controller Helper', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = {
      yar: {
        clear: vi.fn(),
        set: vi.fn(),
        _store: {}
      },
      headers: {
        referer: 'https://example.com/previous'
      }
    }

    mockH = {
      view: vi.fn(() => 'mocked view')
    }
  })

  describe('initializeLocationVariables', () => {
    it('should initialize variables for English language', () => {
      const result = initializeLocationVariables(mockRequest, LANG_EN)

      expect(result.lang).toBe(LANG_EN)
      expect(result.metaSiteUrl).toBe('https://example.com')
      expect(result.footerTxt).toBeDefined()
      expect(result.notFoundLocation).toBeDefined()
      expect(mockRequest.yar.clear).toHaveBeenCalledWith('searchTermsSaved')
    })

    it('should initialize variables for Welsh language', () => {
      const result = initializeLocationVariables(mockRequest, LANG_CY)

      expect(result.lang).toBe(LANG_CY)
      expect(result.metaSiteUrl).toBe('https://example.com')
      expect(result.footerTxt).toBeDefined()
      expect(result.notFoundLocation).toBeDefined()
    })
  })

  describe('processLocationData', () => {
    it('should process location data correctly', async () => {
      const locationData = {
        getForecasts: {},
        locationType: 'UK',
        results: []
      }

      const result = await processLocationData(
        {}, // mock request
        locationData,
        'location123',
        LANG_EN,
        true
      )

      expect(result.locationDetails).toBeDefined()
      expect(result.forecastNum).toBe(3)
      expect(result.nearestLocationsRange).toBeDefined()
      expect(result.nearestLocation).toBeDefined()
    })
  })

  describe('buildLocationViewData', () => {
    it('should build view data correctly for English', () => {
      const params = {
        locationDetails: { name: 'Test Location' },
        nearestLocationsRange: [],
        locationData: {
          dailySummary: {},
          englishDate: '2024-03-15'
        },
        forecastNum: 3,
        lang: LANG_EN,
        getMonth: 2,
        metaSiteUrl: 'https://example.com',
        airQualityData: { commonMessages: {} },
        siteTypeDescriptions: {},
        pollutantTypes: {}
      }

      const result = buildLocationViewData(params)

      expect(result.lang).toBe(LANG_EN)
      expect(result.pageTitle).toContain('Test location')
      expect(result.locationName).toBe('Test location')
      expect(result.displayBacklink).toBe(true)
      expect(result.footerTxt).toBeDefined()
    })

    it('should build view data correctly for Welsh', () => {
      const params = {
        locationDetails: { name: 'Test Location' },
        nearestLocationsRange: [],
        locationData: {
          dailySummary: {},
          welshDate: '2024-03-15'
        },
        forecastNum: 3,
        lang: LANG_CY,
        getMonth: 2,
        metaSiteUrl: 'https://example.com',
        airQualityData: { commonMessages: {} },
        siteTypeDescriptions: {},
        pollutantTypes: {}
      }

      const result = buildLocationViewData(params)

      expect(result.lang).toBe(LANG_CY)
      expect(result.summaryDate).toBe('2024-03-15')
    })
  })

  describe('renderLocationView', () => {
    it('should render location view', () => {
      const viewData = { title: 'Test' }
      const result = renderLocationView(mockH, viewData)

      expect(mockH.view).toHaveBeenCalledWith('locations/location', viewData)
      expect(result).toBe('mocked view')
    })
  })

  describe('buildNotFoundViewData', () => {
    it('should build not found data for English', () => {
      const result = buildNotFoundViewData(LANG_EN)

      expect(result.lang).toBe(LANG_EN)
      expect(result.paragraph).toBeDefined()
      expect(result.serviceName).toBeDefined()
      expect(result.footerTxt).toBeDefined()
    })

    it('should build not found data for Welsh', () => {
      const result = buildNotFoundViewData(LANG_CY)

      expect(result.lang).toBe(LANG_CY)
      expect(result.paragraph).toBeDefined()
      expect(result.serviceName).toBeDefined()
    })
  })

  describe('renderNotFoundView', () => {
    it('should render not found view', () => {
      const result = renderNotFoundView(mockH, LANG_EN)

      expect(mockH.view).toHaveBeenCalledWith(
        '404',
        expect.objectContaining({
          lang: LANG_EN
        })
      )
      expect(result).toBe('mocked view')
    })
  })

  describe('optimizeLocationDataInSession', () => {
    it('should optimize location data in session', () => {
      const locationData = {
        getForecasts: { large: 'data' },
        getMeasurements: { large: 'measurements' }
      }
      const nearestLocation = { optimized: 'location' }
      const nearestLocationsRange = { optimized: 'range' }

      optimizeLocationDataInSession(
        mockRequest,
        locationData,
        nearestLocation,
        nearestLocationsRange
      )

      expect(locationData.getForecasts).toBe(nearestLocation)
      expect(locationData.getMeasurements).toBe(nearestLocationsRange)
      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'locationData',
        locationData
      )
    })
  })

  describe('shouldRedirectToEnglish', () => {
    it('should return true when lang is en and no search terms', () => {
      const query = { lang: 'en' }
      const result = shouldRedirectToEnglish(query)
      expect(result).toBe(true)
    })

    it('should return false when search terms exist', () => {
      const query = { lang: 'en', searchTerms: 'london' }
      const result = shouldRedirectToEnglish(query)
      expect(result).toBe(false)
    })

    it('should return false when lang is not en', () => {
      const query = { lang: 'cy' }
      const result = shouldRedirectToEnglish(query)
      expect(result).toBe(false)
    })
  })

  describe('getPreviousUrl', () => {
    it('should get previous URL from referer header', () => {
      const result = getPreviousUrl(mockRequest)
      expect(result).toBe('https://example.com/previous')
    })

    it('should get previous URL from referrer header', () => {
      mockRequest.headers = { referrer: 'https://example.com/alt' }
      const result = getPreviousUrl(mockRequest)
      expect(result).toBe('https://example.com/alt')
    })
  })

  describe('buildRedirectUrl', () => {
    it('should build redirect URL with search params', () => {
      const currentUrl =
        'https://example.com/location?searchTerms=london&secondSearchTerm=uk&searchTermsLocationType=city'
      const result = buildRedirectUrl(currentUrl)

      expect(result).toBe(
        '/location?lang=en&searchTerms=london&secondSearchTerm=uk&searchTermsLocationType=city'
      )
    })

    it('should handle missing search params', () => {
      const currentUrl = 'https://example.com/location'
      const result = buildRedirectUrl(currentUrl)

      expect(result).toBe(
        '/location?lang=en&searchTerms=&secondSearchTerm=&searchTermsLocationType='
      )
    })
  })
})
