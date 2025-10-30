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
// Dependency Injection setup helpers
function setupFetchForecastsDI(di = {}) {
  // ''
  // These dependencies must be provided by the importing file
  // config, logger, catchFetchError, errorResponse, isTestMode, FORECASTS_API_PATH, HTTP_STATUS_OK, optionsEphemeralProtected, options
  // You may need to import these in the main file and pass them in DI if not present
  return {
    injectedConfig:
      di.config || (typeof config !== 'undefined' ? config : undefined),
    injectedLogger:
      di.logger || (typeof logger !== 'undefined' ? logger : undefined),
    injectedCatchFetchError:
      di.catchFetchError ||
      (typeof catchFetchError !== 'undefined' ? catchFetchError : undefined),
    injectedErrorResponse:
      di.errorResponse ||
      (typeof errorResponse !== 'undefined' ? errorResponse : undefined),
    injectedIsTestMode:
      di.isTestMode ||
      (typeof isTestMode !== 'undefined' ? isTestMode : undefined),
    injectedForecastsApiPath:
      di.FORECASTS_API_PATH ||
      (typeof FORECASTS_API_PATH !== 'undefined'
        ? FORECASTS_API_PATH
        : undefined),
    injectedHttpStatusOk:
      di.HTTP_STATUS_OK ||
      (typeof HTTP_STATUS_OK !== 'undefined' ? HTTP_STATUS_OK : undefined),
    injectedOptionsEphemeralProtected:
      di.optionsEphemeralProtected ||
      (typeof optionsEphemeralProtected !== 'undefined'
        ? optionsEphemeralProtected
        : undefined),
    injectedOptions:
      di.options || (typeof options !== 'undefined' ? options : undefined)
  }
}

function setupNILocationDataDI(di = {}) {
  // ''
  // These dependencies must be provided by the importing file
  // logger, buildNIPostcodeUrl, isMockEnabled, config, formatNorthernIrelandPostcode, catchProxyFetchError, isTestMode
  // You may need to import these in the main file and pass them in DI if not present
  return {
    injectedLogger:
      di.logger || (typeof logger !== 'undefined' ? logger : undefined),
    injectedBuildNIPostcodeUrl:
      di.buildNIPostcodeUrl ||
      (typeof buildNIPostcodeUrl !== 'undefined'
        ? buildNIPostcodeUrl
        : undefined),
    injectedIsMockEnabled:
      di.isMockEnabled !== undefined ? di.isMockEnabled : isMockEnabled,
    injectedConfig:
      di.config || (typeof config !== 'undefined' ? config : undefined),
    injectedFormatNorthernIrelandPostcode:
      di.formatNorthernIrelandPostcode ||
      (typeof formatNorthernIrelandPostcode !== 'undefined'
        ? formatNorthernIrelandPostcode
        : undefined),
    injectedCatchProxyFetchError:
      di.catchProxyFetchError ||
      (typeof catchProxyFetchError !== 'undefined'
        ? catchProxyFetchError
        : undefined),
    injectedIsTestMode:
      di.isTestMode ||
      (typeof isTestMode !== 'undefined' ? isTestMode : undefined)
  }
}

function setupUKLocationDataDI(di = {}) {
  // ''
  // These dependencies must be provided by the importing file
  // logger, config, buildUKLocationFilters, combineUKSearchTerms, isValidFullPostcodeUK, isValidPartialPostcodeUK, buildUKApiUrl, shouldCallUKApi, catchProxyFetchError, formatUKApiResponse, isTestMode, SYMBOLS_ARRAY, HTTP_STATUS_OK, options
  // You may need to import these in the main file and pass them in DI if not present
  return {
    injectedLogger:
      di.logger || (typeof logger !== 'undefined' ? logger : undefined),
    injectedConfig:
      di.config || (typeof config !== 'undefined' ? config : undefined),
    injectedBuildUKLocationFilters:
      di.buildUKLocationFilters ||
      (typeof buildUKLocationFilters !== 'undefined'
        ? buildUKLocationFilters
        : undefined),
    injectedCombineUKSearchTerms:
      di.combineUKSearchTerms ||
      (typeof combineUKSearchTerms !== 'undefined'
        ? combineUKSearchTerms
        : undefined),
    injectedIsValidFullPostcodeUK:
      di.isValidFullPostcodeUK ||
      (typeof isValidFullPostcodeUK !== 'undefined'
        ? isValidFullPostcodeUK
        : undefined),
    injectedIsValidPartialPostcodeUK:
      di.isValidPartialPostcodeUK ||
      (typeof isValidPartialPostcodeUK !== 'undefined'
        ? isValidPartialPostcodeUK
        : undefined),
    injectedBuildUKApiUrl:
      di.buildUKApiUrl ||
      (typeof buildUKApiUrl !== 'undefined' ? buildUKApiUrl : undefined),
    injectedShouldCallUKApi:
      di.shouldCallUKApi ||
      (typeof shouldCallUKApi !== 'undefined' ? shouldCallUKApi : undefined),
    injectedCatchProxyFetchError:
      di.catchProxyFetchError ||
      (typeof catchProxyFetchError !== 'undefined'
        ? catchProxyFetchError
        : undefined),
    injectedFormatUKApiResponse:
      di.formatUKApiResponse ||
      (typeof formatUKApiResponse !== 'undefined'
        ? formatUKApiResponse
        : undefined),
    injectedIsTestMode:
      di.isTestMode ||
      (typeof isTestMode !== 'undefined' ? isTestMode : undefined),
    injectedSymbolsArray:
      di.SYMBOLS_ARRAY ||
      (typeof SYMBOLS_ARRAY !== 'undefined' ? SYMBOLS_ARRAY : undefined),
    injectedHttpStatusOk:
      di.HTTP_STATUS_OK ||
      (typeof HTTP_STATUS_OK !== 'undefined' ? HTTP_STATUS_OK : undefined),
    injectedOptions:
      di.options || (typeof options !== 'undefined' ? options : undefined)
  }
}

export { setupFetchForecastsDI, setupNILocationDataDI, setupUKLocationDataDI }
