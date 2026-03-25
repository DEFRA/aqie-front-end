import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  buildOAuthForNI,
  fetchAndExtractForecasts,
  routeFetchDataByLocationType
} from './fetch-data-workflow-helpers.js'
import { buildNIOptionsOAuth } from './util-helpers.js'
import { handleTestModeFetchData } from './test-mode-helpers.js'
import { LOCATION_TYPE_NI, LOCATION_TYPE_UK } from '../../../data/constants.js'

vi.mock('./util-helpers.js', () => ({
  buildNIOptionsOAuth: vi.fn()
}))

vi.mock('./test-mode-helpers.js', () => ({
  handleTestModeFetchData: vi.fn()
}))

vi.mock('../../../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }))
}))

describe('fetch-data-workflow-helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('buildOAuthForNI', () => {
    it('returns null for non-NI location types', async () => {
      const result = await buildOAuthForNI(LOCATION_TYPE_UK, {}, {})
      expect(result).toBe(null)
      expect(buildNIOptionsOAuth).not.toHaveBeenCalled()
    })

    it('builds OAuth options for NI location type', async () => {
      buildNIOptionsOAuth.mockResolvedValue({ optionsOAuth: { a: 1 } })
      const deps = {
        isMockEnabled: vi.fn().mockReturnValue(false),
        refreshOAuthToken: vi.fn()
      }

      const result = await buildOAuthForNI(LOCATION_TYPE_NI, deps, {
        path: '/location'
      })

      expect(result).toEqual({ a: 1 })
      expect(buildNIOptionsOAuth).toHaveBeenCalled()
    })
  })

  describe('fetchAndExtractForecasts', () => {
    it('extracts forecast summary when deps logger is available', async () => {
      const deps = {
        fetchForecasts: vi.fn().mockResolvedValue({
          'forecast-summary': { issue_date: '2026-03-21', today: null }
        }),
        logger: {
          info: vi.fn()
        }
      }

      const result = await fetchAndExtractForecasts(
        deps,
        { path: '/x', info: { id: 'abc' } },
        { custom: true }
      )

      expect(result.getDailySummary.issue_date).toBe('2026-03-21')
      expect(deps.fetchForecasts).toHaveBeenCalledWith({
        custom: true,
        request: { path: '/x', info: { id: 'abc' } }
      })
    })

    it('falls back to default summary when forecast-summary is missing', async () => {
      const deps = {
        fetchForecasts: vi.fn().mockResolvedValue({ unexpected: true }),
        logger: {
          info: vi.fn()
        }
      }

      const result = await fetchAndExtractForecasts(deps, {}, {})

      expect(result.getDailySummary).toEqual({ today: null })
    })

    it('falls back to module logger when deps logger info is unavailable', async () => {
      const deps = {
        fetchForecasts: vi.fn().mockResolvedValue({
          'forecast-summary': { today: null }
        }),
        logger: {}
      }

      const result = await fetchAndExtractForecasts(deps, {}, {})

      expect(result.getDailySummary).toEqual({ today: null })
    })
  })

  describe('routeFetchDataByLocationType', () => {
    it('uses test-mode handler when test mode is enabled', async () => {
      handleTestModeFetchData.mockResolvedValue({ mode: 'test' })
      const deps = {
        isTestMode: vi.fn().mockReturnValue(true),
        handleUKLocationData: vi.fn(),
        handleNILocationData: vi.fn(),
        logger: { error: vi.fn() },
        errorResponse: vi.fn()
      }

      const result = await routeFetchDataByLocationType({
        locationType: LOCATION_TYPE_UK,
        userLocation: 'London',
        searchTerms: 'London',
        secondSearchTerm: 'Westminster',
        optionsOAuth: {},
        deps,
        diRequest: { path: '/x' },
        getDailySummary: { today: null },
        getForecasts: { 'forecast-summary': { today: null } },
        diOverrides: { a: 1 }
      })

      expect(result).toEqual({ mode: 'test' })
      expect(handleTestModeFetchData).toHaveBeenCalled()
    })

    it('routes UK location via 2-argument handleUKLocationData signature', async () => {
      const deps = {
        isTestMode: vi.fn().mockReturnValue(false),
        handleUKLocationData: vi.fn(async () => ({ results: ['uk'] })),
        handleNILocationData: vi.fn(),
        buildUKLocationFilters: vi.fn(),
        combineUKSearchTerms: vi.fn(),
        isValidFullPostcodeUK: vi.fn(),
        isValidPartialPostcodeUK: vi.fn(),
        buildUKApiUrl: vi.fn(),
        shouldCallUKApi: vi.fn().mockReturnValue(true),
        config: {},
        overrides: {},
        logger: { error: vi.fn() },
        errorResponse: vi.fn()
      }

      const result = await routeFetchDataByLocationType({
        locationType: LOCATION_TYPE_UK,
        userLocation: 'London',
        searchTerms: 'London',
        secondSearchTerm: 'Westminster',
        optionsOAuth: null,
        deps,
        diRequest: { query: {} },
        getDailySummary: { today: null },
        getForecasts: { 'forecast-summary': { today: null } },
        diOverrides: { traceId: '1' }
      })

      expect(result.getOSPlaces).toEqual({ results: ['uk'] })
      expect(deps.handleUKLocationData).toHaveBeenCalledWith(
        'London',
        expect.objectContaining({
          searchTerms: 'London',
          secondSearchTerm: 'Westminster'
        })
      )
    })

    it('routes UK location via legacy 4-argument handleUKLocationData signature', async () => {
      const legacyHandleUKLocationData = async function legacy(
        userLocation,
        searchTerms,
        secondSearchTerm,
        di
      ) {
        return { results: [userLocation, searchTerms, secondSearchTerm, !!di] }
      }

      const deps = {
        isTestMode: vi.fn().mockReturnValue(false),
        handleUKLocationData: legacyHandleUKLocationData,
        handleNILocationData: vi.fn(),
        buildUKLocationFilters: vi.fn(),
        combineUKSearchTerms: vi.fn(),
        isValidFullPostcodeUK: vi.fn(),
        isValidPartialPostcodeUK: vi.fn(),
        buildUKApiUrl: vi.fn(),
        shouldCallUKApi: vi.fn().mockReturnValue(true),
        config: {},
        overrides: {},
        logger: { error: vi.fn() },
        errorResponse: vi.fn()
      }

      const result = await routeFetchDataByLocationType({
        locationType: LOCATION_TYPE_UK,
        userLocation: 'Leeds',
        searchTerms: 'Leeds',
        secondSearchTerm: 'Centre',
        optionsOAuth: null,
        deps,
        diRequest: {},
        getDailySummary: {},
        getForecasts: {},
        diOverrides: {}
      })

      expect(result.getOSPlaces).toEqual({
        results: ['Leeds', 'Leeds', 'Centre', true]
      })
    })

    it('routes NI location and returns NI places', async () => {
      const deps = {
        isTestMode: vi.fn().mockReturnValue(false),
        handleUKLocationData: vi.fn(),
        handleNILocationData: vi.fn().mockResolvedValue({ results: ['ni'] }),
        overrides: {},
        logger: { error: vi.fn() },
        errorResponse: vi.fn()
      }

      const result = await routeFetchDataByLocationType({
        locationType: LOCATION_TYPE_NI,
        userLocation: 'Belfast',
        searchTerms: 'Belfast',
        secondSearchTerm: 'BT1',
        optionsOAuth: { token: 'abc' },
        deps,
        diRequest: { info: { id: '123' } },
        getDailySummary: { today: null },
        getForecasts: {},
        diOverrides: {}
      })

      expect(result.getNIPlaces).toEqual({ results: ['ni'] })
      expect(deps.handleNILocationData).toHaveBeenCalledWith(
        'Belfast',
        { token: 'abc' },
        expect.objectContaining({
          searchTerms: 'Belfast',
          secondSearchTerm: 'BT1'
        })
      )
    })

    it('returns bad request response for unsupported location type', async () => {
      const deps = {
        isTestMode: vi.fn().mockReturnValue(false),
        handleUKLocationData: vi.fn(),
        handleNILocationData: vi.fn(),
        logger: { error: vi.fn() },
        errorResponse: vi.fn().mockReturnValue({ error: true, statusCode: 400 })
      }

      const result = await routeFetchDataByLocationType({
        locationType: 'INVALID',
        userLocation: 'X',
        searchTerms: 'X',
        secondSearchTerm: '',
        optionsOAuth: null,
        deps,
        diRequest: {},
        getDailySummary: {},
        getForecasts: {},
        diOverrides: {}
      })

      expect(result).toEqual({ error: true, statusCode: 400 })
      expect(deps.errorResponse).toHaveBeenCalledWith(
        'Unsupported location type provided',
        400
      )
    })
  })
})
