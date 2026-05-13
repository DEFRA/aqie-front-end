import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchBreaches } from './fetch-breaches.js'
import { catchFetchError } from '../common/helpers/catch-fetch-error.js'
import { buildBackendApiFetchOptions } from '../common/helpers/backend-api-helper.js'

vi.mock('../../config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'notify.alertBackendBaseUrl') return 'https://api.example.com'
      if (key === 'notify.breachesPath') return '/aqsr-alert'
      return ''
    })
  }
}))

vi.mock('../common/helpers/catch-fetch-error.js', () => ({
  catchFetchError: vi.fn()
}))

vi.mock('../common/helpers/backend-api-helper.js', () => ({
  buildBackendApiFetchOptions: vi.fn().mockReturnValue({
    url: 'https://api.example.com/aqsr-alert',
    fetchOptions: { method: 'GET' }
  })
}))

const makeActiveBreach = (pollutantName = 'ozone (o3)', minsAgo = 120) => ({
  'pollutant-name': pollutantName,
  region: 'Test Region',
  'monitoring-station-name': 'Test Station',
  'alert-started': new Date(Date.now() - minsAgo * 60 * 1000).toISOString(),
  'active-breaches': true
})

const makePastBreach = (pollutantName = 'ozone (o3)') => ({
  'pollutant-name': pollutantName,
  region: 'Test Region',
  'monitoring-station-name': 'Test Station',
  'alert-started': new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  'active-breaches': false
})

