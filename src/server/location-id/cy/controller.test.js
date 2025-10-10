import { getLocationDetailsController } from './controller.js'

/* global vi, describe, it, expect, beforeEach, afterEach */

// Mock all the dependencies
vi.mock('../../data/cy/monitoring-sites.js', () => ({
  siteTypeDescriptions: {
    'Background Urban': 'Mock urban description',
    'Background Rural': 'Mock rural description'
  },
  pollutantTypes: {
    NO2: { title: 'Nitrogen dioxide', href: '/pollutants/nitrogen-dioxide' }
  }
}))

vi.mock('../../data/cy/air-quality.js', () => ({
  commonMessages: {
    low: { text: 'Isel', color: '#9cbb58' },
    moderate: { text: 'Cymedrol', color: '#e2b03b' }
  }
}))

vi.mock('../../data/en/en.js', () => ({
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

vi.mock('../../data/cy/cy.js', () => ({
  welsh: {
    notFoundLocation: {
      paragraphs: { a: 'Mock Welsh not found message' },
      heading: 'Mock Welsh heading'
    },
    footerTxt: { cookies: 'Cwcis' },
    phaseBanner: { tag: 'Beta' },
    backlink: { text: 'Yn ôl' },
    cookieBanner: { message: 'Mock cookie message' },
    daqi: {
      description: {
        a: 'Mock Welsh description A',
        b: 'Mock Welsh description B'
      }
    },
    multipleLocations: {
      titlePrefix: 'Ansawdd aer yn',
      pageTitle: 'Mock Welsh page title',
      serviceName: 'Mock Welsh service'
    },
    dailySummaryTexts: { today: 'Heddiw' }
  },
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

vi.mock('moment-timezone', () => {
  const mockMoment = () => ({
    format: vi.fn().mockReturnValue('15 October 2023')
  })
  return {
    __esModule: true,
    default: mockMoment
  }
})

vi.mock(
  '../../locations/helpers/convert-first-letter-into-upper-case.js',
  () => ({
    convertFirstLetterIntoUppercase: vi.fn((str) =>
      str ? str.charAt(0).toUpperCase() + str.slice(1) : str
    )
  })
)

vi.mock('../../locations/helpers/gazetteer-util.js', () => ({
  gazetteerEntryFilter: vi.fn().mockReturnValue({
    title: 'mock location',
    headerTitle: 'Mock Location'
  })
}))

vi.mock('../../common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn()
  })
}))

vi.mock('../../data/constants.js', () => ({
  LANG_CY: 'cy',
  LANG_EN: 'en',
  LOCATION_TYPE_UK: 'UK',
  LOCATION_TYPE_NI: 'NI',
  LOCATION_NOT_FOUND: 'location-not-found/index',
  REDIRECT_STATUS_CODE: 302,
  HTTP_STATUS_INTERNAL_SERVER_ERROR: 500
}))

vi.mock('../../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn().mockReturnValue('https://mock-site-url.com')
}))

vi.mock('../../locations/helpers/get-search-terms-from-url.js', () => ({
  getSearchTermsFromUrl: vi.fn().mockReturnValue({
    searchTerms: 'Cardiff',
    secondSearchTerm: '',
    searchTermsLocationType: 'city'
  })
}))

vi.mock('../../locations/helpers/transform-summary-keys.js', () => ({
  transformKeys: vi.fn().mockReturnValue({
    transformedDailySummary: { mockKey: 'mockValue' }
  })
}))

vi.mock('../../locations/helpers/air-quality-values.js', () => ({
  airQualityValues: vi.fn().mockReturnValue({
    airQuality: { level: 'Low', color: '#9cbb58' }
  })
}))

vi.mock('../../locations/helpers/get-nearest-location.js', () => ({
  getNearestLocation: vi.fn().mockResolvedValue({
    forecastNum: 3,
    nearestLocationsRange: [{ id: 1, name: 'Mock Site' }],
    nearestLocation: { id: 1, data: 'mock' }
  })
}))

vi.mock('../../locations/helpers/get-id-match.js', () => ({
  getIdMatch: vi.fn().mockReturnValue({
    locationIndex: 0,
    locationDetails: {
      id: 'CARD3',
      name: 'Cardiff',
      locationType: 'UK'
    }
  })
}))

