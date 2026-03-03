/**
 * Shared mock setup for Welsh location controller tests
 * This file must be imported FIRST in each test file before any other imports
 */

/* global vi */

// '' - Constants to avoid string duplication
const MOCK_COOKIE_MESSAGE = 'Mock cookie message'
const MOCK_WELSH_NOT_FOUND = 'Mock Welsh not found message'
const MOCK_WELSH_HEADING = 'Mock Welsh heading'
const MOCK_WELSH_SERVICE = 'Mock Welsh service'

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
  },
  daqi: {
    description: {
      a: 'Mock Welsh DAQI description A',
      b: 'Mock Welsh DAQI description B'
    }
  },
  getAirQuality: vi.fn(() => ({
    today: { band: 'moderate', value: 4 },
    day2: { band: 'moderate', value: 5 }
  }))
}))

vi.mock('../../data/en/en.js', () => ({
  english: {
    notFoundLocation: {
      paragraphs: { a: 'Mock English not found message' },
      heading: 'Mock English heading'
    },
    footerTxt: { cookies: 'Cookies' },
    phaseBanner: { tag: 'Beta' },
    backlink: { text: 'Back' },
    cookieBanner: { message: MOCK_COOKIE_MESSAGE },
    daqi: {
      description: {
        a: 'Mock English description A',
        b: 'Mock English description B'
      }
    },
    multipleLocations: {
      titlePrefix: 'Air quality in',
      pageTitle: 'Mock English page title',
      serviceName: 'Mock English service'
    },
    dailySummaryTexts: { today: 'Today' }
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

vi.mock('../../data/cy/cy.js', () => ({
  welsh: {
    notFoundLocation: {
      paragraphs: { a: MOCK_WELSH_NOT_FOUND },
      heading: MOCK_WELSH_HEADING
    },
    footerTxt: { cookies: 'Cwcis' },
    phaseBanner: { tag: 'Beta' },
    backlink: { text: 'Yn ôl' },
    cookieBanner: { message: MOCK_COOKIE_MESSAGE },
    daqi: {
      description: {
        a: 'Mock Welsh description A',
        b: 'Mock Welsh description B'
      }
    },
    multipleLocations: {
      titlePrefix: 'Ansawdd aer yn',
      pageTitle: 'Mock Welsh page title',
      serviceName: MOCK_WELSH_SERVICE
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

vi.mock('moment-timezone', async () => {
  const actual = await vi.importActual('moment-timezone')
  return {
    default: actual.default
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
  HTTP_STATUS_INTERNAL_SERVER_ERROR: 500,
  WELSH_TITLE: 'Gwirio ansawdd aer'
}))

vi.mock('../../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn().mockReturnValue('https://mock-site-url.com')
}))

// '' - Helper to create initialize location variables mock result
const createInitializeLocationVariablesMock = (request, lang) => {
  request.yar.clear('searchTermsSaved')
  return {
    lang: lang || 'cy',
    getMonth: 9,
    metaSiteUrl: 'https://mock-site-url.com',
    notFoundLocation: {
      paragraphs: { a: MOCK_WELSH_NOT_FOUND },
      heading: MOCK_WELSH_HEADING
    },
    footerTxt: { cookies: 'Cwcis' },
    phaseBanner: { tag: 'Beta' },
    backlink: { text: 'Yn ôl' },
    cookieBanner: { message: MOCK_COOKIE_MESSAGE },
    daqi: { description: { a: 'Mock Welsh A', b: 'Mock Welsh B' } },
    multipleLocations: {
      titlePrefix: 'Ansawdd aer yn',
      serviceName: MOCK_WELSH_SERVICE
    },
    dailySummaryTexts: { today: 'Heddiw' },
    calendar: [
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
  }
}

// '' - Helper to create build location view data mock result
const createBuildLocationViewDataMock = ({ locationDetails, lang }) => {
  return {
    lang: lang || 'cy',
    pageTitle: 'Ansawdd aer yn Cardiff',
    serviceName: MOCK_WELSH_SERVICE,
    summaryDate: '15 Hydref 2023',
    welshMonth: 'Hydref',
    displayBacklink: true,
    result: locationDetails || { name: 'Cardiff' },
    airQuality: { level: 'Low' },
    backlink: { text: 'Yn ôl' },
    cookieBanner: { message: MOCK_COOKIE_MESSAGE },
    dailySummaryTexts: { today: 'Heddiw' },
    footerTxt: { cookies: 'Cwcis' },
    phaseBanner: { tag: 'Beta' }
  }
}

// '' - Helper to create render not found view mock result
const createRenderNotFoundViewMock = (h, lang) => {
  return h.view('location-not-found/index', {
    lang,
    paragraph: { a: MOCK_WELSH_NOT_FOUND },
    serviceName: MOCK_WELSH_HEADING
  })
}

// '' - Helper to optimize location data in session
const createOptimizeLocationDataInSessionMock = (
  request,
  locationData,
  nearestLocation,
  nearestLocationsRange
) => {
  locationData.getForecasts = nearestLocation
  locationData.getMeasurements = nearestLocationsRange
  request.yar.set('locationData', locationData)
}

vi.mock('../../common/helpers/location-controller-helper.js', () => {
  let mockProcessLocationDataResult = {
    locationDetails: {
      id: 'CARD3',
      name: 'Cardiff',
      locationType: 'UK'
    },
    forecastData: { mockForecast: 'data' },
    measurementData: { mockMeasurement: 'data' },
    nearestLocation: { id: 1, data: 'mock' },
    nearestLocationsRange: [{ id: 1, name: 'Mock Site' }]
  }

  return {
    initializeLocationVariables: vi
      .fn()
      .mockImplementation(createInitializeLocationVariablesMock),
    processLocationData: vi
      .fn()
      .mockImplementation(() => Promise.resolve(mockProcessLocationDataResult)),
    buildLocationViewData: vi
      .fn()
      .mockImplementation(createBuildLocationViewDataMock),
    renderLocationView: vi.fn().mockImplementation((h, viewData) => {
      return h.view('locations/location', viewData)
    }),
    renderNotFoundView: vi
      .fn()
      .mockImplementation(createRenderNotFoundViewMock),
    optimizeLocationDataInSession: vi
      .fn()
      .mockImplementation(createOptimizeLocationDataInSessionMock),
    setMockProcessLocationDataResult: (result) => {
      mockProcessLocationDataResult = result
    }
  }
})

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
  default: vi.fn().mockReturnValue(1024 * 1024)
}))

vi.mock('../../../config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'disableTestMocks') {
        return false
      }
      if (key === 'useNewRicardoMeasurementsEnabled') {
        return true
      }
      return undefined
    })
  }
}))
