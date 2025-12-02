// NOSONAR
// '' Tests for showSummaryDate calculations and preservation

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Test constants
const MOCK_TEST_LOCATION = 'Test Location'
const MOCK_LOCATIONS_VIEW = 'locations/location'
const MOCK_OBJECT_SIZE = 2048576

// Mock all dependencies (same as other test files)
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

describe('Location ID Controller - ShowSummaryDate Calculations', () => {
  let mockRequest, mockH

  beforeEach(() => {
    vi.clearAllMocks()
    const mocks = createMockRequestResponse()
    mockRequest = mocks.mockRequest
    mockH = mocks.mockH
  })

  it('should calculate showSummaryDate when undefined and issue_date is today', async () => {
    // ''
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] + ' 10:00:00'

    const mockLocationData = {
      results: [{ id: 'test' }],
      getForecasts: [{ locationId: 'test' }],
      locationType: 'uk',
      dailySummary: { issue_date: todayStr, no2: 30, pm25: 15 },
      showSummaryDate: undefined // NOSONAR
    }

    mockRequest.yar.get
      .mockReturnValueOnce(true)
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
      expect.objectContaining({ showSummaryDate: true })
    )
  })

  it('should calculate showSummaryDate as false when issue_date is not today', async () => {
    // ''
    const yesterdayStr = '2020-01-01 10:00:00'

    const mockLocationData = {
      results: [{ id: 'test' }],
      getForecasts: [{ locationId: 'test' }],
      locationType: 'uk',
      dailySummary: { issue_date: yesterdayStr, no2: 30 },
      showSummaryDate: undefined // NOSONAR
    }

    mockRequest.yar.get = vi
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(mockLocationData)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValue(null)

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
      expect.objectContaining({ showSummaryDate: false })
    )
  })
})

describe('Location ID Controller - ShowSummaryDate Preservation', () => {
  let mockRequest, mockH

  beforeEach(() => {
    vi.clearAllMocks()
    const mocks = createMockRequestResponse()
    mockRequest = mocks.mockRequest
    mockH = mocks.mockH
  })

  it('should preserve showSummaryDate when already set', async () => {
    // ''
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] + ' 10:00:00'

    const mockLocationData = {
      results: [{ id: 'test' }],
      getForecasts: [{ locationId: 'test' }],
      locationType: 'uk',
      dailySummary: { issue_date: todayStr, no2: 30 },
      showSummaryDate: true,
      issueTime: '10:00'
    }

    mockRequest.yar.get = vi
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(mockLocationData)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValue(null)

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
      expect.objectContaining({ showSummaryDate: true, issueTime: '10:00' })
    )
  })

  it('should handle missing issue_date gracefully', async () => {
    // ''
    const mockLocationData = {
      results: [{ id: 'test' }],
      getForecasts: [{ locationId: 'test' }],
      locationType: 'uk',
      dailySummary: { no2: 30 }
    }

    mockRequest.yar.get
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
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

    expect(mockH.view).toHaveBeenCalled()
  })
})
