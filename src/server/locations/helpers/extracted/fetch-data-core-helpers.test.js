import { beforeEach, describe, expect, it, vi } from 'vitest'

import { config } from '../../../../config/index.js'
import {
  LOCATION_TYPE_NI,
  LOCATION_TYPE_UK,
  STATUS_OK
} from '../../../data/constants.js'
import {
  buildApiOptions,
  ensureForecastSummary,
  getOverrideOrDefault,
  resolveMeasurementsInputs,
  resolveMeasurementsDependencies,
  selectMeasurementsRequestData,
  setupDependencies
} from './fetch-data-core-helpers.js'
import { selectMeasurementsUrlAndOptions } from './api-utils.js'

vi.mock('./api-utils.js', () => ({
  selectMeasurementsUrlAndOptions: vi.fn()
}))

describe('fetch-data-core-helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('buildApiOptions', () => {
    it('returns x-api-key header for perf-test environment', () => {
      vi.spyOn(config, 'get').mockImplementation((key) => {
        if (key === 'cdpXApiKeyPerfTest') {
          return 'perf-key'
        }
        return null
      })

      const result = buildApiOptions({
        app: { config: { env: 'perf-test' } }
      })

      expect(result).toEqual({ headers: { 'x-api-key': 'perf-key' } })
      expect(config.get).toHaveBeenCalledWith('cdpXApiKeyPerfTest')
    })

    it('falls back to empty options when no key is configured', () => {
      vi.spyOn(config, 'get').mockReturnValue(null)

      const result = buildApiOptions({
        app: { config: { env: 'test' } }
      })

      expect(result).toEqual({})
    })

    it('uses default candidate order when env is unknown', () => {
      vi.spyOn(config, 'get').mockImplementation((key) => {
        if (key === 'cdpXApiKeyDev') {
          return 'dev-key'
        }
        return null
      })

      const result = buildApiOptions({ app: { config: { env: 'dev' } } })

      expect(result).toEqual({ headers: { 'x-api-key': 'dev-key' } })
      expect(config.get).toHaveBeenCalledWith('cdpXApiKeyTest')
      expect(config.get).toHaveBeenCalledWith('cdpXApiKeyDev')
    })
  })

  describe('ensureForecastSummary', () => {
    it('adds forecast-summary when missing', () => {
      const forecastData = { anotherKey: true }

      const result = ensureForecastSummary(forecastData)

      expect(result['forecast-summary']).toEqual({ today: null })
      expect(result.anotherKey).toBe(true)
    })

    it('keeps existing forecast-summary unchanged', () => {
      const forecastData = { 'forecast-summary': { today: 'ok' } }

      const result = ensureForecastSummary(forecastData)

      expect(result['forecast-summary']).toEqual({ today: 'ok' })
    })

    it('returns non-object data as-is', () => {
      expect(ensureForecastSummary(null)).toBe(null)
      expect(ensureForecastSummary('value')).toBe('value')
    })
  })

  describe('simple utility helpers', () => {
    it('returns override value when present', () => {
      expect(
        getOverrideOrDefault({ name: 'override' }, 'name', 'fallback')
      ).toBe('override')
    })

    it('returns fallback when override is missing', () => {
      expect(getOverrideOrDefault({}, 'name', 'fallback')).toBe('fallback')
      expect(getOverrideOrDefault(null, 'name', 'fallback')).toBe('fallback')
    })

    it('resolves measurements inputs for legacy signature', () => {
      const diOverride = { test: true }

      const result = resolveMeasurementsInputs(true, diOverride)

      expect(result).toEqual({
        isLegacySignature: true,
        di: diOverride,
        useNewRicardoMeasurementsEnabled: true
      })
    })

    it('resolves measurements inputs for DI object signature', () => {
      const di = { logger: { info: vi.fn() } }

      const result = resolveMeasurementsInputs(di)

      expect(result).toEqual({
        isLegacySignature: false,
        di,
        useNewRicardoMeasurementsEnabled: true
      })
    })
  })

  describe('resolveMeasurementsDependencies', () => {
    it('prefers injected dependencies when provided', () => {
      const customIsTestMode = vi.fn().mockReturnValue(true)
      const deps = resolveMeasurementsDependencies({
        di: {
          logger: { error: vi.fn() },
          config: { get: vi.fn() },
          catchFetchError: vi.fn(),
          optionsEphemeralProtected: { headers: { a: 1 } },
          options: { b: 2 },
          isTestMode: customIsTestMode
        },
        logger: { error: vi.fn() }
      })

      expect(deps.optionsEphemeralProtected).toEqual({ headers: { a: 1 } })
      expect(deps.options).toEqual({ b: 2 })
      expect(deps.isTestMode).toBe(customIsTestMode)
    })

    it('builds default options when injection is missing', () => {
      vi.spyOn(config, 'get').mockReturnValue('fallback-key')
      const deps = resolveMeasurementsDependencies({
        di: {
          request: { app: { config: { env: 'test' } } }
        },
        logger: { error: vi.fn() }
      })

      expect(deps.options).toEqual({})
      expect(deps.optionsEphemeralProtected).toEqual({
        headers: { 'x-api-key': 'fallback-key' }
      })
      expect(typeof deps.isTestMode).toBe('function')
    })
  })

  describe('selectMeasurementsRequestData', () => {
    it('returns selected URL and options on success', () => {
      selectMeasurementsUrlAndOptions.mockReturnValue({
        url: 'https://measurements.test',
        opts: { headers: { a: 'b' } }
      })

      const result = selectMeasurementsRequestData({
        latitude: 51.5,
        longitude: -0.1,
        useNewRicardoMeasurementsEnabled: true,
        deps: {
          config,
          logger: { error: vi.fn() },
          optionsEphemeralProtected: {},
          options: {}
        },
        di: { request: { path: '/x' } },
        isLegacySignature: false
      })

      expect(result).toEqual({
        url: 'https://measurements.test',
        opts: { headers: { a: 'b' } }
      })
    })

    it('rethrows config fail errors in legacy mode', () => {
      selectMeasurementsUrlAndOptions.mockImplementation(() => {
        throw new Error('config fail: broken value')
      })

      expect(() =>
        selectMeasurementsRequestData({
          latitude: 51.5,
          longitude: -0.1,
          useNewRicardoMeasurementsEnabled: true,
          deps: {
            config,
            logger: { error: vi.fn() },
            optionsEphemeralProtected: {},
            options: {}
          },
          di: {},
          isLegacySignature: true
        })
      ).toThrow('config fail: broken value')
    })

    it('logs unexpected errors and returns null in non-legacy mode', () => {
      const logError = vi.fn()
      selectMeasurementsUrlAndOptions.mockImplementation(() => {
        throw new Error('network blow-up')
      })

      const result = selectMeasurementsRequestData({
        latitude: 51.5,
        longitude: -0.1,
        useNewRicardoMeasurementsEnabled: true,
        deps: {
          config,
          logger: { error: logError },
          optionsEphemeralProtected: {},
          options: {}
        },
        di: {},
        isLegacySignature: false
      })

      expect(result).toBe(null)
      expect(logError).toHaveBeenCalledWith(
        'Unexpected error in fetchMeasurements: network blow-up'
      )
    })
  })

  describe('setupDependencies', () => {
    it('builds default dependency map from context', () => {
      const fetchForecasts = vi.fn()
      const logger = { info: vi.fn(), error: vi.fn() }

      const deps = setupDependencies(undefined, { fetchForecasts, logger })

      expect(deps.fetchForecasts).toBe(fetchForecasts)
      expect(deps.logger).toBe(logger)
      expect(deps.locationTypeNi).toBe(LOCATION_TYPE_NI)
      expect(deps.locationTypeUk).toBe(LOCATION_TYPE_UK)
      expect(deps.statusOk).toBe(STATUS_OK)
      expect(typeof deps.refreshOAuthToken).toBe('function')
      expect(typeof deps.validateParams).toBe('function')
    })

    it('respects injected override dependencies', () => {
      const overrideValidateParams = vi.fn()
      const overrideIsTestMode = vi.fn().mockReturnValue(true)
      const overrideShouldCallUKApi = vi.fn().mockReturnValue(false)

      const deps = setupDependencies(
        {
          validateParams: overrideValidateParams,
          isTestMode: overrideIsTestMode,
          shouldCallUKApi: overrideShouldCallUKApi,
          logger: { error: vi.fn() },
          config: { get: vi.fn() }
        },
        { fetchForecasts: vi.fn(), logger: { error: vi.fn() } }
      )

      expect(deps.validateParams).toBe(overrideValidateParams)
      expect(deps.isTestMode).toBe(overrideIsTestMode)
      expect(deps.shouldCallUKApi).toBe(overrideShouldCallUKApi)
    })
  })
})
