// NOSONAR
// '' Tests for Welsh and English language handling

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Test constants
const MOCK_TEST_LOCATION = 'Test Location'
const MOCK_LOCATIONS_VIEW = 'locations/location'
const MOCK_OBJECT_SIZE = 2048576

// Mock all dependencies
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
    headerTitle: MOCK_TEST_LOCATION
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

// eslint-disable-next-line import-x/first
import { getLocationDetailsController } from './controller.js'
// eslint-disable-next-line import-x/first
import {
  getMockedModules,
  createMockRequestResponse
} from './helpers/tests/test-setup.js'

const { getNearestLocation, getIdMatch } = await getMockedModules()

describe('Location ID Controller - Welsh Language Handling', () => {
  let mockRequest, mockH

  beforeEach(() => {
    vi.clearAllMocks()
    const mocks = createMockRequestResponse()
    mockRequest = mocks.mockRequest
    mockH = mocks.mockH
  })

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
      .mockReturnValueOnce(null) // mockLevel (first call)
      .mockReturnValueOnce(null) // mockLevel (second call)
      .mockReturnValueOnce(mockLocationData)
      .mockReturnValueOnce(null) // mockLevel in applyMockLevel

    vi.mocked(getIdMatch).mockReturnValue({
      locationIndex: 0,
      locationDetails: { id: 'cardiff', name: 'Caerdydd' }
    })

    vi.mocked(getNearestLocation).mockResolvedValue({
      forecastNum: [
        [{ today: 4 }, { day2: 5 }, { day3: 3 }, { day4: 2 }, { day5: 3 }]
      ],
      nearestLocationsRange: [],
      nearestLocation: { id: 'cardiff' }
    })

    await getLocationDetailsController.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      MOCK_LOCATIONS_VIEW,
      expect.objectContaining({ lang: 'cy' })
    )
  })
})

describe('Location ID Controller - English Language Default', () => {
  let mockRequest, mockH

  beforeEach(() => {
    vi.clearAllMocks()
    const mocks = createMockRequestResponse()
    mockRequest = mocks.mockRequest
    mockH = mocks.mockH
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
      .mockReturnValueOnce(null) // mockLevel
      .mockReturnValueOnce(null) // mockDay
      .mockReturnValueOnce(null) // mockPollutantBand
      .mockReturnValueOnce(null) // testMode
      .mockReturnValueOnce(mockLocationData)

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

    expect(mockH.view).toHaveBeenCalledWith(
      MOCK_LOCATIONS_VIEW,
      expect.objectContaining({ lang: 'en' })
    )
  })
})
