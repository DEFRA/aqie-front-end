import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchDaqiAlert,
  getPollutantDisplayName,
  getPollutantHref,
  getReadableBand,
  buildPollutantsText
} from './fetch-daqi-alert.js'
import { catchFetchError } from '../common/helpers/catch-fetch-error.js'
import { buildBackendApiFetchOptions } from '../common/helpers/backend-api-helper.js'

vi.mock('../common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}))

vi.mock('../common/helpers/catch-fetch-error.js', () => ({
  catchFetchError: vi.fn()
}))

vi.mock('../common/helpers/backend-api-helper.js', () => ({
  buildBackendApiFetchOptions: vi.fn().mockReturnValue({
    url: 'https://mock-api/daqi-alert?lat=51.48&long=-3.18',
    fetchOptions: {}
  })
}))

vi.mock('../../config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'notify.alertBackendBaseUrl') return 'https://mock-api'
      if (key === 'notify.daqiAlertPath') return '/daqi-alert'
      return ''
    })
  }
}))

const mockRequest = { query: {} }

const SINGLE_STATION_ALERT = [
  {
    'active-breaches': true,
    'pollutant-name': 'ozone (O3)',
    daqi: 7,
    samplingPointId: 77162,
    siteId: 'UKA00819',
    'alert-started': '2026-06-09T07:01:02.722Z'
  }
]

const MULTI_POLLUTANT_MULTI_STATION_ALERT = [
  {
    'active-breaches': true,
    'pollutant-name': 'ozone (O3)',
    daqi: 7,
    samplingPointId: 77162,
    siteId: 'UKA00819',
    'alert-started': '2026-06-09T07:01:02.722Z'
  },
  {
    'active-breaches': true,
    'pollutant-name': 'sulphur dioxide (SO2)',
    daqi: 9,
    samplingPointId: 1258,
    siteId: 'UKA00482',
    'alert-started': '2026-06-09T07:01:02.722Z'
  },
  {
    'active-breaches': true,
    'pollutant-name': 'nitrogen dioxide (NO2)',
    daqi: 8,
    samplingPointId: 12401,
    siteId: 'UKA00524',
    'alert-started': '2026-06-09T01:01:02.722Z'
  }
]

describe('getPollutantDisplayName', () => {
  it.each([
    ['ozone (o3)', 'ozone'],
    ['nitrogen dioxide (no2)', 'nitrogen dioxide'],
    ['sulphur dioxide (so2)', 'sulphur dioxide'],
    ['particulate matter (pm2.5)', 'PM2.5'],
    ['particulate matter (pm10)', 'PM10']
  ])('maps "%s" to "%s"', (raw, expected) => {
    expect(getPollutantDisplayName(raw)).toBe(expected)
  })

  it('is case insensitive', () => {
    expect(getPollutantDisplayName('ozone (O3)')).toBe('ozone')
    expect(getPollutantDisplayName('Nitrogen Dioxide (NO2)')).toBe(
      'nitrogen dioxide'
    )
  })

  it('returns the raw name when pollutant is not in the map', () => {
    expect(getPollutantDisplayName('carbon monoxide (CO)')).toBe(
      'carbon monoxide (CO)'
    )
  })

  it('returns null when called with null', () => {
    expect(getPollutantDisplayName(null)).toBeNull()
  })
})

describe('getPollutantHref', () => {
  it.each([
    ['ozone (o3)', '/pollutants/ozone'],
    ['sulphur dioxide (so2)', '/pollutants/sulphur-dioxide'],
    ['nitrogen dioxide (no2)', '/pollutants/nitrogen-dioxide'],
    ['particulate matter (pm2.5)', '/pollutants/particulate-matter-25'],
    ['particulate matter (pm10)', '/pollutants/particulate-matter-10']
  ])('maps "%s" to "%s"', (raw, expected) => {
    expect(getPollutantHref(raw)).toBe(expected)
  })

  it('is case insensitive', () => {
    expect(getPollutantHref('ozone (O3)')).toBe('/pollutants/ozone')
  })

  it('returns "#" for an unknown pollutant', () => {
    expect(getPollutantHref('carbon monoxide (CO)')).toBe('#')
  })

  it('returns "#" for null', () => {
    expect(getPollutantHref(null)).toBe('#')
  })
})

describe('getReadableBand', () => {
  it('returns "High" for DAQI values 7, 8, 9', () => {
    expect(getReadableBand(7)).toBe('High')
    expect(getReadableBand(8)).toBe('High')
    expect(getReadableBand(9)).toBe('High')
  })

  it('returns "Very high" for DAQI value 10', () => {
    expect(getReadableBand(10)).toBe('Very high')
  })
})

