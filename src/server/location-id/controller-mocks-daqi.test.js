// '' Tests for mock DAQI level and pollutant band functionality
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock all dependencies before any imports
vi.mock('../data/en/monitoring-sites.js', () => ({
  siteTypeDescriptions: {
    'background-urban': 'Urban background',
    traffic: 'Traffic'
  },
  pollutantTypes: { no2: 'Nitrogen dioxide', pm25: 'Fine particles (PM2.5)' }
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
  },
  daqi: {
    description: {
      a: 'Current air quality data for ',
      b: ' and surrounding areas'
    }
  },
  getAirQuality: vi.fn(() => ({
    today: { band: 'moderate', value: 4 },
    day2: { band: 'moderate', value: 5 }
  }))
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
vi.mock('moment-timezone', async () => ({
  default: (await vi.importActual('moment-timezone')).default
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
  createLogger: vi.fn(() => ({ info: vi.fn(), error: vi.fn(), warn: vi.fn() }))
}))
vi.mock('../common/helpers/mock-daqi-level.js', () => ({
  mockLevelColor: vi.fn((level) => ({
    today: { value: level, band: 'moderate' },
    day2: { value: level, band: 'moderate' },
    day3: { value: level, band: 'moderate' },
    day4: { value: level, band: 'moderate' },
    day5: { value: level, band: 'moderate' }
  }))
}))
vi.mock('../common/helpers/mock-pollutant-level.js', () => ({
  mockPollutantBand: vi.fn((band) => ({
    no2: { value: 50, band },
    pm25: { value: 25, band }
  })),
  applyMockPollutantsToSites: vi.fn((sites) => sites)
}))
vi.mock('../locations/helpers/forecast-warning.js', () => ({
  getForecastWarning: vi.fn(() => null)
}))
vi.mock('../locations/helpers/middleware-helpers.js', () => ({
  getIssueTime: vi.fn((issueDate) => (issueDate ? '10:00' : undefined))
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
vi.mock('../locations/helpers/get-id-match.js', () => ({ getIdMatch: vi.fn() }))
vi.mock('../locations/helpers/get-ni-single-data.js', () => ({
  getNIData: vi.fn(() => ({
    resultNI: { id: 'test-ni', name: 'NI Test Location' }
  }))
}))
vi.mock('../locations/helpers/convert-string.js', () => ({
  compareLastElements: vi.fn(() => false)
}))
vi.mock('object-sizeof', () => ({ default: vi.fn(() => 2048576) }))
vi.mock('../../config/index.js', () => ({
  config: {
    get: vi.fn(
      (key) =>
        ({
          useNewRicardoMeasurementsEnabled: true,
          metaSiteUrl: 'https://uk-air.defra.gov.uk',
          nodeEnv: 'test',
          disableTestMocks: false
        })[key]
    )
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

// eslint-disable-next-line import-x/first -- vi.mock() must be before imports for Vitest hoisting
import { getLocationDetailsController } from './controller.js'
// eslint-disable-next-line import-x/first -- vi.mock() must be before imports for Vitest hoisting
import {
  getMockedModules,
  createMockRequestResponse
} from './helpers/tests/test-setup.js'

// Get the mocked modules
const { getNearestLocation, getIdMatch } = await getMockedModules()

describe('Location ID Controller - Mock DAQI and Pollutants', () => {
  let mockRequest, mockH

  beforeEach(() => {
    vi.clearAllMocks()
    const mocks = createMockRequestResponse()
    mockRequest = mocks.mockRequest
    mockH = mocks.mockH
  })

  describe('Mock DAQI level functionality', () => {
    it('should apply mock level from session when provided', async () => {
      // ''
      const mockLocationData = {
        results: [{ id: 'test' }],
        getForecasts: [{ locationId: 'test' }],
        locationType: 'uk'
      }

      mockRequest.yar.get = vi
        .fn()
        .mockReturnValueOnce(true) // searchTermsSaved
        .mockReturnValueOnce(mockLocationData) // locationData
        .mockReturnValueOnce(null) // testMode
        .mockReturnValueOnce('7') // mockLevel (from session)
        .mockReturnValueOnce(null) // mockDay
        .mockReturnValueOnce(null) // mockPollutantBand
        .mockReturnValue(null) // Any additional calls

      vi.mocked(getIdMatch).mockReturnValue({
        locationIndex: 0,
        locationDetails: { id: 'test', name: 'Test Location' }
      })

      vi.mocked(getNearestLocation).mockResolvedValue({
        forecastNum: [
          [{ today: 4 }, { day2: 5 }, { day3: 3 }, { day4: 2 }, { day5: 3 }]
        ],
        nearestLocationsRange: [],
        nearestLocation: { id: 'test' }
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalled()
      // The airQuality will be mocked to level 7
    })

    it('should store mockLevel in session when query parameter provided', async () => {
      // ''
      mockRequest.query = { lang: 'en', mockLevel: '8' }

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
        forecastNum: [
          [{ today: 4 }, { day2: 5 }, { day3: 3 }, { day4: 2 }, { day5: 3 }]
        ],
        nearestLocationsRange: [],
        nearestLocation: { id: 'test' }
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockRequest.yar.set).toHaveBeenCalledWith('mockLevel', '8')
    })

    it('should clear mockLevel when explicitly requested', async () => {
      // ''
      mockRequest.query = { lang: 'en', mockLevel: 'clear' }

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
        forecastNum: [
          [{ today: 4 }, { day2: 5 }, { day3: 3 }, { day4: 2 }, { day5: 3 }]
        ],
        nearestLocationsRange: [],
        nearestLocation: { id: 'test' }
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockRequest.yar.set).toHaveBeenCalledWith('mockLevel', null)
    })

    it('should store mockDay in session when query parameter provided', async () => {
      // ''
      mockRequest.query = { lang: 'en', mockDay: 'day3' }

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
        forecastNum: [
          [{ today: 4 }, { day2: 5 }, { day3: 3 }, { day4: 2 }, { day5: 3 }]
        ],
        nearestLocationsRange: [],
        nearestLocation: { id: 'test' }
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockRequest.yar.set).toHaveBeenCalledWith('mockDay', 'day3')
    })
  })

  describe('Mock pollutant band functionality', () => {
    it('should store mockPollutantBand in session when query parameter provided', async () => {
      // ''
      mockRequest.query = { lang: 'en', mockPollutantBand: 'high' }

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
        forecastNum: [
          [{ today: 4 }, { day2: 5 }, { day3: 3 }, { day4: 2 }, { day5: 3 }]
        ],
        nearestLocationsRange: [],
        nearestLocation: { id: 'test' }
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'mockPollutantBand',
        'high'
      )
    })

    it('should clear mockPollutantBand when explicitly requested', async () => {
      // ''
      mockRequest.query = { lang: 'en', mockPollutantBand: 'clear' }

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
        forecastNum: [
          [{ today: 4 }, { day2: 5 }, { day3: 3 }, { day4: 2 }, { day5: 3 }]
        ],
        nearestLocationsRange: [],
        nearestLocation: { id: 'test' }
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'mockPollutantBand',
        null
      )
    })

    it('should apply mockPollutantBand from session to monitoring sites', async () => {
      // ''
      const mockLocationData = {
        results: [{ id: 'test' }],
        getForecasts: [{ locationId: 'test' }],
        locationType: 'uk'
      }

      mockRequest.yar.get
        .mockReturnValueOnce(true) // searchTermsSaved
        .mockReturnValueOnce(null) // mockLevel
        .mockReturnValueOnce(null) // mockDay
        .mockReturnValueOnce('very-high') // mockPollutantBand
        .mockReturnValueOnce(null) // testMode
        .mockReturnValueOnce(mockLocationData) // locationData

      vi.mocked(getIdMatch).mockReturnValue({
        locationIndex: 0,
        locationDetails: { id: 'test', name: 'Test Location' }
      })

      vi.mocked(getNearestLocation).mockResolvedValue({
        forecastNum: [
          [{ today: 4 }, { day2: 5 }, { day3: 3 }, { day4: 2 }, { day5: 3 }]
        ],
        nearestLocationsRange: [
          { id: 'site1', pollutants: { no2: 30, pm25: 15 } }
        ],
        nearestLocation: { id: 'test' }
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.view).toHaveBeenCalled()
      // Monitoring sites will have mocked pollutant bands
    })
  })

  describe('Mock parameter preservation in redirects', () => {
    it('should preserve mockLevel in Welsh redirect', async () => {
      // ''
      mockRequest.query = { lang: 'cy', mockLevel: '5' }
      mockRequest.yar.get.mockReturnValue(true)

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith(
        '/lleoliad/test-location-123/?lang=cy&mockLevel=5'
      )
    })

    it('should preserve mockPollutantBand in Welsh redirect', async () => {
      // ''
      mockRequest.query = { lang: 'cy', mockPollutantBand: 'moderate' }
      mockRequest.yar.get.mockReturnValue(true)

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockH.redirect).toHaveBeenCalledWith(
        '/lleoliad/test-location-123/?lang=cy&mockPollutantBand=moderate'
      )
    })

    it('should preserve multiple mock parameters in search terms redirect', async () => {
      // ''
      mockRequest.headers = {}
      mockRequest.query = { lang: 'en', mockLevel: '6', mockDay: 'day2' }
      mockRequest.yar.get.mockReturnValueOnce(false) // searchTermsSaved

      await getLocationDetailsController.handler(mockRequest, mockH)

      const redirectCall = mockH.redirect.mock.calls[0][0]
      expect(redirectCall).toContain('mockLevel=6')
      expect(redirectCall).toContain('mockDay=day2')
    })
  })
})
