import {
  buildUKTestModeResult,
  buildNITestModeResult,
  handleTestModeFetchData,
  fetchForecastsTestMode,
  fetchMeasurementsTestMode
} from './extracted/test-mode-helpers.js'
import {
  callForecastsApi,
  callAndHandleForecastsResponse,
  selectMeasurementsUrlAndOptions,
  callAndHandleMeasurementsResponse
} from './extracted/api-utils.js'
/* eslint-env node */
import { setupFetchForecastsDI } from './extracted/di-helpers.js'
import { config } from '../../../config/index.js'
import { catchFetchError } from '../../common/helpers/catch-fetch-error.js'
import { LOCATION_TYPE_NI, LOCATION_TYPE_UK } from '../../data/constants.js'
import {
  handleUnsupportedLocationType,
  handleUKLocationData,
  handleNILocationData,
  refreshOAuthToken,
  normalizeLocationType,
  buildNIOptionsOAuth
} from './extracted/util-helpers.js'
import {
  isTestMode,
  errorResponse,
  validateParams,
  isMockEnabled,
  combineUKSearchTerms,
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK,
  buildUKApiUrl,
  shouldCallUKApi,
  buildUKLocationFilters
} from './location-helpers.js'

import { createLogger } from '../../common/helpers/logging/logger.js'
const logger = createLogger()

const fetchForecasts = async (di = {}) => {
  const merged = { ...setupFetchForecastsDI(di), ...di }
  const injectedConfig =
    merged.injectedConfig && typeof merged.injectedConfig.get === 'function'
      ? merged.injectedConfig
      : config
  const injectedLogger =
    merged.injectedLogger &&
    typeof merged.injectedLogger.error === 'function' &&
    typeof merged.injectedLogger.info === 'function'
      ? merged.injectedLogger
      : logger
  const injectedCatchFetchError =
    typeof merged.injectedCatchFetchError === 'function'
      ? merged.injectedCatchFetchError
      : catchFetchError
  const injectedErrorResponse =
    typeof merged.injectedErrorResponse === 'function'
      ? merged.injectedErrorResponse
      : errorResponse
  const injectedIsTestMode =
    typeof merged.injectedIsTestMode === 'function'
      ? merged.injectedIsTestMode
      : isTestMode
  const injectedForecastsApiPath =
    merged.injectedForecastsApiPath || injectedConfig.get('forecastsApiUrl')
  const injectedHttpStatusOk = merged.injectedHttpStatusOk || 200
  // Only define optionsEphemeralProtected here if cdpXApiKey is needed
  let injectedOptionsEphemeralProtected =
    merged.injectedOptionsEphemeralProtected
  if (typeof injectedOptionsEphemeralProtected === 'undefined') {
    // If cdpXApiKey is required for this fetch, set it up here
    if (
      merged.injectedConfig &&
      typeof merged.injectedConfig.get === 'function'
    ) {
      const cdpXApiKey = merged.injectedConfig.get('cdpXApiKey')
      if (cdpXApiKey) {
        injectedOptionsEphemeralProtected = {
          headers: { 'x-api-key': cdpXApiKey }
        }
      } else {
        injectedOptionsEphemeralProtected = {}
      }
    } else {
      injectedOptionsEphemeralProtected = {}
    }
  }
  const request = merged.request
  const injectedOptions = merged.injectedOptions || {}
  const testModeResult = fetchForecastsTestMode(
    injectedIsTestMode,
    injectedLogger
  )
  if (testModeResult) {
    if (!testModeResult['forecast-summary']) {
      testModeResult['forecast-summary'] = { today: null }
    }
    return testModeResult
  }

  const forecastsResult = await callForecastsApi({
    injectedConfig,
    injectedForecastsApiPath,
    injectedOptionsEphemeralProtected,
    injectedOptions,
    injectedCatchFetchError,
    injectedHttpStatusOk,
    injectedLogger,
    injectedErrorResponse,
    request
  })
  if (
    forecastsResult &&
    typeof forecastsResult === 'object' &&
    !('forecast-summary' in forecastsResult)
  ) {
    forecastsResult['forecast-summary'] = { today: null }
  }
  return forecastsResult
}

