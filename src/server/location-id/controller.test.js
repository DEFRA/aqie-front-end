import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getLocationDetailsController } from './controller.js'

// Mock all dependencies
vi.mock('../data/en/monitoring-sites.js', () => ({
  siteTypeDescriptions: {
    'background-urban': 'Urban background',
    traffic: 'Traffic'
  },
  pollutantTypes: {
    no2: 'Nitrogen dioxide',
    pm25: 'Fine particles (PM2.5)'
  }
}))

vi.mock('../data/en/air-quality.js', () => ({
  default: {
    commonMessages: {
      moderate: 'Moderate air quality',
      high: 'High air quality'
    }
  },
  commonMessages: {
    moderate: 'Moderate air quality',
    high: 'High air quality'
  }
}))

vi.mock('../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn(() => 'https://uk-air.defra.gov.uk')
}))

vi.mock('../data/en/en.js', () => ({
  english: {
    multipleLocations: {
      titlePrefix: 'Air quality in',
      pageTitle: 'Check local air quality - GOV.UK',
      serviceName: 'Check local air quality'
    },
    daqi: {
      description: {
        a: 'Current air quality data for ',
        b: ' and surrounding areas'
      }
    },
    footerTxt: { test: 'footer' },
    phaseBanner: { test: 'banner' },
    backlink: { test: 'backlink' },
    cookieBanner: { test: 'cookies' },
    dailySummaryTexts: { test: 'summary' },
    notFoundLocation: {
      paragraphs: 'Location not found',
      heading: 'Location not found'
    }
  },
  calendarEnglish: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]
}))

vi.mock('../data/cy/cy.js', () => ({
  calendarWelsh: [
    'Ionawr',
    'Chwefror',
    'Mawrth',
    'Ebrill',
    'Mai',
    'Mehefin',
    'Gorffennaf',
    'Awst',
    'Medi',
    'Hydref',
    'Tachwedd',
    'Rhagfyr'
  ]
}))

vi.mock('moment-timezone', () => ({
  default: vi.fn(() => ({
    format: vi.fn(() => '15 October 2025')
  }))
}))

vi.mock('../locations/helpers/convert-first-letter-into-upper-case.js', () => ({
  convertFirstLetterIntoUppercase: vi.fn((str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : str
  )
}))

vi.mock('../locations/helpers/gazetteer-util.js', () => ({
  gazetteerEntryFilter: vi.fn(() => ({
    title: 'test location',
    headerTitle: 'Test Location'
  }))
}))

vi.mock('../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }))
}))

vi.mock('../locations/helpers/get-search-terms-from-url.js', () => ({
  getSearchTermsFromUrl: vi.fn(() => ({
    searchTerms: 'london',
    secondSearchTerm: '',
    searchTermsLocationType: 'uk'
  }))
}))

vi.mock('../locations/helpers/transform-summary-keys.js', () => ({
  transformKeys: vi.fn(() => ({
    transformedDailySummary: {
      no2: { value: 30, band: 'moderate' },
      pm25: { value: 15, band: 'low' }
    }
  }))
}))

vi.mock('../locations/helpers/air-quality-values.js', () => ({
  airQualityValues: vi.fn(() => ({
    airQuality: {
      band: 'moderate',
      value: 4,
      advice: 'Enjoy your usual outdoor activities.'
    }
  }))
}))

vi.mock('../locations/helpers/get-nearest-location.js', () => ({
  getNearestLocation: vi.fn()
}))

vi.mock('../locations/helpers/get-id-match.js', () => ({
  getIdMatch: vi.fn()
}))

vi.mock('../locations/helpers/get-ni-single-data.js', () => ({
  getNIData: vi.fn(() => ({
    resultNI: { id: 'test-ni', name: 'NI Test Location' }
  }))
}))

vi.mock('../locations/helpers/convert-string.js', () => ({
  compareLastElements: vi.fn(() => false)
}))

vi.mock('object-sizeof', () => ({
  default: vi.fn(() => 2048576) // 2MB in bytes
}))

vi.mock('../../config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      const mockConfig = {
        useNewRicardoMeasurementsEnabled: true,
        metaSiteUrl: 'https://uk-air.defra.gov.uk',
        nodeEnv: 'test'
      }
      return mockConfig[key]
    })
  }
}))

