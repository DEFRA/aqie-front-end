// '' Tests for test mode functionality and issueTime calculations
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Constants
const TEST_LOCATION_NAME = 'Test Location'
const MAX_OBJECT_SIZE = 2048576

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
    headerTitle: TEST_LOCATION_NAME
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
vi.mock('object-sizeof', () => ({ default: vi.fn(() => MAX_OBJECT_SIZE) }))
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

describe('Location ID Controller - Test Mode', () => {
  let mockRequest, mockH

  beforeEach(() => {
    vi.clearAllMocks()
    const mocks = createMockRequestResponse()
    mockRequest = mocks.mockRequest
    mockH = mocks.mockH
  })

  describe('Session storage', () => {
    it('should store testMode in session when query parameter provided', async () => {
        // ''
        mockRequest.query = { lang: 'en', testMode: 'noDailySummary' }

        const mockLocationData = {
          results: [{ id: 'test' }],
          getForecasts: [{ locationId: 'test' }],
          locationType: 'uk',
          dailySummary: { no2: 30, pm25: 15 }
        }

        mockRequest.yar.get
          .mockReturnValueOnce(true) // searchTermsSaved
          .mockReturnValueOnce(mockLocationData)
          .mockReturnValueOnce('noDailySummary') // testMode from session

        vi.mocked(getIdMatch).mockReturnValue({
          locationIndex: 0,
          locationDetails: { id: 'test', name: TEST_LOCATION_NAME }
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
          'testMode',
          'noDailySummary'
        )
      })
  })

  describe('oldDate test mode', () => {
    it('should set date to yesterday', async () => {
        // ''
        mockRequest.query = { lang: 'en' }

        const mockLocationData = {
          results: [{ id: 'test' }],
          getForecasts: [{ locationId: 'test' }],
          locationType: 'uk',
          dailySummary: {
            issue_date: '2025-11-24 10:00:00',
            no2: 30,
            pm25: 15
          }
        }

        mockRequest.yar.get
          .mockReturnValueOnce(true) // searchTermsSaved
          .mockReturnValueOnce(mockLocationData)
          .mockReturnValueOnce('oldDate') // testMode from session

        vi.mocked(getIdMatch).mockReturnValue({
          locationIndex: 0,
          locationDetails: { id: 'test', name: TEST_LOCATION_NAME }
        })

        vi.mocked(getNearestLocation).mockResolvedValue({
          forecastNum: [
            [{ today: 4 }, { day2: 5 }, { day3: 3 }, { day4: 2 }, { day5: 3 }]
          ],
          nearestLocationsRange: [],
          nearestLocation: { id: 'test' }
        })

        await getLocationDetailsController.handler(mockRequest, mockH)

        // The dailySummary.issue_date should be modified to yesterday
        expect(mockRequest.yar.set).toHaveBeenCalledWith(
          'locationData',
          expect.objectContaining({
            dailySummary: expect.objectContaining({
              issue_date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}/)
            })
          })
        )
      })
  })

  describe('todayDate test mode', () => {
    it('should set date to today', async () => {
        // ''
        mockRequest.query = { lang: 'en' }

        const mockLocationData = {
          results: [{ id: 'test' }],
          getForecasts: [{ locationId: 'test' }],
          locationType: 'uk',
          dailySummary: {
            issue_date: '2020-01-01 10:00:00',
            no2: 30,
            pm25: 15
          }
        }

        mockRequest.yar.get
          .mockReturnValueOnce(true) // searchTermsSaved
          .mockReturnValueOnce(mockLocationData)
          .mockReturnValueOnce('todayDate') // testMode from session

        vi.mocked(getIdMatch).mockReturnValue({
          locationIndex: 0,
          locationDetails: { id: 'test', name: TEST_LOCATION_NAME }
        })

        vi.mocked(getNearestLocation).mockResolvedValue({
          forecastNum: [
            [{ today: 4 }, { day2: 5 }, { day3: 3 }, { day4: 2 }, { day5: 3 }]
          ],
          nearestLocationsRange: [],
          nearestLocation: { id: 'test' }
        })

        await getLocationDetailsController.handler(mockRequest, mockH)

        // showSummaryDate should be true for today's date
        expect(mockRequest.yar.set).toHaveBeenCalledWith(
          'locationData',
          expect.objectContaining({
            showSummaryDate: true
          })
        )
      })
  })

  describe('noDataOldDate test mode', () => {
    it('should remove summary and set old date', async () => {
        // ''
        mockRequest.query = { lang: 'en' }

        const mockLocationData = {
          results: [{ id: 'test' }],
          getForecasts: [{ locationId: 'test' }],
          locationType: 'uk',
          dailySummary: {
            issue_date: '2025-11-24 10:00:00',
            no2: 30,
            pm25: 15
          }
        }

        mockRequest.yar.get
          .mockReturnValueOnce(true) // searchTermsSaved
          .mockReturnValueOnce(mockLocationData)
          .mockReturnValueOnce('noDataOldDate') // testMode from session

        vi.mocked(getIdMatch).mockReturnValue({
          locationIndex: 0,
          locationDetails: { id: 'test', name: TEST_LOCATION_NAME }
        })

        vi.mocked(getNearestLocation).mockResolvedValue({
          forecastNum: [
            [{ today: 4 }, { day2: 5 }, { day3: 3 }, { day4: 2 }, { day5: 3 }]
          ],
          nearestLocationsRange: [],
          nearestLocation: { id: 'test' }
        })

        await getLocationDetailsController.handler(mockRequest, mockH)

        // dailySummary should only have issue_date
        expect(mockRequest.yar.set).toHaveBeenCalledWith(
          'locationData',
          expect.objectContaining({
            dailySummary: expect.objectContaining({
              issue_date: expect.any(String)
            }),
            showSummaryDate: false
          })
        )
      })
  })

  describe('Error handling', () => {
    it('should handle unknown test mode with warning', async () => {
        // ''
        mockRequest.query = { lang: 'en' }

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
          .mockReturnValueOnce('unknownMode') // testMode
          .mockReturnValueOnce(mockLocationData) // locationData

        vi.mocked(getIdMatch).mockReturnValue({
          locationIndex: 0,
          locationDetails: { id: 'test', name: TEST_LOCATION_NAME }
        })

        vi.mocked(getNearestLocation).mockResolvedValue({
          forecastNum: [
            [{ today: 4 }, { day2: 5 }, { day3: 3 }, { day4: 2 }, { day5: 3 }]
          ],
          nearestLocationsRange: [],
          nearestLocation: { id: 'test' }
        })

        await getLocationDetailsController.handler(mockRequest, mockH)

        // Should still render view even with unknown test mode
        expect(mockH.view).toHaveBeenCalled()
      })
    })
  })
})