export const fetchMeasurements = async (
  latitude,
  longitude,
  useNewRicardoMeasurementsEnabled,
  di = {}
) => {
  // Local fallback for optionsEphemeralProtected
  let optionsEphemeralProtected = {}
  // Always ensure x-api-key is present for local requests if available
  const cdpXApiKey =
    (di.config &&
      typeof di.config.get === 'function' &&
      di.config.get('cdpXApiKey')) ||
    (typeof config !== 'undefined' && config.get && config.get('cdpXApiKey')) ||
    (typeof process !== 'undefined' && process.env && process.env.CDP_X_API_KEY)
  if (cdpXApiKey) {
    optionsEphemeralProtected = { headers: { 'x-api-key': cdpXApiKey } }
  }
  // Dependency injection with fallbacks
  const injectedLogger = di.logger || logger
  const injectedConfig = di.config || config
  const injectedCatchFetchError = di.catchFetchError || catchFetchError
  const injectedOptionsEphemeralProtected =
    di.optionsEphemeralProtected || optionsEphemeralProtected
  const injectedOptions = di.options || {}
  let injectedNodeEnv = di.nodeEnv
  if (
    typeof process !== 'undefined' &&
    typeof process.env !== 'undefined' &&
    Object.prototype.hasOwnProperty.call(process.env, 'NODE_ENV')
  ) {
    injectedNodeEnv = injectedNodeEnv || process.env.NODE_ENV
  }
  const injectedIsTestMode =
    typeof di.isTestMode === 'function' ? di.isTestMode : isTestMode

  // 1. Test mode logic
  const testModeResult = fetchMeasurementsTestMode(
    injectedIsTestMode,
    injectedLogger
  )
  if (testModeResult) {
    return testModeResult
  }

  // 2. Select API URL and options
  let url, opts
  try {
    const selection = selectMeasurementsUrlAndOptions(
      latitude,
      longitude,
      useNewRicardoMeasurementsEnabled,
      {
        injectedConfig,
        injectedLogger,
        injectedNodeEnv,
        injectedOptionsEphemeralProtected,
        injectedOptions,
        request: di.request // Pass request if present in DI
      }
    )
    url = selection.url
    opts = selection.opts
  } catch (err) {
    injectedLogger.error(
      `Unexpected error in fetchMeasurements: ${err.message}`
    )
    return []
  }

  // 3. Call API and handle response
  return callAndHandleMeasurementsResponse(
    url,
    opts,
    injectedCatchFetchError,
    injectedLogger
  )
}