describe('buildPollutantsText', () => {
  it('returns a single pollutant name as-is', () => {
    expect(buildPollutantsText(['ozone'])).toBe('ozone')
  })

  it('joins two pollutants with "and"', () => {
    expect(buildPollutantsText(['ozone', 'sulphur dioxide'])).toBe(
      'ozone and sulphur dioxide'
    )
  })

  it('joins three pollutants with commas and "and" before the last', () => {
    expect(
      buildPollutantsText(['ozone', 'sulphur dioxide', 'nitrogen dioxide'])
    ).toBe('ozone, sulphur dioxide and nitrogen dioxide')
  })

  it('joins four pollutants correctly', () => {
    expect(
      buildPollutantsText([
        'ozone',
        'sulphur dioxide',
        'nitrogen dioxide',
        'PM10'
      ])
    ).toBe('ozone, sulphur dioxide, nitrogen dioxide and PM10')
  })

  it('joins five pollutants correctly', () => {
    expect(
      buildPollutantsText([
        'ozone',
        'sulphur dioxide',
        'nitrogen dioxide',
        'PM10',
        'PM2.5'
      ])
    ).toBe('ozone, sulphur dioxide, nitrogen dioxide, PM10 and PM2.5')
  })
})

describe('fetchDaqiAlert', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    buildBackendApiFetchOptions.mockReturnValue({
      url: 'https://mock-api/daqi-alert?lat=51.48&long=-3.18',
      fetchOptions: {}
    })
  })

  it('returns null when lat is missing', async () => {
    const result = await fetchDaqiAlert(
      null,
      -3.18,
      'loc1',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result).toBeNull()
    expect(catchFetchError).not.toHaveBeenCalled()
  })

  it('returns null when lon is missing', async () => {
    const result = await fetchDaqiAlert(
      51.48,
      null,
      'loc1',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result).toBeNull()
    expect(catchFetchError).not.toHaveBeenCalled()
  })

  it('returns null on non-200 status', async () => {
    catchFetchError.mockResolvedValue([500, null])
    const result = await fetchDaqiAlert(
      51.48,
      -3.18,
      'loc1',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result).toBeNull()
  })

  it('returns null when response is not an array', async () => {
    catchFetchError.mockResolvedValue([200, null])
    const result = await fetchDaqiAlert(
      51.48,
      -3.18,
      'loc1',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result).toBeNull()
  })

  it('returns null when response is an empty array', async () => {
    catchFetchError.mockResolvedValue([200, []])
    const result = await fetchDaqiAlert(
      51.48,
      -3.18,
      'loc1',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result).toBeNull()
  })

  it('returns null when all items have active-breaches: false', async () => {
    catchFetchError.mockResolvedValue([
      200,
      [
        {
          'active-breaches': false,
          'pollutant-name': 'ozone (O3)',
          daqi: 7,
          siteId: 'UKA00819'
        }
      ]
    ])
    const result = await fetchDaqiAlert(
      51.48,
      -3.18,
      'loc1',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result).toBeNull()
  })

  it('returns correct shape for a single active alert', async () => {
    catchFetchError.mockResolvedValue([200, SINGLE_STATION_ALERT])
    const result = await fetchDaqiAlert(
      51.48,
      -3.18,
      'loc1',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result).toEqual({
      highestDaqi: 7,
      highestReadableBand: 'High',
      isMultipleStations: false,
      pollutants: [{ name: 'ozone', href: '/pollutants/ozone' }],
      pollutantsText: 'ozone'
    })
  })

  it('uses the highest daqi value across multiple pollutants', async () => {
    catchFetchError.mockResolvedValue([
      200,
      MULTI_POLLUTANT_MULTI_STATION_ALERT
    ])
    const result = await fetchDaqiAlert(
      51.48,
      -3.18,
      'loc1',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result.highestDaqi).toBe(9)
    expect(result.highestReadableBand).toBe('High')
  })

  it('sets isMultipleStations to true when alerts come from different siteIds', async () => {
    catchFetchError.mockResolvedValue([
      200,
      MULTI_POLLUTANT_MULTI_STATION_ALERT
    ])
    const result = await fetchDaqiAlert(
      51.48,
      -3.18,
      'loc1',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result.isMultipleStations).toBe(true)
  })

  it('sets isMultipleStations to false when all alerts share the same siteId', async () => {
    catchFetchError.mockResolvedValue([
      200,
      [
        {
          'active-breaches': true,
          'pollutant-name': 'ozone (O3)',
          daqi: 7,
          siteId: 'UKA00819'
        },
        {
          'active-breaches': true,
          'pollutant-name': 'nitrogen dioxide (NO2)',
          daqi: 8,
          siteId: 'UKA00819'
        }
      ]
    ])
    const result = await fetchDaqiAlert(
      51.48,
      -3.18,
      'loc1',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result.isMultipleStations).toBe(false)
  })

  it('returns "Very high" band when highest daqi is 10', async () => {
    catchFetchError.mockResolvedValue([
      200,
      [
        {
          'active-breaches': true,
          'pollutant-name': 'nitrogen dioxide (NO2)',
          daqi: 10,
          siteId: 'UKA00524'
        }
      ]
    ])
    const result = await fetchDaqiAlert(
      51.48,
      -3.18,
      'loc1',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result.highestDaqi).toBe(10)
    expect(result.highestReadableBand).toBe('Very high')
  })

  it('includes correct hrefs for all five pollutant types', async () => {
    catchFetchError.mockResolvedValue([
      200,
      [
        {
          'active-breaches': true,
          'pollutant-name': 'ozone (O3)',
          daqi: 7,
          siteId: 'A'
        },
        {
          'active-breaches': true,
          'pollutant-name': 'sulphur dioxide (SO2)',
          daqi: 7,
          siteId: 'B'
        },
        {
          'active-breaches': true,
          'pollutant-name': 'nitrogen dioxide (NO2)',
          daqi: 7,
          siteId: 'C'
        },
        {
          'active-breaches': true,
          'pollutant-name': 'particulate matter (PM2.5)',
          daqi: 7,
          siteId: 'D'
        },
        {
          'active-breaches': true,
          'pollutant-name': 'particulate matter (PM10)',
          daqi: 7,
          siteId: 'E'
        }
      ]
    ])
    const result = await fetchDaqiAlert(
      51.48,
      -3.18,
      'loc1',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result.pollutants).toEqual([
      { name: 'ozone', href: '/pollutants/ozone' },
      { name: 'sulphur dioxide', href: '/pollutants/sulphur-dioxide' },
      { name: 'nitrogen dioxide', href: '/pollutants/nitrogen-dioxide' },
      { name: 'PM2.5', href: '/pollutants/particulate-matter-25' },
      { name: 'PM10', href: '/pollutants/particulate-matter-10' }
    ])
    expect(result.pollutantsText).toBe(
      'ozone, sulphur dioxide, nitrogen dioxide, PM2.5 and PM10'
    )
  })

  it('calls the API with current-day, lat and long in the path', async () => {
    catchFetchError.mockResolvedValue([200, []])
    await fetchDaqiAlert(
      51.48178,
      -3.17625,
      'loc1',
      'Bristol',
      'en',
      mockRequest
    )
    expect(buildBackendApiFetchOptions).toHaveBeenCalledWith(
      mockRequest,
      'https://mock-api',
      '/daqi-alert?current-day=true&lat=51.48178&long=-3.17625',
      { method: 'GET' }
    )
  })

  it('propagates errors thrown by catchFetchError', async () => {
    catchFetchError.mockRejectedValue(new Error('network timeout'))
    await expect(
      fetchDaqiAlert(51.48, -3.18, 'loc1', 'Bristol', 'en', mockRequest)
    ).rejects.toThrow('network timeout')
  })

  it('returns mock single-station result when mockDaqiAlert=true and mocks enabled', async () => {
    const request = { query: { mockDaqiAlert: 'true' } }
    const result = await fetchDaqiAlert(
      51.48,
      -3.18,
      'loc1',
      'Bristol',
      'en',
      request
    )

    expect(catchFetchError).not.toHaveBeenCalled()
    expect(result).toMatchObject({
      highestDaqi: 7,
      highestReadableBand: 'High',
      isMultipleStations: false,
      pollutantsText: 'ozone'
    })
    expect(result.pollutants).toHaveLength(1)
    expect(result.pollutants[0].name).toBe('ozone')
  })

  it('returns mock multi-station result when mockDaqiAlert=multi and mocks enabled', async () => {
    const request = { query: { mockDaqiAlert: 'multi' } }
    const result = await fetchDaqiAlert(
      51.48,
      -3.18,
      'loc1',
      'Bristol',
      'en',
      request
    )

    expect(catchFetchError).not.toHaveBeenCalled()
    expect(result.highestDaqi).toBe(10)
    expect(result.highestReadableBand).toBe('Very high')
    expect(result.isMultipleStations).toBe(true)
    expect(result.pollutants).toHaveLength(3)
  })
})
