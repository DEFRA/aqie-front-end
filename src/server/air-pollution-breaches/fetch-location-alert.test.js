import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchLocationAlert,
  getPollutantDisplayName,
  buildPollutantsText
} from './fetch-location-alert.js'
import { catchFetchError } from '../common/helpers/catch-fetch-error.js'
import { buildBackendApiFetchOptions } from '../common/helpers/backend-api-helper.js'

vi.mock('../common/helpers/catch-fetch-error.js', () => ({
  catchFetchError: vi.fn()
}))

vi.mock('../common/helpers/backend-api-helper.js', () => ({
  buildBackendApiFetchOptions: vi.fn().mockReturnValue({
    url: 'https://mock-api/aqsr-alert?current-day=true&lat=51.48&long=-3.18',
    fetchOptions: {}
  })
}))

vi.mock('../../config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'notify.alertBackendBaseUrl') return 'https://mock-api'
      if (key === 'notify.breachesPath') return '/aqsr-alert'
      return ''
    })
  }
}))

const mockRequest = { query: {} }

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

  it('is case insensitive — handles uppercase variant from API', () => {
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

  it('returns undefined when called with undefined', () => {
    expect(getPollutantDisplayName(undefined)).toBeUndefined()
  })

  it('returns null when called with null', () => {
    expect(getPollutantDisplayName(null)).toBeNull()
  })
})

describe('buildPollutantsText', () => {
  it('returns the single pollutant name as-is', () => {
    expect(buildPollutantsText(['Ozone'])).toBe('Ozone')
  })

  it('joins two pollutants with "and"', () => {
    expect(buildPollutantsText(['Ozone', 'Nitrogen dioxide'])).toBe(
      'Ozone and Nitrogen dioxide'
    )
  })

  it('joins three pollutants with commas and "and" before the last', () => {
    expect(
      buildPollutantsText(['Ozone', 'Nitrogen dioxide', 'Sulphur dioxide'])
    ).toBe('Ozone, Nitrogen dioxide and Sulphur dioxide')
  })

  it('joins four pollutants with commas and "and" before the last', () => {
    expect(
      buildPollutantsText([
        'Ozone',
        'Nitrogen dioxide',
        'Sulphur dioxide',
        'PM2.5'
      ])
    ).toBe('Ozone, Nitrogen dioxide, Sulphur dioxide and PM2.5')
  })
})

