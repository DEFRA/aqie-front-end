// '' Tests for session management (searchTermsSaved clearing and locationData updates)

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Test constants that are used in vi.mock() - must be declared before any vi.mock() calls
const MOCK_OBJECT_SIZE = 2048576

// Test constants - Note: Can't be used in vi.mock() due to hoisting
const MOCK_TEST_LOCATION = 'Test Location'

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
vi.mock('object-sizeof', () => ({ default: vi.fn(() => MOCK_OBJECT_SIZE) }))
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

describe('Location ID Controller - Session Management', () => {
  let mockRequest, mockH

  beforeEach(() => {
    vi.clearAllMocks()
    const mocks = createMockRequestResponse()
    mockRequest = mocks.mockRequest
    mockH = mocks.mockH
  })

  describe('Session management - searchTermsSaved', () => {
    it('should clear searchTermsSaved from session', async () => {
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
        .mockReturnValueOnce(null) // mockPollutantBand
        .mockReturnValueOnce(null) // testMode
        .mockReturnValueOnce(mockLocationData) // locationData

      vi.mocked(getIdMatch).mockReturnValue({
        locationIndex: 0,
        locationDetails: { id: 'test', name: MOCK_TEST_LOCATION }
      })

      vi.mocked(getNearestLocation).mockResolvedValue({
        forecastNum: [
          [{ today: 4 }, { day2: 5 }, { day3: 3 }, { day4: 2 }, { day5: 3 }]
        ],
        nearestLocationsRange: [],
        nearestLocation: { id: 'test' }
      })

      await getLocationDetailsController.handler(mockRequest, mockH)

      expect(mockRequest.yar.clear).toHaveBeenCalledWith('searchTermsSaved')
    })
  })

  describe('Session management - locationData updates', () => {
    it('should update locationData in session with nearest location info', async () => {
      // ''
      mockRequest.params = { id: 'test' }
      mockRequest.headers = { referer: 'https://example.com/location' }

      const mockLocationData = {
        results: [{ id: 'test' }],
        getForecasts: [{ locationId: 'test' }],
        getMeasurements: [],
        dailySummary: { issue_date: '2025-10-15 12:00:00' },
        locationType: 'uk',
        issueTime: '12:00'
      }

      const nearestLocation = [{ id: 'test', forecast: 4 }] // '' Changed to array to match actual implementation
      const nearestLocationsRange = [{ id: 'nearby-1' }]

      // Use mockImplementation to handle all yar.get calls dynamically
      mockRequest.yar.get.mockImplementation((key) => {
        if (key === 'searchTermsSaved') return true
        if (key === 'locationData') return mockLocationData
        return null
      })

      vi.mocked(getIdMatch).mockReturnValue({
        locationIndex: 0,
        locationDetails: { id: 'test', name: MOCK_TEST_LOCATION }
      })

      vi.mocked(getNearestLocation).mockResolvedValue({
        forecastNum: [
          [{ today: 4 }, { day2: 5 }, { day3: 3 }, { day4: 2 }, { day5: 3 }]
        ],
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

  describe('Alert coordinates - NI fallback', () => {
    it('should prefer NI result coordinates for alert links', async () => {
      // ''
      mockRequest.params = { id: 'bt11aa' }
      mockRequest.headers = { referer: 'https://example.com/location' }

      const mockLocationData = {
        results: [
          {
            postcode: 'BT1 1AA',
            town: 'Belfast',
            latitude: 54.596517,
            longitude: -5.934197
          }
        ],
        urlRoute: 'bt11aa',
        getForecasts: [{ location: { coordinates: [146778, 530104] } }],
        getMeasurements: [],
        dailySummary: { issue_date: '2025-10-15 12:00:00' },
        locationType: 'ni',
        issueTime: '12:00'
      }

      mockRequest.yar.get.mockImplementation((key) => {
        if (key === 'searchTermsSaved') return true
        if (key === 'locationData') return mockLocationData
        return null
      })

      vi.mocked(getIdMatch).mockReturnValue({
        locationIndex: 0,
        locationDetails: {
          GAZETTEER_ENTRY: {
            NAME1: 'BT1 1AA',
            DISTRICT_BOROUGH: 'Belfast'
          }
        }
      })

      vi.mocked(getNearestLocation)
        .mockResolvedValueOnce({
          forecastNum: [],
          nearestLocationsRange: [],
          nearestLocation: [],
          latlon: { lat: 56.0135, lon: -8.8534 }
        })
        .mockResolvedValueOnce({
          forecastNum: [],
          nearestLocationsRange: [],
          nearestLocation: [],
          latlon: { lat: 56.0135, lon: -8.8534 }
        })

      await getLocationDetailsController.handler(mockRequest, mockH)

      const viewData = mockH.view.mock.calls[0][1]
      expect(viewData.latlon).toEqual({ lat: 54.5965, lon: -5.9342 })
    })
  })
})