vi.mock('../../locations/helpers/get-ni-single-data.js', () => ({
  getNIData: vi.fn().mockReturnValue({
    resultNI: { id: 'NI001', name: 'Belfast' }
  })
}))

vi.mock('object-sizeof', () => ({
  __esModule: true,
  default: vi.fn().mockReturnValue(1024 * 1024) // 1MB
}))

vi.mock('../../../config/index.js', () => ({
  config: {
    get: vi.fn().mockReturnValue(true)
  }
}))

describe('Welsh Location ID Controller', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = {
      params: { id: 'CARD3' },
      query: { lang: 'cy' },
      url: { href: '/lleoliad/CARD3?lang=cy' },
      headers: { referer: '/search' },
      yar: {
        get: vi.fn(),
        set: vi.fn(),
        clear: vi.fn(),
        _store: {}
      }
    }

    mockH = {
      view: vi.fn().mockReturnValue('mock view response'),
      redirect: vi.fn().mockReturnValue({
        code: vi.fn().mockReturnValue({
          takeover: vi.fn()
        })
      }),
      response: vi.fn().mockReturnValue({
        code: vi.fn()
      })
    }

    // Reset all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getLocationDetailsController', () => {
    it('should export getLocationDetailsController', () => {
      expect(getLocationDetailsController).toBeDefined()
      expect(typeof getLocationDetailsController.handler).toBe('function')
    })

    it('should redirect to English when lang=en query parameter is provided', async () => {
      mockRequest.query = { lang: 'en' }

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith('/location/CARD3/?lang=en')
    })

    it('should redirect to Welsh location search when no previous URL and no saved search terms', async () => {
      mockRequest.headers.referer = undefined
      mockRequest.yar.get.mockReturnValue(null)

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith(
        '/lleoliad?lang=cy&searchTerms=Cardiff&secondSearchTerm=&searchTermsLocationType=city'
      )
      expect(mockRequest.yar.clear).toHaveBeenCalledWith('locationData')
    })

    it('should successfully render Welsh location view with all required data', async () => {
      const mockLocationData = {
        locationType: 'UK',
        results: [{ id: 'CARD3', name: 'Cardiff' }],
        getForecasts: [{ id: 1, data: 'forecast' }],
        dailySummary: { today: 'Mock summary' },
        summaryDate: '2023-10-15',
        welshDate: '15 Hydref 2023'
      }

      mockRequest.yar.get.mockReturnValue(mockLocationData)

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'locations/location',
        expect.objectContaining({
          result: expect.any(Object),
          airQuality: expect.any(Object),
          pageTitle: expect.stringContaining('Ansawdd aer yn'),
          lang: 'cy',
          welshMonth: expect.any(String),
          summaryDate: '15 Hydref 2023',
          displayBacklink: true,
          serviceName: 'Mock Welsh service'
        })
      )
    })

    it('should handle Northern Ireland location type correctly', async () => {
      const mockLocationData = {
        locationType: 'NI',
        results: [{ id: 'BELF1', name: 'Belfast' }],
        getForecasts: [{ id: 1, data: 'forecast' }],
        dailySummary: { today: 'Mock summary' },
        summaryDate: '2023-10-15'
      }

      mockRequest.params.id = 'BELF1'
      mockRequest.yar.get.mockReturnValue(mockLocationData)

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'locations/location',
        expect.objectContaining({
          lang: 'cy'
        })
      )
    })

    it('should render location not found view when no location details found', async () => {
      const mockLocationData = {
        locationType: 'UK',
        results: [],
        getForecasts: []
      }

      mockRequest.yar.get.mockReturnValue(mockLocationData)

      // Mock getIdMatch to return no location details
      const { getIdMatch } = await import(
        '../../locations/helpers/get-id-match.js'
      )
      getIdMatch.mockReturnValueOnce({
        locationIndex: -1,
        locationDetails: null
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'location-not-found/index',
        expect.objectContaining({
          paragraph: { a: 'Mock Welsh not found message' },
          serviceName: 'Mock Welsh heading',
          lang: 'cy'
        })
      )
    })

    it('should handle errors gracefully and return 500 response', async () => {
      mockRequest.yar.get.mockImplementation(() => {
        throw new Error('Mock error')
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.response).toHaveBeenCalledWith('Internal Server Error')
      expect(mockH.response().code).toHaveBeenCalledWith(500)
    })

    it('should clear searchTermsSaved from session', async () => {
      const mockLocationData = {
        locationType: 'UK',
        results: [{ id: 'CARD3', name: 'Cardiff' }],
        getForecasts: [],
        dailySummary: {}
      }

      mockRequest.yar.get.mockReturnValue(mockLocationData)

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockRequest.yar.clear).toHaveBeenCalledWith('searchTermsSaved')
    })

    it('should update locationData with optimized forecasts and measurements', async () => {
      const mockLocationData = {
        locationType: 'UK',
        results: [{ id: 'CARD3', name: 'Cardiff' }],
        getForecasts: [{ id: 1, largeData: 'original' }],
        getMeasurements: [{ id: 1, largeData: 'original' }],
        dailySummary: {}
      }

      mockRequest.yar.get.mockReturnValue(mockLocationData)

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'locationData',
        expect.objectContaining({
          getForecasts: { id: 1, data: 'mock' },
          getMeasurements: [{ id: 1, name: 'Mock Site' }]
        })
      )
    })

    it('should use Welsh calendar month correctly', async () => {
      const mockLocationData = {
        locationType: 'UK',
        results: [{ id: 'CARD3', name: 'Cardiff' }],
        getForecasts: [],
        dailySummary: {}
      }

      mockRequest.yar.get.mockReturnValue(mockLocationData)

      // Mock moment to return October
      const moment = await import('moment-timezone')
      moment.default().format.mockReturnValue('15 October 2023')

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'locations/location',
        expect.objectContaining({
          welshMonth: 'Hydref' // October in Welsh
        })
      )
    })

    it('should handle request with saved search terms correctly', async () => {
      const mockLocationData = {
        locationType: 'UK',
        results: [{ id: 'CARD3', name: 'Cardiff' }],
        getForecasts: [],
        dailySummary: {}
      }

      mockRequest.headers.referer = undefined
      mockRequest.yar.get.mockImplementation((key) => {
        if (key === 'searchTermsSaved') return true
        if (key === 'locationData') return mockLocationData
        return null
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      // Should not redirect when searchTermsSaved is true
      expect(mockH.redirect).not.toHaveBeenCalled()
      expect(mockH.view).toHaveBeenCalled()
    })

    it('should handle empty location data gracefully', async () => {
      mockRequest.yar.get.mockReturnValue([])

      // Mock getIdMatch to return no location details for empty data
      const { getIdMatch } = await import(
        '../../locations/helpers/get-id-match.js'
      )
      getIdMatch.mockReturnValueOnce({
        locationIndex: -1,
        locationDetails: null
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'location-not-found/index',
        expect.any(Object)
      )
    })

    it('should use correct language constant for Welsh', async () => {
      const mockLocationData = {
        locationType: 'UK',
        results: [{ id: 'CARD3', name: 'Cardiff' }],
        getForecasts: [],
        dailySummary: {},
        englishDate: '15 October 2023'
      }

      mockRequest.yar.get.mockReturnValue(mockLocationData)

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'locations/location',
        expect.objectContaining({
          lang: 'cy'
        })
      )
    })

    it('should prioritize Welsh date over English date when available', async () => {
      const mockLocationData = {
        locationType: 'UK',
        results: [{ id: 'CARD3', name: 'Cardiff' }],
        getForecasts: [],
        dailySummary: {},
        welshDate: '15 Hydref 2023',
        englishDate: '15 October 2023'
      }

      mockRequest.yar.get.mockReturnValue(mockLocationData)

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'locations/location',
        expect.objectContaining({
          summaryDate: '15 Hydref 2023'
        })
      )
    })

    it('should include all required Welsh translations in view data', async () => {
      const mockLocationData = {
        locationType: 'UK',
        results: [{ id: 'CARD3', name: 'Cardiff' }],
        getForecasts: [],
        dailySummary: {}
      }

      mockRequest.yar.get.mockReturnValue(mockLocationData)

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalledWith(
        'locations/location',
        expect.objectContaining({
          footerTxt: { cookies: 'Cwcis' },
          phaseBanner: { tag: 'Beta' },
          backlink: { text: 'Yn ôl' },
          cookieBanner: { message: 'Mock cookie message' },
          dailySummaryTexts: { today: 'Heddiw' }
        })
      )
    })
  })
})