describe('fetchBreaches', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return empty arrays when status is not 200', async () => {
    catchFetchError.mockResolvedValue([404, null])
    const result = await fetchBreaches('en')
    expect(result).toEqual({ activeBreaches: [], pastBreaches: [] })
  })

  it('should return empty arrays when data is not an array', async () => {
    catchFetchError.mockResolvedValue([200, { error: 'unexpected' }])
    const result = await fetchBreaches('en')
    expect(result).toEqual({ activeBreaches: [], pastBreaches: [] })
  })

  it('should return empty arrays when data is null', async () => {
    catchFetchError.mockResolvedValue([200, null])
    const result = await fetchBreaches('en')
    expect(result).toEqual({ activeBreaches: [], pastBreaches: [] })
  })

  it('should correctly separate active and past breaches', async () => {
    catchFetchError.mockResolvedValue([
      200,
      [makeActiveBreach(), makePastBreach()]
    ])
    const result = await fetchBreaches('en')
    expect(result.activeBreaches).toHaveLength(1)
    expect(result.pastBreaches).toHaveLength(1)
  })

  it('should return only active breaches when all are active', async () => {
    catchFetchError.mockResolvedValue([
      200,
      [makeActiveBreach(), makeActiveBreach()]
    ])
    const result = await fetchBreaches('en')
    expect(result.activeBreaches).toHaveLength(2)
    expect(result.pastBreaches).toHaveLength(0)
  })

  describe('pollutant name mapping', () => {
    const cases = [
      [
        'ozone (o3)',
        'Ozone',
        '/pollutants/ozone?lang=en',
        '/llygryddion/oson/cy?lang=cy'
      ],
      [
        'nitrogen dioxide (no2)',
        'Nitrogen dioxide',
        '/pollutants/nitrogen-dioxide?lang=en',
        '/llygryddion/nitrogen-deuocsid/cy?lang=cy'
      ],
      [
        'sulphur dioxide (so2)',
        'Sulphur dioxide',
        '/pollutants/sulphur-dioxide?lang=en',
        '/llygryddion/sylffwr-deuocsid/cy?lang=cy'
      ],
      [
        'particulate matter (pm2.5)',
        'PM2.5',
        '/pollutants/particulate-matter-25?lang=en',
        '/llygryddion/mater-gronynnol-25/cy?lang=cy'
      ],
      [
        'particulate matter (pm10)',
        'PM10',
        '/pollutants/particulate-matter-10?lang=en',
        '/llygryddion/mater-gronynnol-10/cy?lang=cy'
      ]
    ]

    it.each(cases)(
      'maps "%s" to display name "%s" with correct EN link',
      async (rawName, displayName, enLink) => {
        catchFetchError.mockResolvedValue([200, [makeActiveBreach(rawName)]])
        const result = await fetchBreaches('en')
        expect(result.activeBreaches[0].pollutantName).toBe(displayName)
        expect(result.activeBreaches[0].pollutantLink).toBe(enLink)
      }
    )

    it.each(cases)(
      'maps "%s" to correct CY link when lang is cy',
      async (rawName, _displayName, _enLink, cyLink) => {
        catchFetchError.mockResolvedValue([200, [makeActiveBreach(rawName)]])
        const result = await fetchBreaches('cy')
        expect(result.activeBreaches[0].pollutantLink).toBe(cyLink)
      }
    )

    it('falls back to raw name and # for an unknown pollutant', async () => {
      catchFetchError.mockResolvedValue([
        200,
        [makeActiveBreach('unknown gas')]
      ])
      const result = await fetchBreaches('en')
      expect(result.activeBreaches[0].pollutantName).toBe('unknown gas')
      expect(result.activeBreaches[0].pollutantLink).toBe('#')
    })
  })

  describe('data source', () => {
    it('should use the English data source label for lang en', async () => {
      catchFetchError.mockResolvedValue([200, [makePastBreach()]])
      const result = await fetchBreaches('en')
      expect(result.pastBreaches[0].dataSource).toBe(
        'Automatic Urban and Rural Network (AURN)'
      )
    })

    it('should use the Welsh data source label for lang cy', async () => {
      catchFetchError.mockResolvedValue([200, [makePastBreach()]])
      const result = await fetchBreaches('cy')
      expect(result.pastBreaches[0].dataSource).toBe(
        'Rhwydwaith Awtomatig Trefol a Gwledig (AURN)'
      )
    })
  })

  describe('alertStartedText formatting', () => {
    it('should show minutes ago for alerts less than 1 hour old', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-06-01T12:00:00.000Z'))
      catchFetchError.mockResolvedValue([
        200,
        [makeActiveBreach('ozone (o3)', 30)]
      ])
      const result = await fetchBreaches('en')
      expect(result.activeBreaches[0].alertStartedText).toMatch(/minute/)
    })

    it('should use singular "minute" for exactly 1 minute ago', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-06-01T12:00:00.000Z'))
      catchFetchError.mockResolvedValue([
        200,
        [makeActiveBreach('ozone (o3)', 1)]
      ])
      const result = await fetchBreaches('en')
      expect(result.activeBreaches[0].alertStartedText).toMatch(
        /About 1 minute ago/
      )
    })

    it('should show hours ago for alerts 1 hour or older', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-06-01T12:00:00.000Z'))
      catchFetchError.mockResolvedValue([
        200,
        [makeActiveBreach('ozone (o3)', 120)]
      ])
      const result = await fetchBreaches('en')
      expect(result.activeBreaches[0].alertStartedText).toMatch(/hour/)
    })

    it('should use singular "hour" for exactly 1 hour ago', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-06-01T12:00:00.000Z'))
      catchFetchError.mockResolvedValue([
        200,
        [makeActiveBreach('ozone (o3)', 60)]
      ])
      const result = await fetchBreaches('en')
      expect(result.activeBreaches[0].alertStartedText).toMatch(
        /About 1 hour ago/
      )
    })
  })

  describe('API URL construction', () => {
    it('should call buildBackendApiFetchOptions with the base URL and path', async () => {
      catchFetchError.mockResolvedValue([200, []])
      await fetchBreaches('en', { some: 'request' })
      expect(buildBackendApiFetchOptions).toHaveBeenCalledWith(
        { some: 'request' },
        'https://api.example.com',
        expect.stringContaining('/aqsr-alert?start-date='),
        { method: 'GET' }
      )
    })

    it('should include start-date and end-date in the API path', async () => {
      catchFetchError.mockResolvedValue([200, []])
      await fetchBreaches('en')
      const pathArg = buildBackendApiFetchOptions.mock.calls[0][2]
      expect(pathArg).toMatch(
        /\?start-date=\d{4}-\d{2}-\d{2}&end-date=\d{4}-\d{2}-\d{2}/
      )
    })

    it('should always have start-date earlier than end-date', async () => {
      catchFetchError.mockResolvedValue([200, []])
      await fetchBreaches('en')
      const pathArg = buildBackendApiFetchOptions.mock.calls[0][2]
      const [, startDate] = pathArg.match(/start-date=(\d{4}-\d{2}-\d{2})/)
      const [, endDate] = pathArg.match(/end-date=(\d{4}-\d{2}-\d{2})/)
      expect(new Date(startDate) < new Date(endDate)).toBe(true)
    })
  })
})