vi.mock('../data/constants.js', () => ({
  LANG_CY: 'cy',
  LANG_EN: 'en',
  LOCATION_NOT_FOUND: 'location-not-found',
  LOCATION_TYPE_NI: 'ni',
  LOCATION_TYPE_UK: 'uk',
  REDIRECT_STATUS_CODE: 301,
  STATUS_INTERNAL_SERVER_ERROR: 500
}))

// Get the mocked modules
const { getNearestLocation } = await import(
  '../locations/helpers/get-nearest-location.js'
)
const { getIdMatch } = await import('../locations/helpers/get-id-match.js')
const { compareLastElements } = await import(
  '../locations/helpers/convert-string.js'
)

describe('Location ID Controller Tests', () => {
  let mockRequest, mockH

  beforeEach(() => {
    vi.clearAllMocks()

    mockRequest = {
      params: { id: 'test-location-123' },
      query: { lang: 'en' },
      headers: { referer: 'https://example.com/previous' },
      url: { href: 'https://example.com/location/test-location-123?lang=en' },
      yar: {
        get: vi.fn(),
        set: vi.fn(),
        clear: vi.fn(),
        _store: {}
      }
    }

    const mockCode = vi.fn()
    mockH = {
      redirect: vi.fn(() => ({
        code: vi.fn(() => ({ takeover: vi.fn() }))
      })),
      view: vi.fn(),
      response: vi.fn(() => ({
        code: mockCode
      }))
    }
    mockH.code = mockCode
  })

  describe('Welsh redirect functionality', () => {
    it('should redirect to Welsh URL when lang=cy and no search terms', async () => {
      // ''
      mockRequest.query = { lang: 'cy' }
      mockRequest.yar.get.mockReturnValue(true)

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith(
        '/lleoliad/test-location-123/?lang=cy'
      )
    })

    it('should not redirect to Welsh URL when search terms present', async () => {
      // ''
      mockRequest.query = { lang: 'cy', searchTerms: 'london' }
      mockRequest.yar.get
        .mockReturnValueOnce(true) // searchTermsSaved
        .mockReturnValueOnce({
          results: [{ id: 'test', name: 'Test Location' }],
          getForecasts: [{ locationId: 'test' }],
          locationType: 'uk'
        })

      vi.mocked(getIdMatch).mockReturnValue({
        locationIndex: 0,
        locationDetails: { id: 'test', name: 'Test Location' }
      })

      vi.mocked(getNearestLocation).mockResolvedValue({
        forecastNum: 4,
        nearestLocationsRange: [],
        nearestLocation: { id: 'test' }
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.redirect).not.toHaveBeenCalledWith(
        '/lleoliad/test-location-123/?lang=cy'
      )
    })
  })

  describe('Search terms redirect functionality', () => {
    it('should redirect when no referer and no saved search terms', async () => {
      // ''
      mockRequest.headers = {}
      mockRequest.yar.get.mockReturnValueOnce(false) // searchTermsSaved

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/location?lang=en&searchTerms=')
      )
    })

    it('should redirect when referer equals current URL and no saved search terms', async () => {
      // ''
      vi.mocked(compareLastElements).mockReturnValue(true)

      mockRequest.yar.get.mockReturnValueOnce(false) // searchTermsSaved

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/location?lang=en&searchTerms=')
      )
    })

    it('should not redirect when referer exists and search terms saved', async () => {
      // ''
      vi.mocked(compareLastElements).mockReturnValue(false)

      mockRequest.yar.get
        .mockReturnValueOnce(true) // searchTermsSaved
        .mockReturnValueOnce({
          results: [{ id: 'test', name: 'Test Location' }],
          getForecasts: [{ locationId: 'test' }],
          locationType: 'uk'
        })

      vi.mocked(getIdMatch).mockReturnValue({
        locationIndex: 0,
        locationDetails: { id: 'test', name: 'Test Location' }
      })

      vi.mocked(getNearestLocation).mockResolvedValue({
        forecastNum: 4,
        nearestLocationsRange: [],
        nearestLocation: { id: 'test' }
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.redirect).not.toHaveBeenCalledWith(
        expect.stringContaining('/location?lang=en&searchTerms=')
      )
    })
  })

  describe('Session data validation', () => {
    it('should redirect when locationData.results is not an array', async () => {
      // ''
      mockRequest.yar.get
        .mockReturnValueOnce(true) // searchTermsSaved
        .mockReturnValueOnce({
          results: null,
          getForecasts: [{ locationId: 'test' }]
        })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/location?lang=en&searchTerms=')
      )
    })

    it('should redirect when getForecasts is missing', async () => {
      // ''
      mockRequest.yar.get
        .mockReturnValueOnce(true) // searchTermsSaved
        .mockReturnValueOnce({
          results: [{ id: 'test' }],
          getForecasts: null
        })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/location?lang=en&searchTerms=')
      )
    })

    it('should redirect when locationData is empty object', async () => {
      // ''
      mockRequest.yar.get
        .mockReturnValueOnce(true) // searchTermsSaved
        .mockReturnValueOnce({}) // empty locationData

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/location?lang=en&searchTerms=')
      )
    })
  })

  describe('Location processing for UK locations', () => {
    it('should successfully process UK location and return view', async () => {
      // ''
      const mockLocationData = {
        results: [{ id: 'test-location', name: 'Test Location' }],
        getForecasts: [{ locationId: 'test-location', forecast: 4 }],
        locationType: 'uk',
        dailySummary: { no2: 30, pm25: 15 },
        englishDate: '15 October 2025',
        welshDate: '15 Hydref 2025'
      }

      mockRequest.yar.get
        .mockReturnValueOnce(true) // searchTermsSaved
        .mockReturnValueOnce(mockLocationData)

      vi.mocked(getIdMatch).mockReturnValue({
        locationIndex: 0,
        locationDetails: { id: 'test-location', name: 'Test Location' }
      })

      vi.mocked(getNearestLocation).mockResolvedValue({
        forecastNum: 4,
        nearestLocationsRange: [{ id: 'nearby-1' }],
        nearestLocation: { id: 'test-location' }
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'locations/location',
        expect.objectContaining({
          result: expect.objectContaining({ id: 'test-location' }),
          pageTitle: expect.stringContaining('Air quality in'),
          lang: 'en'
        })
      )
      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'locationData',
        expect.any(Object)
      )
    })

    it('should successfully process NI location', async () => {
      // ''
      const mockLocationData = {
        results: [{ id: 'test-ni-location', name: 'Belfast Location' }],
        getForecasts: [{ locationId: 'test-ni-location', forecast: 3 }],
        locationType: 'ni'
      }

      mockRequest.yar.get
        .mockReturnValueOnce(true) // searchTermsSaved
        .mockReturnValueOnce(mockLocationData)

      vi.mocked(getIdMatch).mockReturnValue({
        locationIndex: 0,
        locationDetails: { id: 'test-ni-location', name: 'Belfast Location' }
      })

      vi.mocked(getNearestLocation).mockResolvedValue({
        forecastNum: 3,
        nearestLocationsRange: [{ id: 'ni-nearby-1' }],
        nearestLocation: { id: 'test-ni-location' }
      })

      await getLocationDetailsController.handler(mockRequest, mockH)
      expect(mockH.view).toHaveBeenCalledWith(
        'locations/location',
        expect.any(Object)
      )
    })
  })

  describe('Location not found handling', () => {
    it('should return location not found view when location details is null', async () => {
      // ''
      const mockLocationData = {
        results: [{ id: 'different-location' }],
        getForecasts: [{ locationId: 'different-location' }],
        locationType: 'uk'
      }

      mockRequest.yar.get
        .mockReturnValueOnce(true) // searchTermsSaved
        .mockReturnValueOnce(mockLocationData)

      vi.mocked(getIdMatch).mockReturnValue({
        locationIndex: -1,
        locationDetails: null
      })

      vi.mocked(getNearestLocation).mockResolvedValue({
        forecastNum: null,
        nearestLocationsRange: [],
        nearestLocation: null
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'location-not-found',
        expect.objectContaining({
          paragraph: 'Location not found',
          lang: 'en'
        })
      )
    })

    it('should return location not found view when location details is undefined', async () => {
      // ''
      const mockLocationData = {
        results: [{ id: 'different-location' }],
        getForecasts: [{ locationId: 'different-location' }],
        locationType: 'uk'
      }

      mockRequest.yar.get
        .mockReturnValueOnce(true) // searchTermsSaved
        .mockReturnValueOnce(mockLocationData)

      vi.mocked(getIdMatch).mockReturnValue({
        locationIndex: -1,
        locationDetails: undefined
      })

      vi.mocked(getNearestLocation).mockResolvedValue({
        forecastNum: null,
        nearestLocationsRange: [],
        nearestLocation: null
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'location-not-found',
        expect.any(Object)
      )
    })
  })

  describe('Error handling', () => {
    it('should return 500 error when an exception occurs', async () => {
      // ''
      mockRequest.yar.get.mockImplementation(() => {
        throw new Error('Session error')
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.response).toHaveBeenCalledWith('Internal Server Error')
      expect(mockH.code).toHaveBeenCalledWith(500)
    })

    it('should handle async errors in getNearestLocationData', async () => {
      // ''
      mockRequest.yar.get
        .mockReturnValueOnce(true) // searchTermsSaved
        .mockReturnValueOnce({
          results: [{ id: 'test' }],
          getForecasts: [{ locationId: 'test' }],
          locationType: 'uk'
        })

      vi.mocked(getNearestLocation).mockRejectedValue(new Error('API error'))

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.response).toHaveBeenCalledWith('Internal Server Error')
      expect(mockH.code).toHaveBeenCalledWith(500)
    })
  })

  describe('Language and date handling', () => {
    it('should handle Welsh language correctly', async () => {
      // ''
      mockRequest.query = { lang: 'cy', searchTerms: 'caerdydd' }

      const mockLocationData = {
        results: [{ id: 'cardiff' }],
        getForecasts: [{ locationId: 'cardiff' }],
        locationType: 'uk',
        welshDate: '15 Hydref 2025'
      }

      mockRequest.yar.get
        .mockReturnValueOnce(true) // searchTermsSaved
        .mockReturnValueOnce(mockLocationData)

      vi.mocked(getIdMatch).mockReturnValue({
        locationIndex: 0,
        locationDetails: { id: 'cardiff', name: 'Caerdydd' }
      })

      vi.mocked(getNearestLocation).mockResolvedValue({
        forecastNum: 4,
        nearestLocationsRange: [],
        nearestLocation: { id: 'cardiff' }
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'locations/location',
        expect.objectContaining({
          lang: 'cy',
          summaryDate: '15 Hydref 2025'
        })
      )
    })

    it('should default to English when no lang parameter', async () => {
      // ''
      mockRequest.query = {}

      const mockLocationData = {
        results: [{ id: 'test' }],
        getForecasts: [{ locationId: 'test' }],
        locationType: 'uk'
      }

      mockRequest.yar.get
        .mockReturnValueOnce(true) // searchTermsSaved
        .mockReturnValueOnce(mockLocationData)

      vi.mocked(getIdMatch).mockReturnValue({
        locationIndex: 0,
        locationDetails: { id: 'test', name: 'Test Location' }
      })

      vi.mocked(getNearestLocation).mockResolvedValue({
        forecastNum: 4,
        nearestLocationsRange: [],
        nearestLocation: { id: 'test' }
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'locations/location',
        expect.objectContaining({
          lang: 'en'
        })
      )
    })
  })

  describe('Session management', () => {
    it('should clear searchTermsSaved from session', async () => {
      // ''
      const mockLocationData = {
        results: [{ id: 'test' }],
        getForecasts: [{ locationId: 'test' }],
        locationType: 'uk'
      }

      mockRequest.yar.get
        .mockReturnValueOnce(true) // searchTermsSaved
        .mockReturnValueOnce(mockLocationData)

      vi.mocked(getIdMatch).mockReturnValue({
        locationIndex: 0,
        locationDetails: { id: 'test', name: 'Test Location' }
      })

      vi.mocked(getNearestLocation).mockResolvedValue({
        forecastNum: 4,
        nearestLocationsRange: [],
        nearestLocation: { id: 'test' }
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockRequest.yar.clear).toHaveBeenCalledWith('searchTermsSaved')
    })

    it('should update locationData in session with nearest location info', async () => {
      // ''
      const mockLocationData = {
        results: [{ id: 'test' }],
        getForecasts: [{ locationId: 'test' }],
        locationType: 'uk'
      }

      const nearestLocation = { id: 'test', forecast: 4 }
      const nearestLocationsRange = [{ id: 'nearby-1' }]

      mockRequest.yar.get
        .mockReturnValueOnce(true) // searchTermsSaved
        .mockReturnValueOnce(mockLocationData)

      vi.mocked(getIdMatch).mockReturnValue({
        locationIndex: 0,
        locationDetails: { id: 'test', name: 'Test Location' }
      })

      vi.mocked(getNearestLocation).mockResolvedValue({
        forecastNum: 4,
        nearestLocationsRange,
        nearestLocation
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'locationData',
        expect.objectContaining({
          getForecasts: nearestLocation,
          getMeasurements: nearestLocationsRange
        })
      )
    })
  })
})
