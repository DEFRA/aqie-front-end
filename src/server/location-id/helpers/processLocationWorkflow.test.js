import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processLocationWorkflow } from './processLocationWorkflow.js'
import { fetchLocationAlert } from '../../air-pollution-breaches/fetch-location-alert.js'
import { fetchDaqiAlert } from '../../air-pollution-breaches/fetch-daqi-alert.js'

vi.mock('../../air-pollution-breaches/fetch-location-alert.js', () => ({
  fetchLocationAlert: vi.fn()
}))

vi.mock('../../air-pollution-breaches/fetch-daqi-alert.js', () => ({
  fetchDaqiAlert: vi.fn()
}))

const MOCK_LOCATION_DATA = {
  results: [
    {
      GAZETTEER_ENTRY: {
        ID: 'bristol-city',
        NAME1: 'Bristol',
        NAME2: null,
        DISTRICT_BOROUGH: null,
        COUNTY_UNITARY: null
      }
    }
  ],
  latlon: { lat: 51.4816, lon: -2.5987 },
  headerTitle: 'Bristol, City of Bristol',
  issueTime: null,
  getForecasts: {}
}

function buildHelpers(overrides = {}) {
  return {
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    config: { get: vi.fn().mockReturnValue('') },
    constants: {
      REDIRECT_STATUS_CODE: 302,
      LOCATION_NOT_FOUND: 'location-not-found'
    },
    buildUserLocationMetaCacheKey: vi.fn().mockReturnValue('cache-key'),
    getUserDataPayload: vi.fn().mockResolvedValue(null),
    setUserDataPayload: vi.fn().mockResolvedValue(undefined),
    setSessionKeyIfSessionExists: vi.fn(),
    determineLocationType: vi.fn().mockReturnValue('UK'),
    clearSessionKeyIfExists: vi.fn(),
    applyTestModeAndLogDebug: vi.fn().mockResolvedValue(undefined),
    getNearestLocationData: vi.fn().mockResolvedValue({
      locationDetails: { GAZETTEER_ENTRY: { NAME1: 'Bristol' } },
      forecastNum: [3],
      nearestLocationsRange: [],
      nearestLocation: null
    }),
    logAndCalculateSummaryDate: vi.fn(),
    persistLocationDataForLocationRoute: vi.fn().mockResolvedValue(undefined),
    buildLocationViewData: vi.fn().mockReturnValue({ viewKey: 'view-data' }),
    processLocationResult: vi.fn().mockResolvedValue('rendered-view'),
    buildNotFoundViewData: vi.fn().mockReturnValue({ notFound: true }),
    ...overrides
  }
}

function buildMockRequest() {
  return {
    params: { id: 'bristol-city' },
    query: {},
    headers: {},
    yar: {
      get: vi.fn().mockReturnValue(null),
      set: vi.fn()
    }
  }
}