describe('fetchLocationAlert', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    buildBackendApiFetchOptions.mockReturnValue({
      url: 'https://mock-api/aqsr-alert?current-day=true&lat=51.48&long=-3.18',
      fetchOptions: {}
    })
  })

  it('returns null when lat is missing', async () => {
    const result = await fetchLocationAlert(
      null,
      -3.18,
      'bristol',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result).toBeNull()
    expect(catchFetchError).not.toHaveBeenCalled()
  })

  it('returns null when lon is missing', async () => {
    const result = await fetchLocationAlert(
      51.48,
      null,
      'bristol',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result).toBeNull()
    expect(catchFetchError).not.toHaveBeenCalled()
  })

  it('returns null on non-200 status', async () => {
    catchFetchError.mockResolvedValue([500, null])
    const result = await fetchLocationAlert(
      51.48,
      -3.18,
      'bristol',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result).toBeNull()
  })

  it('returns null when response is not an array', async () => {
    catchFetchError.mockResolvedValue([200, null])
    const result = await fetchLocationAlert(
      51.48,
      -3.18,
      'bristol',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result).toBeNull()
  })

  it('returns null when response is an empty array', async () => {
    catchFetchError.mockResolvedValue([200, []])
    const result = await fetchLocationAlert(
      51.48,
      -3.18,
      'bristol',
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
        { 'active-breaches': false, 'pollutant-name': 'ozone (o3)' },
        { 'active-breaches': false, 'pollutant-name': 'nitrogen dioxide (no2)' }
      ]
    ])
    const result = await fetchLocationAlert(
      51.48,
      -3.18,
      'bristol',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result).toBeNull()
  })

  it('returns pollutantsText and breachesPageUrl for a single active breach', async () => {
    catchFetchError.mockResolvedValue([
      200,
      [
        {
          'active-breaches': true,
          'pollutant-name': 'ozone (O3)',
          'monitoring-station-name': 'Bristol Centre',
          region: 'South West',
          'alert-started': '2026-05-14T10:00:00.000Z'
        }
      ]
    ])
    const result = await fetchLocationAlert(
      51.48,
      -3.18,
      'bristol-city',
      'Bristol, City of Bristol',
      'en',
      mockRequest
    )
    expect(result.pollutantsText).toBe('ozone')
    expect(result.breachesPageUrl).toBe(
      '/air-pollution-breaches?lang=en&locationId=bristol-city&locationName=Bristol%2C%20City%20of%20Bristol'
    )
  })

  it('returns joined pollutant names for two active breaches', async () => {
    catchFetchError.mockResolvedValue([
      200,
      [
        { 'active-breaches': true, 'pollutant-name': 'ozone (O3)' },
        { 'active-breaches': true, 'pollutant-name': 'nitrogen dioxide (NO2)' }
      ]
    ])
    const result = await fetchLocationAlert(
      51.48,
      -3.18,
      'bristol-city',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result.pollutantsText).toBe('ozone and nitrogen dioxide')
  })

  it('returns pollutant names joined with commas and "and" for three active breaches', async () => {
    catchFetchError.mockResolvedValue([
      200,
      [
        { 'active-breaches': true, 'pollutant-name': 'ozone (O3)' },
        { 'active-breaches': true, 'pollutant-name': 'nitrogen dioxide (NO2)' },
        { 'active-breaches': true, 'pollutant-name': 'sulphur dioxide (SO2)' }
      ]
    ])
    const result = await fetchLocationAlert(
      51.48,
      -3.18,
      'bristol-city',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result.pollutantsText).toBe(
      'ozone, nitrogen dioxide and sulphur dioxide'
    )
  })

  it('deduplicates pollutant names when multiple records have the same pollutant', async () => {
    catchFetchError.mockResolvedValue([
      200,
      [
        { 'active-breaches': true, 'pollutant-name': 'ozone (O3)' },
        { 'active-breaches': true, 'pollutant-name': 'ozone (O3)' }
      ]
    ])
    const result = await fetchLocationAlert(
      51.48,
      -3.18,
      'bristol-city',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result.pollutantsText).toBe('ozone')
  })

  it('only includes active breaches and ignores inactive ones', async () => {
    catchFetchError.mockResolvedValue([
      200,
      [
        { 'active-breaches': true, 'pollutant-name': 'ozone (O3)' },
        { 'active-breaches': false, 'pollutant-name': 'nitrogen dioxide (NO2)' }
      ]
    ])
    const result = await fetchLocationAlert(
      51.48,
      -3.18,
      'bristol-city',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result.pollutantsText).toBe('ozone')
  })

  it('includes lang in the breachesPageUrl', async () => {
    catchFetchError.mockResolvedValue([
      200,
      [{ 'active-breaches': true, 'pollutant-name': 'ozone (O3)' }]
    ])
    const result = await fetchLocationAlert(
      51.48,
      -3.18,
      'bristol-city',
      'Bristol',
      'en',
      mockRequest
    )
    expect(result.breachesPageUrl).toContain('lang=en')
  })

  it('calls the API with lat and long in the path', async () => {
    catchFetchError.mockResolvedValue([200, []])
    await fetchLocationAlert(
      51.48178,
      -3.17625,
      'bristol-city',
      'Bristol',
      'en',
      mockRequest
    )
    expect(buildBackendApiFetchOptions).toHaveBeenCalledWith(
      mockRequest,
      'https://mock-api',
      '/aqsr-alert?current-day=true&lat=51.48178&long=-3.17625',
      { method: 'GET' }
    )
  })

  it('propagates errors thrown by catchFetchError (caller must catch)', async () => {
    catchFetchError.mockRejectedValue(new Error('network timeout'))
    await expect(
      fetchLocationAlert(
        51.48,
        -3.18,
        'bristol-city',
        'Bristol',
        'en',
        mockRequest
      )
    ).rejects.toThrow('network timeout')
  })

  it('returns mock result from mockPollutantAlert query param when mocks enabled', async () => {
    const request = { query: { mockPollutantAlert: 'ozone,PM2.5' } }
    const result = await fetchLocationAlert(
      51.48,
      -3.18,
      'bristol-city',
      'Bristol',
      'en',
      request
    )

    expect(catchFetchError).not.toHaveBeenCalled()
    expect(result.pollutantsText).toBe('ozone and PM2.5')
    expect(result.breachesPageUrl).toContain('lang=en')
    expect(result.breachesPageUrl).toContain('locationId=bristol-city')
  })

  it('handles a single pollutant in mockPollutantAlert', async () => {
    const request = { query: { mockPollutantAlert: 'nitrogen dioxide' } }
    const result = await fetchLocationAlert(
      51.48,
      -3.18,
      'bristol-city',
      'Bristol',
      'en',
      request
    )

    expect(result.pollutantsText).toBe('nitrogen dioxide')
  })
})
