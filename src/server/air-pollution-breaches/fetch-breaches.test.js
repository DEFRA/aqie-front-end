import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  fetchBreaches,
  groupActiveByRegion,
  applyOffsetToTimestamp
} from './fetch-breaches.js'
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

const makeActiveBreach = (
  pollutantName = 'ozone (o3)',
  minsAgo = 120,
  samplingId = undefined,
  concentration = 155.3
) => ({
  ...(samplingId !== undefined ? { 'sampling-id': samplingId } : {}),
  'pollutant-name': pollutantName,
  region: 'Test Region',
  'monitoring-station-name': 'Test Station',
  'alert-started': new Date(Date.now() - minsAgo * 60 * 1000).toISOString(),
  'active-breaches': true,
  concentration
})

const makePastBreach = (
  pollutantName = 'ozone (o3)',
  concentration = 155.3
) => ({
  'pollutant-name': pollutantName,
  region: 'Test Region',
  'monitoring-station-name': 'Test Station',
  'alert-started': new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  'active-breaches': false,
  concentration
})

describe('fetchBreaches', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return empty arrays and apiError when status is not 200', async () => {
    catchFetchError.mockResolvedValue([404, null])
    const result = await fetchBreaches('en')
    expect(result).toEqual({
      activeBreaches: [],
      pastBreaches: [],
      apiError: true
    })
  })

  it('should return empty arrays and apiError when data is not an array', async () => {
    catchFetchError.mockResolvedValue([200, { error: 'unexpected' }])
    const result = await fetchBreaches('en')
    expect(result).toEqual({
      activeBreaches: [],
      pastBreaches: [],
      apiError: true
    })
  })

  it('should return empty arrays and apiError when data is null', async () => {
    catchFetchError.mockResolvedValue([200, null])
    const result = await fetchBreaches('en')
    expect(result).toEqual({
      activeBreaches: [],
      pastBreaches: [],
      apiError: true
    })
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

  describe('concentration mapping', () => {
    it('should map concentration onto an active breach', async () => {
      catchFetchError.mockResolvedValue([
        200,
        [makeActiveBreach('ozone (o3)', 120, undefined, 230)]
      ])
      const result = await fetchBreaches('en')
      expect(result.activeBreaches[0].concentration).toBe(230)
    })

    it('should map concentration onto a past breach', async () => {
      catchFetchError.mockResolvedValue([
        200,
        [makePastBreach('ozone (o3)', 230)]
      ])
      const result = await fetchBreaches('en')
      expect(result.pastBreaches[0].concentration).toBe(230)
    })

    it('should use the latest concentration when multiple entries share a sampling-id', async () => {
      catchFetchError.mockResolvedValue([
        200,
        [
          makeActiveBreach('ozone (o3)', 120, 'abc', 100),
          makeActiveBreach('ozone (o3)', 60, 'abc', 200)
        ]
      ])
      const result = await fetchBreaches('en')
      expect(result.activeBreaches[0].concentration).toBe(200)
    })
  })

  describe('alertStartedText formatting', () => {
    it('should show minutes ago for alerts less than 1 hour old', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'))
      catchFetchError.mockResolvedValue([
        200,
        [makeActiveBreach('ozone (o3)', 30)]
      ])
      const result = await fetchBreaches('en')
      expect(result.activeBreaches[0].alertStartedText).toMatch(/minute/)
    })

    it('should use singular "minute" for exactly 1 minute ago', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'))
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
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'))
      catchFetchError.mockResolvedValue([
        200,
        [makeActiveBreach('ozone (o3)', 120)]
      ])
      const result = await fetchBreaches('en')
      expect(result.activeBreaches[0].alertStartedText).toMatch(/hour/)
    })

    it('should use singular "hour" for exactly 1 hour ago', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'))
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

  describe('sampling-id grouping', () => {
    it('groups two entries with the same sampling-id into one active breach', async () => {
      catchFetchError.mockResolvedValue([
        200,
        [
          makeActiveBreach('ozone (o3)', 120, '12345'),
          makeActiveBreach('ozone (o3)', 60, '12345')
        ]
      ])
      const result = await fetchBreaches('en')
      expect(result.activeBreaches).toHaveLength(1)
    })

    it('uses the earliest alert-started as alertStartedText', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'))
      catchFetchError.mockResolvedValue([
        200,
        [
          makeActiveBreach('ozone (o3)', 120, '12345'),
          makeActiveBreach('ozone (o3)', 60, '12345')
        ]
      ])
      const result = await fetchBreaches('en')
      expect(result.activeBreaches[0].alertStartedText).toMatch(
        /About 2 hours ago/
      )
    })

    it('sets lastUpdatedText to the most recent alert-started', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'))
      catchFetchError.mockResolvedValue([
        200,
        [
          makeActiveBreach('ozone (o3)', 120, '12345'),
          makeActiveBreach('ozone (o3)', 60, '12345')
        ]
      ])
      const result = await fetchBreaches('en')
      expect(result.activeBreaches[0].lastUpdatedText).toMatch(
        /About 1 hour ago/
      )
    })

    it('updates lastUpdatedText on a 3rd entry with the most recent time', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'))
      catchFetchError.mockResolvedValue([
        200,
        [
          makeActiveBreach('ozone (o3)', 180, '12345'),
          makeActiveBreach('ozone (o3)', 120, '12345'),
          makeActiveBreach('ozone (o3)', 60, '12345')
        ]
      ])
      const result = await fetchBreaches('en')
      expect(result.activeBreaches).toHaveLength(1)
      expect(result.activeBreaches[0].alertStartedText).toMatch(
        /About 3 hours ago/
      )
      expect(result.activeBreaches[0].lastUpdatedText).toMatch(
        /About 1 hour ago/
      )
    })

    it('does not set lastUpdatedText for a single entry', async () => {
      catchFetchError.mockResolvedValue([
        200,
        [makeActiveBreach('ozone (o3)', 120, '12345')]
      ])
      const result = await fetchBreaches('en')
      expect(result.activeBreaches[0].lastUpdatedText).toBeUndefined()
    })

    it('keeps entries with different sampling-ids as separate breaches', async () => {
      catchFetchError.mockResolvedValue([
        200,
        [
          makeActiveBreach('ozone (o3)', 120, '12345'),
          makeActiveBreach('sulphur dioxide (so2)', 120, '23456')
        ]
      ])
      const result = await fetchBreaches('en')
      expect(result.activeBreaches).toHaveLength(2)
    })

    it('keeps entries without sampling-id as separate breaches', async () => {
      catchFetchError.mockResolvedValue([
        200,
        [
          makeActiveBreach('ozone (o3)', 120),
          makeActiveBreach('ozone (o3)', 60)
        ]
      ])
      const result = await fetchBreaches('en')
      expect(result.activeBreaches).toHaveLength(2)
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

describe('applyOffsetToTimestamp', () => {
  it('returns null/undefined as-is', () => {
    expect(applyOffsetToTimestamp(null)).toBeNull()
    expect(applyOffsetToTimestamp(undefined)).toBeUndefined()
    expect(applyOffsetToTimestamp('')).toBe('')
  })

  it('returns a Z-suffix timestamp unchanged', () => {
    expect(applyOffsetToTimestamp('2026-08-03T09:00:00Z')).toBe(
      '2026-08-03T09:00:00Z'
    )
  })

  it('returns a +00:00 offset timestamp unchanged', () => {
    expect(applyOffsetToTimestamp('2026-08-03T09:00:00+00:00')).toBe(
      '2026-08-03T09:00:00+00:00'
    )
  })

  it('adds a +01:00 offset to the time', () => {
    expect(applyOffsetToTimestamp('2026-08-03T09:00:00+01:00')).toBe(
      '2026-08-03T10:00:00Z'
    )
  })

  it('adds a +05:30 offset to the time', () => {
    expect(applyOffsetToTimestamp('2026-08-03T09:00:00+05:30')).toBe(
      '2026-08-03T14:30:00Z'
    )
  })

  it('subtracts a negative offset from the time', () => {
    expect(applyOffsetToTimestamp('2026-08-03T09:00:00-05:00')).toBe(
      '2026-08-03T04:00:00Z'
    )
  })

  it('handles midnight rollover correctly', () => {
    expect(applyOffsetToTimestamp('2026-08-03T23:00:00+02:00')).toBe(
      '2026-08-04T01:00:00Z'
    )
  })
})

describe('groupActiveByRegion', () => {
  const makeBreach = (region, monitoringLocation = 'Test Station') => ({
    region,
    monitoringLocation,
    pollutantName: 'Ozone',
    pollutantLink: '/pollutants/ozone?lang=en',
    alertStartedText: 'About 2 hours ago'
  })

  it('groups breaches from the same region under one entry', () => {
    const breaches = [
      makeBreach('North West', 'Wigan Centre'),
      makeBreach('North West', 'Manchester Piccadilly')
    ]
    const result = groupActiveByRegion(breaches)
    expect(result).toHaveLength(1)
    expect(result[0].region).toBe('North West')
    expect(result[0].breaches).toHaveLength(2)
  })

  it('keeps breaches from different regions as separate entries', () => {
    const breaches = [
      makeBreach('North West', 'Wigan Centre'),
      makeBreach('Eastern', 'Borehamwood')
    ]
    const result = groupActiveByRegion(breaches)
    expect(result).toHaveLength(2)
  })

  it('returns the correct region names', () => {
    const breaches = [makeBreach('North West'), makeBreach('Eastern')]
    const result = groupActiveByRegion(breaches)
    expect(result.map((r) => r.region)).toEqual(['North West', 'Eastern'])
  })

  it('preserves order of first appearance for regions', () => {
    const breaches = [
      makeBreach('Eastern'),
      makeBreach('North West'),
      makeBreach('Eastern')
    ]
    const result = groupActiveByRegion(breaches)
    expect(result[0].region).toBe('Eastern')
    expect(result[1].region).toBe('North West')
  })

  it('returns an empty array when given an empty array', () => {
    expect(groupActiveByRegion([])).toEqual([])
  })

  it('wraps a single breach in a region group', () => {
    const result = groupActiveByRegion([makeBreach('Highlands and Islands')])
    expect(result).toHaveLength(1)
    expect(result[0].breaches).toHaveLength(1)
  })
})
