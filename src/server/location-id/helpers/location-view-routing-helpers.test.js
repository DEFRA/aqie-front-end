import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildLocationViewData } from './location-view-routing-helpers.js'

vi.mock('../../locations/helpers/gazetteer-util.js', () => ({
  gazetteerEntryFilter: vi.fn().mockReturnValue({
    title: 'Bristol, City of Bristol',
    headerTitle: 'Bristol, City of Bristol'
  })
}))

vi.mock(
  '../../locations/helpers/convert-first-letter-into-upper-case.js',
  () => ({
    convertFirstLetterIntoUppercase: vi.fn((str) => str)
  })
)

vi.mock('../../locations/helpers/transform-summary-keys.js', () => ({
  transformKeys: vi.fn().mockReturnValue({ transformedDailySummary: {} })
}))

vi.mock('../../locations/helpers/air-quality-values.js', () => ({
  airQualityValues: vi
    .fn()
    .mockReturnValue({ airQuality: { today: { value: 3 } } })
}))

vi.mock('../../locations/helpers/forecast-warning.js', () => ({
  getForecastWarning: vi.fn().mockReturnValue(null)
}))

vi.mock('../controller-helpers.js', () => ({
  processAirQualityMessages: vi.fn().mockReturnValue({}),
  buildMockQueryParams: vi.fn().mockReturnValue(''),
  applyMockToDay: vi.fn((aq) => aq),
  applyMockPollutants: vi.fn((_, sites) => sites)
}))

vi.mock('../../common/helpers/mock-pollutant-level.js', () => ({
  mockPollutantBand: vi.fn(),
  applyMockPollutantsToSites: vi.fn()
}))

vi.mock('../../data/en/monitoring-sites.js', () => ({
  siteTypeDescriptions: {},
  pollutantTypes: {}
}))

vi.mock('../../data/en/air-quality.js', () => ({
  default: {},
  commonMessages: {}
}))

vi.mock('../../data/en/en.js', () => ({
  english: {
    multipleLocations: {
      titlePrefix: 'Air quality in',
      pageTitle: 'Check air quality',
      serviceName: 'Check air quality'
    },
    daqi: { description: { a: 'Air quality in', b: ' area' } },
    footerTxt: {},
    phaseBanner: {},
    backlink: { text: 'Change location' },
    cookieBanner: {},
    dailySummaryTexts: {}
  },
  calendarEnglish: []
}))

vi.mock('../../data/cy/cy.js', () => ({
  calendarWelsh: []
}))

vi.mock('../../../config/index.js', () => ({
  config: { get: vi.fn().mockReturnValue(true) }
}))

vi.mock('../../locations/helpers/convert-string.js', () => ({
  compareLastElements: vi.fn(),
  formatNorthernIrelandPostcode: vi.fn((s) => s)
}))

vi.mock('../../locations/helpers/get-search-terms-from-url.js', () => ({
  getSearchTermsFromUrl: vi.fn().mockReturnValue({
    searchTerms: '',
    secondSearchTerm: '',
    searchTermsLocationType: ''
  })
}))

const buildBaseParams = () => ({
  locationDetails: {
    GAZETTEER_ENTRY: { NAME1: 'Bristol', LOCAL_TYPE: 'City' }
  },
  nearestLocationsRange: [],
  locationData: {
    dailySummary: {},
    englishDate: '14 May 2026',
    welshDate: null,
    showSummaryDate: true,
    issueTime: '5:00am',
    results: [{ latitude: 51.4816, longitude: -2.5987 }]
  },
  forecastNum: [3],
  lang: 'en',
  getMonth: 0,
  metaSiteUrl: 'https://check-air-quality.service.gov.uk',
  request: { query: {}, yar: { get: vi.fn().mockReturnValue(null) } },
  locationId: 'bristol-city'
})

describe('buildLocationViewData — locationAlert', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('includes locationAlert in view data when provided', () => {
    const locationAlert = {
      pollutantsText: 'Ozone',
      breachesPageUrl:
        '/air-pollution-breaches?lang=en&locationId=bristol-city&locationName=Bristol'
    }
    const result = buildLocationViewData({
      ...buildBaseParams(),
      locationAlert
    })
    expect(result.locationAlert).toEqual(locationAlert)
  })

  it('sets locationAlert to null when not provided', () => {
    const result = buildLocationViewData(buildBaseParams())
    expect(result.locationAlert).toBeNull()
  })

  it('sets locationAlert to null when explicitly passed as null', () => {
    const result = buildLocationViewData({
      ...buildBaseParams(),
      locationAlert: null
    })
    expect(result.locationAlert).toBeNull()
  })

  it('preserves all pollutant breach data in locationAlert', () => {
    const locationAlert = {
      pollutantsText: 'Ozone and Nitrogen dioxide',
      breachesPageUrl:
        '/air-pollution-breaches?lang=en&locationId=bristol-city&locationName=Bristol'
    }
    const result = buildLocationViewData({
      ...buildBaseParams(),
      locationAlert
    })
    expect(result.locationAlert.pollutantsText).toBe(
      'Ozone and Nitrogen dioxide'
    )
    expect(result.locationAlert.breachesPageUrl).toBe(
      locationAlert.breachesPageUrl
    )
  })
})