describe('Location ID Controller - IssueTime Calculation', () => {
  let mockRequest, mockH

  beforeEach(() => {
    vi.clearAllMocks()
    const mocks = createMockRequestResponse()
    mockRequest = mocks.mockRequest
    mockH = mocks.mockH
  })

  describe('issueTime calculation when showSummaryDate already set', () => {
    describe('Missing issueTime', () => {
      it('should calculate and save issueTime when showSummaryDate is set but issueTime is missing', async () => {
        // ''
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0] + ' 10:00:00'

        const mockLocationData = {
          results: [{ id: 'test' }],
          getForecasts: [{ locationId: 'test' }],
          locationType: 'uk',
          dailySummary: {
            issue_date: todayStr,
            no2: 30
          },
          showSummaryDate: true
          // issueTime is missing
        }

        mockRequest.yar.get
          .mockReturnValueOnce(true) // searchTermsSaved
          .mockReturnValueOnce(mockLocationData)

        vi.mocked(getIdMatch).mockReturnValue({
          locationIndex: 0,
          locationDetails: { id: 'test', name: TEST_LOCATION_NAME }
        })

        vi.mocked(getNearestLocation).mockResolvedValue({
          forecastNum: [
            [{ today: 4 }, { day2: 5 }, { day3: 3 }, { day4: 2 }, { day5: 3 }]
          ],
          nearestLocationsRange: [],
          nearestLocation: { id: 'test' }
        })

        await getLocationDetailsController.handler(mockRequest, mockH)

        // issueTime should be calculated and saved to session
        expect(mockRequest.yar.set).toHaveBeenCalledWith(
          'locationData',
          expect.objectContaining({
            issueTime: '10:00'
          })
        )
      })
    })

    describe('Existing issueTime', () => {
      it('should not recalculate issueTime when both showSummaryDate and issueTime are already set', async () => {
        // ''
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0] + ' 10:00:00'

        const mockLocationData = {
          results: [{ id: 'test' }],
          getForecasts: [{ locationId: 'test' }],
          locationType: 'uk',
          dailySummary: {
            issue_date: todayStr,
            no2: 30
          },
          showSummaryDate: true,
          issueTime: '10:00' // already set
        }

        mockRequest.yar.get = vi
          .fn()
          .mockReturnValueOnce(true) // searchTermsSaved
          .mockReturnValueOnce(mockLocationData) // locationData
          .mockReturnValueOnce(null) // testMode
          .mockReturnValueOnce(null) // mockLevel
          .mockReturnValueOnce(null) // mockDay
          .mockReturnValueOnce(null) // mockPollutantBand
          .mockReturnValue(null) // Any additional calls

        vi.mocked(getIdMatch).mockReturnValue({
          locationIndex: 0,
          locationDetails: { id: 'test', name: TEST_LOCATION_NAME }
        })

        vi.mocked(getNearestLocation).mockResolvedValue({
          forecastNum: [
            [{ today: 4 }, { day2: 5 }, { day3: 3 }, { day4: 2 }, { day5: 3 }]
          ],
          nearestLocationsRange: [],
          nearestLocation: { id: 'test' }
        })

        await getLocationDetailsController.handler(mockRequest, mockH)

        // View should be rendered with existing issueTime
        expect(mockH.view).toHaveBeenCalledWith(
          'locations/location',
          expect.objectContaining({
            issueTime: '10:00'
          })
        )
      })
    })
  })
})
