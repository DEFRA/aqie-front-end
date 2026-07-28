import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  fetchBreaches,
  groupActiveByRegion,
  getAdjustedDateTimeParts
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
  samplingId = undefined
) => ({
  ...(samplingId !== undefined ? { 'sampling-id': samplingId } : {}),
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

describe('getAdjustedDateTimeParts', () => {
  it('should add 1 hour when offset is +01:00 (BST)', () => {
    const result = getAdjustedDateTimeParts('2025-01-13T16:00:00+01:00')
    expect(result.time).toBe('5:00pm')
    expect(result.day).toBe('13')
    expect(result.month).toBe('January')
    expect(result.year).toBe('2025')
  })

  it('should not adjust when offset is Z (UTC)', () => {
    const result = getAdjustedDateTimeParts('2025-01-13T16:00:00Z')
    expect(result.time).toBe('4:00pm')
    expect(result.day).toBe('13')
    expect(result.month).toBe('January')
    expect(result.year).toBe('2025')
  })

  it('should handle milliseconds in the date string', () => {
    const result = getAdjustedDateTimeParts('2025-01-13T08:00:00.000Z')
    expect(result.time).toBe('8:00am')
  })

  it('should roll over to the next day when +01:00 pushes past midnight', () => {
    const result = getAdjustedDateTimeParts('2025-01-13T23:30:00+01:00')
    expect(result.time).toBe('12:30am')
    expect(result.day).toBe('14')
    expect(result.month).toBe('January')
    expect(result.year).toBe('2025')
  })

  it('should roll over to the next month when day/hour overflow', () => {
    const result = getAdjustedDateTimeParts('2025-01-31T23:15:00+01:00')
    expect(result.day).toBe('1')
    expect(result.month).toBe('February')
    expect(result.year).toBe('2025')
  })

  it('should format midnight as 12am', () => {
    const result = getAdjustedDateTimeParts('2025-01-13T00:00:00Z')
    expect(result.time).toBe('12:00am')
  })

  it('should format noon as 12pm', () => {
    const result = getAdjustedDateTimeParts('2025-01-13T12:00:00Z')
    expect(result.time).toBe('12:00pm')
  })

  it('should not adjust for offsets other than +01:00', () => {
    const result = getAdjustedDateTimeParts('2025-01-13T14:00:00+02:00')
    expect(result.time).toBe('2:00pm')
  })

  it('should return undefined when date string is missing', () => {
    expect(getAdjustedDateTimeParts(undefined)).toBeUndefined()
    expect(getAdjustedDateTimeParts(null)).toBeUndefined()
    expect(getAdjustedDateTimeParts('')).toBeUndefined()
  })

  it('should return undefined when date string does not match expected pattern', () => {
    expect(getAdjustedDateTimeParts('not-a-date')).toBeUndefined()
  })
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
      vi.setSystemTime(new Date('2024-06-01T12:00:00.000Z'))
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
      vi.setSystemTime(new Date('2024-06-01T12:00:00.000Z'))
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
      vi.setSystemTime(new Date('2024-06-01T12:00:00.000Z'))
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

  describe('date formatting for pastBreaches (manual offset logic)', () => {
    it('should format title/alertPeriodFrom/alertPeriodTo using +01:00 offset (adds 1 hour, carried through to alertPeriodTo)', async () => {
      catchFetchError.mockResolvedValue([
        200,
        [
          {
            'pollutant-name': 'ozone (o3)',
            region: 'Test Region',
            'monitoring-station-name': 'Test Station',
            'alert-started': '2025-01-13T16:00:00+01:00',
            'active-breaches': false
          }
        ]
      ])
      const result = await fetchBreaches('en')
      const breach = result.pastBreaches[0]

      expect(breach.title).toBe('Test Station, Test Region (13 January 2025)')
      expect(breach.alertPeriodFrom).toBe('5:00pm, 13 January 2025')
      // alert-started (already adjusted to 5:00pm) + 24h => same clock time
      // the next day, since the +1h BST adjustment carries through.
      expect(breach.alertPeriodTo).toBe('5:00pm, 14 January 2025')
    })

    it('should format title/alertPeriodFrom/alertPeriodTo using Z (UTC) offset (no adjustment)', async () => {
      catchFetchError.mockResolvedValue([
        200,
        [
          {
            'pollutant-name': 'ozone (o3)',
            region: 'Test Region',
            'monitoring-station-name': 'Test Station',
            'alert-started': '2025-01-13T16:00:00Z',
            'active-breaches': false
          }
        ]
      ])
      const result = await fetchBreaches('en')
      const breach = result.pastBreaches[0]

      expect(breach.title).toBe('Test Station, Test Region (13 January 2025)')
      expect(breach.alertPeriodFrom).toBe('4:00pm, 13 January 2025')
      expect(breach.alertPeriodTo).toBe('4:00pm, 14 January 2025')
    })
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