describe('processLocationWorkflow — daqiAlert', () => {
  let mockH

  beforeEach(() => {
    vi.clearAllMocks()
    mockH = {
      view: vi.fn().mockReturnValue('not-found-view'),
      redirect: vi.fn(() => ({ code: vi.fn() }))
    }
    fetchLocationAlert.mockResolvedValue(null)
    fetchDaqiAlert.mockResolvedValue(null)
  })

  it('calls both fetchLocationAlert and fetchDaqiAlert when location is found', async () => {
    const helpers = buildHelpers()

    await processLocationWorkflow({
      locationData: MOCK_LOCATION_DATA,
      locationId: 'bristol-city',
      lang: 'en',
      getMonth: 4,
      metaSiteUrl: 'https://check-air.gov.uk',
      request: buildMockRequest(),
      h: mockH,
      helpers
    })

    expect(fetchLocationAlert).toHaveBeenCalledOnce()
    expect(fetchDaqiAlert).toHaveBeenCalledOnce()
  })

  it('passes lat and lon from locationData.latlon to fetchDaqiAlert', async () => {
    const helpers = buildHelpers()
    const request = buildMockRequest()

    await processLocationWorkflow({
      locationData: MOCK_LOCATION_DATA,
      locationId: 'bristol-city',
      lang: 'en',
      getMonth: 4,
      metaSiteUrl: 'https://check-air.gov.uk',
      request,
      h: mockH,
      helpers
    })

    expect(fetchDaqiAlert).toHaveBeenCalledWith(
      51.4816,
      -2.5987,
      'bristol-city',
      expect.any(String),
      'en',
      request
    )
  })

  it('passes daqiAlert from fetchDaqiAlert to buildLocationViewData', async () => {
    const daqiAlert = {
      highestDaqi: 8,
      highestReadableBand: 'High',
      isMultipleStations: false,
      pollutants: [{ name: 'ozone', href: '/pollutants/ozone' }],
      pollutantsText: 'ozone'
    }
    fetchDaqiAlert.mockResolvedValue(daqiAlert)
    const helpers = buildHelpers()

    await processLocationWorkflow({
      locationData: MOCK_LOCATION_DATA,
      locationId: 'bristol-city',
      lang: 'en',
      getMonth: 4,
      metaSiteUrl: 'https://check-air.gov.uk',
      request: buildMockRequest(),
      h: mockH,
      helpers
    })

    expect(helpers.buildLocationViewData).toHaveBeenCalledWith(
      expect.objectContaining({ daqiAlert })
    )
  })

  it('passes locationAlert from fetchLocationAlert to buildLocationViewData', async () => {
    const locationAlert = {
      pollutantsText: 'ozone',
      breachesPageUrl: '/air-pollution-breaches?lang=en&locationId=bristol-city'
    }
    fetchLocationAlert.mockResolvedValue(locationAlert)
    const helpers = buildHelpers()

    await processLocationWorkflow({
      locationData: MOCK_LOCATION_DATA,
      locationId: 'bristol-city',
      lang: 'en',
      getMonth: 4,
      metaSiteUrl: 'https://check-air.gov.uk',
      request: buildMockRequest(),
      h: mockH,
      helpers
    })

    expect(helpers.buildLocationViewData).toHaveBeenCalledWith(
      expect.objectContaining({ locationAlert })
    )
  })

  it('passes both locationAlert and daqiAlert simultaneously to buildLocationViewData', async () => {
    const locationAlert = {
      pollutantsText: 'ozone',
      breachesPageUrl: '/air-pollution-breaches'
    }
    const daqiAlert = {
      highestDaqi: 9,
      highestReadableBand: 'High',
      isMultipleStations: true,
      pollutants: [{ name: 'ozone', href: '/pollutants/ozone' }],
      pollutantsText: 'ozone'
    }
    fetchLocationAlert.mockResolvedValue(locationAlert)
    fetchDaqiAlert.mockResolvedValue(daqiAlert)
    const helpers = buildHelpers()

    await processLocationWorkflow({
      locationData: MOCK_LOCATION_DATA,
      locationId: 'bristol-city',
      lang: 'en',
      getMonth: 4,
      metaSiteUrl: 'https://check-air.gov.uk',
      request: buildMockRequest(),
      h: mockH,
      helpers
    })

    expect(helpers.buildLocationViewData).toHaveBeenCalledWith(
      expect.objectContaining({ locationAlert, daqiAlert })
    )
  })

  it('sets daqiAlert to null and logs a warning when fetchDaqiAlert rejects', async () => {
    fetchDaqiAlert.mockRejectedValue(new Error('network timeout'))
    const helpers = buildHelpers()

    await processLocationWorkflow({
      locationData: MOCK_LOCATION_DATA,
      locationId: 'bristol-city',
      lang: 'en',
      getMonth: 4,
      metaSiteUrl: 'https://check-air.gov.uk',
      request: buildMockRequest(),
      h: mockH,
      helpers
    })

    expect(helpers.buildLocationViewData).toHaveBeenCalledWith(
      expect.objectContaining({ daqiAlert: null })
    )
    expect(helpers.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('fetchDaqiAlert failed')
    )
  })

  it('sets locationAlert to null and logs a warning when fetchLocationAlert rejects', async () => {
    fetchLocationAlert.mockRejectedValue(new Error('fetch error'))
    const helpers = buildHelpers()

    await processLocationWorkflow({
      locationData: MOCK_LOCATION_DATA,
      locationId: 'bristol-city',
      lang: 'en',
      getMonth: 4,
      metaSiteUrl: 'https://check-air.gov.uk',
      request: buildMockRequest(),
      h: mockH,
      helpers
    })

    expect(helpers.buildLocationViewData).toHaveBeenCalledWith(
      expect.objectContaining({ locationAlert: null })
    )
    expect(helpers.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('fetchLocationAlert failed')
    )
  })

  it('does not call either fetch when locationDetails is null', async () => {
    const helpers = buildHelpers({
      getNearestLocationData: vi.fn().mockResolvedValue({
        locationDetails: null,
        forecastNum: [],
        nearestLocationsRange: [],
        nearestLocation: null
      })
    })

    await processLocationWorkflow({
      locationData: MOCK_LOCATION_DATA,
      locationId: 'bristol-city',
      lang: 'en',
      getMonth: 4,
      metaSiteUrl: 'https://check-air.gov.uk',
      request: buildMockRequest(),
      h: mockH,
      helpers
    })

    expect(fetchDaqiAlert).not.toHaveBeenCalled()
    expect(fetchLocationAlert).not.toHaveBeenCalled()
  })
})
