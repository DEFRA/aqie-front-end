import { config } from '../../../../config/index.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { catchFetchError } from '../../../common/helpers/catch-fetch-error.js'
import { catchAll as errorResponse } from '../../../common/helpers/errors.js'
import {
  FORECASTS_API_PATH,
  HTTP_STATUS_OK,
  SYMBOLS_ARRAY
} from '../../../data/constants.js'
import {
  buildNIPostcodeUrl,
  formatNorthernIrelandPostcode,
  buildUKLocationFilters,
  combineUKSearchTerms,
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK,
  buildUKApiUrl,
  formatUKApiResponse,
  catchProxyFetchError
} from './util-helpers.js'
import { shouldCallUKApi } from '../location-helpers.js'
import { isMockEnabled } from './test-mode-helpers.js'

// Helper to detect test mode for DI and unit tests
function isTestMode() {
  return (
    typeof process !== 'undefined' &&
    process.env &&
    (process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true')
  )
}

const logger = createLogger()
const optionsEphemeralProtected = {}
const options = {}

const resolveDependency = (injectedValue, fallbackValue) => {
  if (injectedValue === undefined) {
    return fallbackValue
  }
  return injectedValue
}
// Dependency Injection setup helpers
function setupFetchForecastsDI(di = {}) {
  // ''
  // These dependencies must be provided by the importing file
  // config, logger, catchFetchError, errorResponse, isTestMode, FORECASTS_API_PATH, HTTP_STATUS_OK, optionsEphemeralProtected, options
  // You may need to import these in the main file and pass them in DI if not present
  return {
    injectedConfig: resolveDependency(di.config, config),
    injectedLogger: resolveDependency(di.logger, logger),
    injectedCatchFetchError: resolveDependency(
      di.catchFetchError,
      catchFetchError
    ),
    injectedErrorResponse: resolveDependency(di.errorResponse, errorResponse),
    injectedIsTestMode: resolveDependency(di.isTestMode, isTestMode),
    injectedForecastsApiPath: resolveDependency(
      di.FORECASTS_API_PATH,
      FORECASTS_API_PATH
    ),
    injectedHttpStatusOk: resolveDependency(di.HTTP_STATUS_OK, HTTP_STATUS_OK),
    injectedOptionsEphemeralProtected: resolveDependency(
      di.optionsEphemeralProtected,
      optionsEphemeralProtected
    ),
    injectedOptions: resolveDependency(di.options, options)
  }
}

function setupNILocationDataDI(di = {}) {
  // ''
  // These dependencies must be provided by the importing file
  // logger, buildNIPostcodeUrl, isMockEnabled, config, formatNorthernIrelandPostcode, catchProxyFetchError, isTestMode
  // You may need to import these in the main file and pass them in DI if not present
  return {
    injectedLogger: resolveDependency(di.logger, logger),
    injectedBuildNIPostcodeUrl: resolveDependency(
      di.buildNIPostcodeUrl,
      buildNIPostcodeUrl
    ),
    injectedIsMockEnabled: resolveDependency(di.isMockEnabled, isMockEnabled),
    injectedConfig: resolveDependency(di.config, config),
    injectedFormatNorthernIrelandPostcode: resolveDependency(
      di.formatNorthernIrelandPostcode,
      formatNorthernIrelandPostcode
    ),
    injectedCatchProxyFetchError: resolveDependency(
      di.catchProxyFetchError,
      catchProxyFetchError
    ),
    injectedIsTestMode: resolveDependency(di.isTestMode, isTestMode)
  }
}

function setupUKLocationDataDI(di = {}) {
  // ''
  // These dependencies must be provided by the importing file
  // logger, config, buildUKLocationFilters, combineUKSearchTerms, isValidFullPostcodeUK, isValidPartialPostcodeUK, buildUKApiUrl, shouldCallUKApi, catchProxyFetchError, formatUKApiResponse, isTestMode, SYMBOLS_ARRAY, HTTP_STATUS_OK, options
  // You may need to import these in the main file and pass them in DI if not present
  return {
    injectedLogger: resolveDependency(di.logger, logger),
    injectedConfig: resolveDependency(di.config, config),
    injectedBuildUKLocationFilters: resolveDependency(
      di.buildUKLocationFilters,
      buildUKLocationFilters
    ),
    injectedCombineUKSearchTerms: resolveDependency(
      di.combineUKSearchTerms,
      combineUKSearchTerms
    ),
    injectedIsValidFullPostcodeUK: resolveDependency(
      di.isValidFullPostcodeUK,
      isValidFullPostcodeUK
    ),
    injectedIsValidPartialPostcodeUK: resolveDependency(
      di.isValidPartialPostcodeUK,
      isValidPartialPostcodeUK
    ),
    injectedBuildUKApiUrl: resolveDependency(di.buildUKApiUrl, buildUKApiUrl),
    injectedShouldCallUKApi: resolveDependency(
      di.shouldCallUKApi,
      shouldCallUKApi
    ),
    injectedCatchProxyFetchError: resolveDependency(
      di.catchProxyFetchError,
      catchProxyFetchError
    ),
    injectedFormatUKApiResponse: resolveDependency(
      di.formatUKApiResponse,
      formatUKApiResponse
    ),
    injectedIsTestMode: resolveDependency(di.isTestMode, isTestMode),
    injectedSymbolsArray: resolveDependency(di.SYMBOLS_ARRAY, SYMBOLS_ARRAY),
    injectedHttpStatusOk: resolveDependency(di.HTTP_STATUS_OK, HTTP_STATUS_OK),
    injectedOptions: resolveDependency(di.options, options)
  }
}

export { setupFetchForecastsDI, setupNILocationDataDI, setupUKLocationDataDI }
