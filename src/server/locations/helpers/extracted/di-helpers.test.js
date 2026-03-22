import { describe, expect, it, vi } from 'vitest'

import {
  setupFetchForecastsDI,
  setupNILocationDataDI,
  setupUKLocationDataDI
} from './di-helpers.js'

describe('di-helpers', () => {
  describe('setupFetchForecastsDI', () => {
    it('uses injected values when provided', () => {
      const di = {
        config: { get: vi.fn() },
        logger: { info: vi.fn() },
        catchFetchError: vi.fn(),
        errorResponse: vi.fn(),
        isTestMode: vi.fn(),
        FORECASTS_API_PATH: '/forecasts/custom',
        HTTP_STATUS_OK: 201,
        optionsEphemeralProtected: { headers: { a: 1 } },
        options: { headers: { b: 2 } }
      }

      const result = setupFetchForecastsDI(di)

      expect(result.injectedConfig).toBe(di.config)
      expect(result.injectedLogger).toBe(di.logger)
      expect(result.injectedCatchFetchError).toBe(di.catchFetchError)
      expect(result.injectedErrorResponse).toBe(di.errorResponse)
      expect(result.injectedIsTestMode).toBe(di.isTestMode)
      expect(result.injectedForecastsApiPath).toBe('/forecasts/custom')
      expect(result.injectedHttpStatusOk).toBe(201)
      expect(result.injectedOptionsEphemeralProtected).toBe(
        di.optionsEphemeralProtected
      )
      expect(result.injectedOptions).toBe(di.options)
    })

    it('returns defaults from module scope when DI object is empty', () => {
      const result = setupFetchForecastsDI({})

      expect(result.injectedConfig).toBeDefined()
      expect(result.injectedLogger).toBeDefined()
      expect(result.injectedCatchFetchError).toBeDefined()
      expect(result.injectedErrorResponse).toBeDefined()
      expect(typeof result.injectedIsTestMode).toBe('function')
      expect(result.injectedForecastsApiPath).toBeDefined()
      expect(result.injectedHttpStatusOk).toBe(200)
      expect(result.injectedOptionsEphemeralProtected).toEqual({})
      expect(result.injectedOptions).toEqual({})
    })
  })

  describe('setupNILocationDataDI', () => {
    it('prefers injected NI dependencies', () => {
      const injectedIsMockEnabled = vi.fn().mockReturnValue(true)
      const result = setupNILocationDataDI({
        logger: { info: vi.fn() },
        buildNIPostcodeUrl: vi.fn(),
        isMockEnabled: injectedIsMockEnabled,
        config: { get: vi.fn() },
        formatNorthernIrelandPostcode: vi.fn(),
        catchProxyFetchError: vi.fn(),
        isTestMode: vi.fn().mockReturnValue(true)
      })

      expect(result.injectedLogger).toBeDefined()
      expect(result.injectedBuildNIPostcodeUrl).toBeDefined()
      expect(result.injectedIsMockEnabled).toBe(injectedIsMockEnabled)
      expect(result.injectedConfig).toBeDefined()
      expect(result.injectedFormatNorthernIrelandPostcode).toBeDefined()
      expect(result.injectedCatchProxyFetchError).toBeDefined()
      expect(typeof result.injectedIsTestMode).toBe('function')
    })

    it('falls back to shared defaults when no overrides are provided', () => {
      const result = setupNILocationDataDI()

      expect(result.injectedLogger).toBeDefined()
      expect(result.injectedBuildNIPostcodeUrl).toBeDefined()
      expect(result.injectedConfig).toBeDefined()
      expect(result.injectedFormatNorthernIrelandPostcode).toBeDefined()
      expect(result.injectedCatchProxyFetchError).toBeDefined()
      expect(typeof result.injectedIsTestMode).toBe('function')
    })
  })

  describe('setupUKLocationDataDI', () => {
    it('maps all injected UK dependencies', () => {
      const di = {
        logger: { info: vi.fn() },
        config: { get: vi.fn() },
        buildUKLocationFilters: vi.fn(),
        combineUKSearchTerms: vi.fn(),
        isValidFullPostcodeUK: vi.fn(),
        isValidPartialPostcodeUK: vi.fn(),
        buildUKApiUrl: vi.fn(),
        shouldCallUKApi: vi.fn(),
        catchProxyFetchError: vi.fn(),
        formatUKApiResponse: vi.fn(),
        isTestMode: vi.fn(),
        SYMBOLS_ARRAY: ['!'],
        HTTP_STATUS_OK: 299,
        options: { headers: { custom: true } }
      }

      const result = setupUKLocationDataDI(di)

      expect(result.injectedLogger).toBe(di.logger)
      expect(result.injectedConfig).toBe(di.config)
      expect(result.injectedBuildUKLocationFilters).toBe(
        di.buildUKLocationFilters
      )
      expect(result.injectedCombineUKSearchTerms).toBe(di.combineUKSearchTerms)
      expect(result.injectedIsValidFullPostcodeUK).toBe(
        di.isValidFullPostcodeUK
      )
      expect(result.injectedIsValidPartialPostcodeUK).toBe(
        di.isValidPartialPostcodeUK
      )
      expect(result.injectedBuildUKApiUrl).toBe(di.buildUKApiUrl)
      expect(result.injectedShouldCallUKApi).toBe(di.shouldCallUKApi)
      expect(result.injectedCatchProxyFetchError).toBe(di.catchProxyFetchError)
      expect(result.injectedFormatUKApiResponse).toBe(di.formatUKApiResponse)
      expect(result.injectedIsTestMode).toBe(di.isTestMode)
      expect(result.injectedSymbolsArray).toEqual(['!'])
      expect(result.injectedHttpStatusOk).toBe(299)
      expect(result.injectedOptions).toEqual({ headers: { custom: true } })
    })

    it('falls back to defaults when DI is empty', () => {
      const result = setupUKLocationDataDI({})

      expect(result.injectedLogger).toBeDefined()
      expect(result.injectedConfig).toBeDefined()
      expect(result.injectedBuildUKLocationFilters).toBeDefined()
      expect(result.injectedCombineUKSearchTerms).toBeDefined()
      expect(result.injectedIsValidFullPostcodeUK).toBeDefined()
      expect(result.injectedIsValidPartialPostcodeUK).toBeDefined()
      expect(result.injectedBuildUKApiUrl).toBeDefined()
      expect(result.injectedShouldCallUKApi).toBeDefined()
      expect(result.injectedCatchProxyFetchError).toBeDefined()
      expect(result.injectedFormatUKApiResponse).toBeDefined()
      expect(typeof result.injectedIsTestMode).toBe('function')
      expect(Array.isArray(result.injectedSymbolsArray)).toBe(true)
      expect(result.injectedHttpStatusOk).toBe(200)
      expect(result.injectedOptions).toEqual({})
    })
  })
})
