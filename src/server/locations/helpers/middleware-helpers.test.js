import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  handleSingleMatch,
  handleMultipleMatches,
  processMatches,
  getTitleAndHeaderTitle,
  getLanguageDates,
  getFormattedDateSummary,
  deduplicateResults
} from './middleware-helpers.js'

// Mock dependencies
vi.mock('./convert-first-letter-into-upper-case.js', () => ({
  convertFirstLetterIntoUppercase: vi.fn((str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
  )
}))

vi.mock('../../data/en/en.js', () => ({
  english: {
    home: {
      pageTitle: 'Check local air quality'
    }
  }
}))

vi.mock('../../../config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'disableTestMocks') return false
      return undefined
    })
  }
}))

vi.mock('moment-timezone', () => {
  const moment = vi.fn(() => ({
    format: vi.fn(() => '15 March 2024')
  }))
  return { default: moment }
})

vi.mock('./convert-string.js', () => ({
  convertStringToHyphenatedLowercaseWords: vi.fn((str) =>
    str ? str.toLowerCase().replace(/\s+/g, '-') : ''
  ),
  extractAndFormatUKPostcode: vi.fn(() => null),
  splitAndKeepFirstWord: vi.fn((str) => (str ? str.split(/[-_\s]+/)[0] : '')),
  isValidFullPostcodeUK: vi.fn(() => false),
  formatUKPostcode: vi.fn((postcode) => postcode)
}))

vi.mock('../../data/constants.js', () => ({
  LANG_EN: 'en',
  LANG_CY: 'cy',
  REDIRECT_STATUS_CODE: 301
}))

vi.mock('./create-bookmark-ids.js', () => ({
  createURLRouteBookmarks: vi.fn((matches) => ({
    selectedMatchesAddedIDs: matches.map((match) => ({
      ...match,
      id: 'test-id'
    }))
  }))
}))

vi.mock('./reduce-matches.js', () => ({
  default: vi.fn((matches) => matches)
}))

vi.mock('./filter-matches.js', () => ({
  filterMatches: vi.fn(() => true)
}))

vi.mock('../../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }))
}))