async function fetchData(
  request,
  { locationType, userLocation, searchTerms, secondSearchTerm },
  diOverrides = {}
) {
  // Local fallback for optionsEphemeralProtected
  const optionsEphemeralProtected = {}
  // Remove console.log for production and lint compliance
  if (!request) {
    throw new Error(
      "fetchData: 'request' argument is required and was not provided."
    )
  }
  // Dependency injection destructure
  const {
    fetchForecasts: injectedFetchForecasts = fetchForecasts,
    handleUKLocationData: injectedHandleUKLocationData = handleUKLocationData,
    handleNILocationData: injectedHandleNILocationData = handleNILocationData,
    isTestMode: injectedIsTestMode = isTestMode,
    validateParams: injectedValidateParams = validateParams,
    logger: injectedLogger = logger,
    errorResponse: injectedErrorResponse = errorResponse,
    isMockEnabled: injectedIsMockEnabled = isMockEnabled,
    refreshOAuthToken: injectedRefreshOAuthToken = refreshOAuthToken,
    buildUKLocationFilters:
      injectedBuildUKLocationFilters = buildUKLocationFilters,
    combineUKSearchTerms: injectedCombineUKSearchTerms = combineUKSearchTerms,
    isValidFullPostcodeUK:
      injectedIsValidFullPostcodeUK = isValidFullPostcodeUK,
    isValidPartialPostcodeUK:
      injectedIsValidPartialPostcodeUK = isValidPartialPostcodeUK,
    buildUKApiUrl: injectedBuildUKApiUrl = buildUKApiUrl,
    shouldCallUKApi: injectedShouldCallUKApi = shouldCallUKApi,
    config: injectedConfig = config
    // options and optionsEphemeralProtected are not used in main DI destructure
  } = diOverrides

  // Input validation
  const validationError = injectedValidateParams(
    { locationType, userLocation },
    ['locationType', 'userLocation']
  )
  if (validationError) {
    return validationError
  }

  // Build options for NI if needed
  let optionsOAuth
  if (locationType === LOCATION_TYPE_NI) {
    const niOptions = await buildNIOptionsOAuth({
      request,
      injectedIsMockEnabled,
      injectedRefreshOAuthToken
    })
    optionsOAuth = niOptions.optionsOAuth
    // accessToken is not used
  }

  // Fetch forecasts (which contains daily summary)
  const diRequest =
    diOverrides && diOverrides.request !== undefined
      ? diOverrides.request
      : request
  const getForecasts = await injectedFetchForecasts({
    ...diOverrides,
    request: diRequest
  })

  // getDailySummary is derived from getForecasts['forecast-summary']
  let getDailySummary = getForecasts && getForecasts['forecast-summary']
  // Always provide a fallback object if missing or invalid
  if (!getDailySummary || typeof getDailySummary !== 'object') {
    getDailySummary = { today: null }
  }

  // In test mode, always return the actual handler function result so test mocks control output
  if (injectedIsTestMode()) {
    return handleTestModeFetchData({
      locationType,
      userLocation,
      searchTerms,
      secondSearchTerm,
      optionsOAuth,
      getDailySummary,
      getForecasts,
      injectedHandleUKLocationData,
      injectedHandleNILocationData,
      injectedLogger,
      injectedErrorResponse,
      args: diOverrides
    })
  }

  // Main logic for UK and NI
  if (locationType === LOCATION_TYPE_UK) {
    // Ensure request is always defined and not overwritten by undefined in DI
    const di = {
      ...diOverrides,
      request: diRequest || {},
      buildUKLocationFilters: injectedBuildUKLocationFilters,
      combineUKSearchTerms: injectedCombineUKSearchTerms,
      isValidFullPostcodeUK: injectedIsValidFullPostcodeUK,
      isValidPartialPostcodeUK: injectedIsValidPartialPostcodeUK,
      buildUKApiUrl: injectedBuildUKApiUrl,
      // Defensive wrapper: always pass safe arrays to shouldCallUKApi
      shouldCallUKApi: (...args) =>
        injectedShouldCallUKApi(
          ...args.map((arg) => (Array.isArray(arg) ? arg : []))
        ),
      config: injectedConfig
    }
    const osPlacesResult = await injectedHandleUKLocationData(
      userLocation,
      searchTerms,
      secondSearchTerm,
      di
    )
    return { getDailySummary, getForecasts, getOSPlaces: osPlacesResult }
  } else if (locationType === LOCATION_TYPE_NI) {
    const di = { ...diOverrides, request: diRequest || {} }
    // Provide local fallback for options and optionsEphemeralProtected
    const options = {}
    const {
      searchTerms: niSearchTerms,
      secondSearchTerm: niSecondSearchTerm,
      shouldCallApi: niShouldCallApi,
      options: niInjectedOptions = options,
      optionsEphemeralProtected:
        niInjectedOptionsEphemeralProtected = optionsEphemeralProtected,
      request: niRequest = diRequest
    } = di
    const getNIPlaces = await injectedHandleNILocationData(
      userLocation,
      optionsOAuth,
      niSearchTerms,
      niSecondSearchTerm,
      niShouldCallApi,
      niInjectedOptions,
      niInjectedOptionsEphemeralProtected,
      niRequest,
      di
    )
    return { getDailySummary, getForecasts, getNIPlaces }
  } else {
    injectedLogger.error('Unsupported location type provided:', locationType)
    return injectedErrorResponse('Unsupported location type provided', 400)
  }
}

export {
  fetchData,
  handleUKLocationData,
  handleNILocationData,
  fetchForecasts,
  refreshOAuthToken,
  normalizeLocationType,
  buildUKTestModeResult,
  buildNITestModeResult,
  handleUnsupportedLocationType,
  callAndHandleForecastsResponse
}