describe('Middleware Helpers Tests', () => {
  let mockH, mockRequest

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()

    mockH = {
      redirect: vi.fn(() => ({
        code: vi.fn(() => ({
          takeover: vi.fn()
        }))
      }))
    }

    mockRequest = {
      yar: {
        set: vi.fn(),
        get: vi.fn()
      }
    }
  })

  describe('handleSingleMatch', () => {
    it('should handle single match for English language', () => {
      const params = {
        selectedMatches: [{ name: 'Cardiff' }],
        getForecasts: { forecasts: ['forecast1'] },
        getDailySummary: 'summary',
        transformedDailySummary: 'transformed',
        englishDate: '15 March 2024',
        welshDate: '15 Mawrth 2024',
        month: 3,
        headerTitle: 'Cardiff',
        titleRoute: 'cardiff',
        headerTitleRoute: 'cardiff-header',
        title: 'Cardiff - Check local air quality',
        urlRoute: 'cardiff-url',
        locationType: 'city',
        lang: 'en'
      }

      handleSingleMatch(mockH, mockRequest, params)

      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'locationData',
        expect.objectContaining({
          results: params.selectedMatches,
          getForecasts: params.getForecasts.forecasts,
          transformedDailySummary: params.transformedDailySummary,
          englishDate: params.englishDate,
          dailySummary: params.getDailySummary,
          welshDate: params.welshDate,
          getMonth: params.month,
          title: params.title,
          headerTitle: params.headerTitle,
          titleRoute: params.titleRoute,
          headerTitleRoute: params.headerTitleRoute,
          locationType: params.locationType,
          lang: params.lang
        })
      )

      expect(mockH.redirect).toHaveBeenCalledWith('/location/cardiff-url')
    })

    it('should handle single match for Welsh language', () => {
      const params = {
        selectedMatches: [{ name: 'Caerdydd' }],
        getForecasts: { forecasts: ['forecast1'] },
        getDailySummary: 'summary',
        transformedDailySummary: 'transformed',
        englishDate: '15 March 2024',
        welshDate: '15 Mawrth 2024',
        month: 3,
        headerTitle: 'Caerdydd',
        titleRoute: 'caerdydd',
        headerTitleRoute: 'caerdydd-header',
        title: 'Caerdydd - Gwirio ansawdd aer lleol',
        urlRoute: 'caerdydd-url',
        locationType: 'dinas',
        lang: 'cy'
      }

      handleSingleMatch(mockH, mockRequest, params)

      expect(mockH.redirect).toHaveBeenCalledWith('/lleoliad/caerdydd-url')
    })

    it('should use headerTitleRoute when multiple matches exist', () => {
      const params = {
        selectedMatches: [{ name: 'Cardiff' }, { name: 'Newport' }],
        urlRoute: 'cardiff-url',
        headerTitleRoute: 'cardiff-header',
        lang: 'en'
      }

      handleSingleMatch(mockH, mockRequest, params)

      expect(mockH.redirect).toHaveBeenCalledWith('/location/cardiff-header')
    })
  })

  describe('handleMultipleMatches', () => {
    it('should handle multiple matches with complete data', () => {
      const params = {
        selectedMatches: [{ name: 'Cardiff' }, { name: 'Newport' }],
        locationNameOrPostcode: 'Cardiff Area',
        userLocation: 'Cardiff',
        getForecasts: { forecasts: ['forecast1'] },
        multipleLocations: {
          title: 'Multiple Results',
          paragraphs: ['Select location'],
          pageTitle: 'Multiple Results',
          serviceName: 'Air Quality Service'
        },
        airQualityData: {
          commonMessages: ['Air quality message']
        },
        siteTypeDescriptions: ['Urban background'],
        pollutantTypes: ['NO2', 'PM2.5'],
        getDailySummary: 'Daily summary',
        transformedDailySummary: 'Transformed summary',
        footerTxt: 'Footer text',
        phaseBanner: 'Beta',
        backlink: '/back',
        cookieBanner: 'Cookie banner',
        calendarWelsh: ['Ionawr', 'Chwefror', 'Mawrth'],
        month: 2,
        welshDate: '15 Mawrth 2024',
        englishDate: '15 March 2024',
        locationType: 'city',
        lang: 'en'
      }

      handleMultipleMatches(mockH, mockRequest, params)

      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'locationData',
        expect.objectContaining({
          results: params.selectedMatches,
          userLocation: params.locationNameOrPostcode,
          airQualityData: params.airQualityData.commonMessages,
          pageTitle: 'Multiple Results Cardiff -  Multiple Results',
          summaryDate: params.englishDate,
          welshMonth: 'Mawrth'
        })
      )

      expect(mockH.redirect).toHaveBeenCalledWith('multiple-results')
    })

    it('should handle multiple matches for Welsh language', () => {
      const params = {
        selectedMatches: [{ name: 'Caerdydd' }],
        locationNameOrPostcode: null,
        multipleLocations: {
          title: 'Canlyniadau Lluosog',
          pageTitle: 'Canlyniadau Lluosog'
        },
        airQualityData: { commonMessages: [] },
        calendarWelsh: ['Ionawr', 'Chwefror', 'Mawrth'],
        month: 2,
        welshDate: '15 Mawrth 2024',
        englishDate: '15 March 2024',
        lang: 'cy'
      }

      handleMultipleMatches(mockH, mockRequest, params)

      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'locationData',
        expect.objectContaining({
          userLocation: 'Unknown Location'
        })
      )

      expect(mockH.redirect).toHaveBeenCalledWith('canlyniadau-lluosog/cy')
    })
  })

  describe('processMatches', () => {
    it('should process matches and add IDs', () => {
      const matches = [
        { name: 'Cardiff', type: 'city' },
        { name: 'Newport', type: 'city' }
      ]
      const userLocation = 'CF10 1AA'
      const locationNameOrPostcode = 'Cardiff'
      const searchTerms = ['cardiff']

      const result = processMatches(
        matches,
        userLocation,
        locationNameOrPostcode,
        searchTerms
      )

      expect(result.selectedMatches).toHaveLength(2)
      expect(result.selectedMatches[0]).toHaveProperty('id', 'test-id')
    })

    it('should handle empty matches', () => {
      const matches = []
      const userLocation = 'Unknown'
      const locationNameOrPostcode = 'Unknown'
      const searchTerms = []

      const result = processMatches(
        matches,
        userLocation,
        locationNameOrPostcode,
        searchTerms
      )

      expect(result.selectedMatches).toEqual([])
    })

    it('should process matches with second search term', () => {
      const matches = [{ name: 'Cardiff Bay' }]
      const userLocation = 'Cardiff'
      const locationNameOrPostcode = 'Cardiff Bay'
      const searchTerms = ['cardiff']
      const secondSearchTerm = 'bay'

      const result = processMatches(
        matches,
        userLocation,
        locationNameOrPostcode,
        searchTerms,
        secondSearchTerm
      )

      expect(result.selectedMatches).toHaveLength(1)
    })
  })

  describe('getTitleAndHeaderTitle', () => {
    it('should handle location with DISTRICT_BOROUGH and NAME2', () => {
      const locationDetails = [
        {
          GAZETTEER_ENTRY: {
            DISTRICT_BOROUGH: 'Cardiff',
            NAME2: 'Cardiff City Centre',
            NAME1: 'Cardiff'
          }
        }
      ]

      const result = getTitleAndHeaderTitle(locationDetails, 'Cardiff')

      expect(result.title).toContain('Cardiff City Centre, Cardiff')
      expect(result.headerTitle).toBe('Cardiff City Centre, Cardiff')
    })

    it('should handle location with DISTRICT_BOROUGH without NAME2', () => {
      const locationDetails = [
        {
          GAZETTEER_ENTRY: {
            DISTRICT_BOROUGH: 'Cardiff',
            NAME1: 'CF10 1AA'
          }
        }
      ]

      const result = getTitleAndHeaderTitle(locationDetails, 'Cardiff')

      expect(result.title).toContain('CF10 1AA, Cardiff')
      expect(result.headerTitle).toBe('CF10 1AA, Cardiff')
    })

    it('should handle location with COUNTY_UNITARY and NAME2', () => {
      const locationDetails = [
        {
          GAZETTEER_ENTRY: {
            COUNTY_UNITARY: 'Powys',
            NAME2: 'Brecon',
            NAME1: 'Brecon Town'
          }
        }
      ]

      const result = getTitleAndHeaderTitle(locationDetails, 'Brecon')

      expect(result.title).toContain('Brecon, Powys')
      expect(result.headerTitle).toBe('Brecon, Powys')
    })

    it('should handle location with COUNTY_UNITARY without NAME2', () => {
      const locationDetails = [
        {
          GAZETTEER_ENTRY: {
            COUNTY_UNITARY: 'Powys',
            NAME1: 'Brecon'
          }
        }
      ]

      const result = getTitleAndHeaderTitle(locationDetails, 'Brecon')

      expect(result.title).toContain('Brecon, Powys')
      expect(result.headerTitle).toBe('Brecon, Powys')
    })

    it('should handle location without DISTRICT_BOROUGH or COUNTY_UNITARY', () => {
      const locationDetails = [
        {
          GAZETTEER_ENTRY: {
            NAME1: 'Unknown Location'
          }
        }
      ]

      const result = getTitleAndHeaderTitle(locationDetails, 'Unknown Location')

      expect(result.title).toBe('Unknown Location')
      expect(result.headerTitle).toBe('Unknown Location')
    })

    it('should handle empty location details', () => {
      const result = getTitleAndHeaderTitle([], 'Default Location')

      expect(result.title).toBe('')
      expect(result.headerTitle).toBe('')
    })

    it('should handle null location details', () => {
      const result = getTitleAndHeaderTitle(null, 'Default Location')

      expect(result.title).toBe('')
      expect(result.headerTitle).toBe('')
    })

    it('should handle undefined locationNameOrPostcode', () => {
      const locationDetails = [
        {
          GAZETTEER_ENTRY: {
            COUNTY_UNITARY: 'Powys',
            NAME1: 'Test'
          }
        }
      ]

      const result = getTitleAndHeaderTitle(locationDetails)

      expect(result.title).toContain('Unknown Location, Powys')
    })
  })

  describe('getLanguageDates', () => {
    it('should format dates for both languages', () => {
      const formattedDateSummary = ['15', 'March', '2024']
      const getMonthSummary = 2
      const calendarEnglish = ['January', 'February', 'March', 'April']
      const calendarWelsh = ['Ionawr', 'Chwefror', 'Mawrth', 'Ebrill']

      const result = getLanguageDates(
        formattedDateSummary,
        getMonthSummary,
        calendarEnglish,
        calendarWelsh
      )

      expect(result.englishDate).toBe('15 March 2024')
      expect(result.welshDate).toBe('15 Mawrth 2024')
    })

    it('should handle empty date arrays', () => {
      const formattedDateSummary = []
      const getMonthSummary = 0
      const calendarEnglish = ['January']
      const calendarWelsh = ['Ionawr']

      const result = getLanguageDates(
        formattedDateSummary,
        getMonthSummary,
        calendarEnglish,
        calendarWelsh
      )

      expect(result.englishDate).toContain('January')
      expect(result.welshDate).toContain('Ionawr')
    })
  })

  describe('getFormattedDateSummary', () => {
    it('should format date summary correctly', () => {
      const issueDate = '2024-03-15'
      const calendarEnglish = ['January', 'February', 'March', 'April']

      const result = getFormattedDateSummary(issueDate, calendarEnglish)

      expect(result).toHaveProperty('getMonthSummary')
      expect(result).toHaveProperty('formattedDateSummary')
      expect(Array.isArray(result.formattedDateSummary)).toBe(true)
    })

    it('should handle invalid date', () => {
      const issueDate = 'invalid-date'
      const calendarEnglish = ['January', 'February', 'March']

      const result = getFormattedDateSummary(issueDate, calendarEnglish)

      expect(result).toHaveProperty('getMonthSummary')
      expect(result).toHaveProperty('formattedDateSummary')
    })

    it('should handle empty calendar', () => {
      const issueDate = '2024-03-15'
      const calendarEnglish = []

      const result = getFormattedDateSummary(issueDate, calendarEnglish)

      expect(result.getMonthSummary).toBe(-1)
    })
  })

  describe('deduplicateResults', () => {
    it('should remove duplicate results', () => {
      const results = [
        { name: 'Cardiff', type: 'city' },
        { name: 'Newport', type: 'city' },
        { name: 'Cardiff', type: 'city' }
      ]

      const result = deduplicateResults(results)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ name: 'Cardiff', type: 'city' })
      expect(result[1]).toEqual({ name: 'Newport', type: 'city' })
    })

    it('should handle empty results', () => {
      const results = []

      const result = deduplicateResults(results)

      expect(result).toEqual([])
    })

    it('should handle single result', () => {
      const results = [{ name: 'Cardiff', type: 'city' }]

      const result = deduplicateResults(results)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ name: 'Cardiff', type: 'city' })
    })

    it('should handle complex duplicate objects', () => {
      const results = [
        {
          name: 'Cardiff',
          coordinates: { lat: 51, lng: -3 },
          metadata: { population: 400000 }
        },
        { name: 'Newport', coordinates: { lat: 51.5, lng: -3.2 } },
        {
          name: 'Cardiff',
          coordinates: { lat: 51, lng: -3 },
          metadata: { population: 400000 }
        }
      ]

      const result = deduplicateResults(results)

      expect(result).toHaveLength(2)
    })
  })
})
