// ''  Data fetching functions for air quality locations
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
import { config } from '../../../config/index.js'
import { catchFetchError } from '../../common/helpers/catch-fetch-error.js'
import { LOCATION_TYPE_NI, LOCATION_TYPE_UK } from '../../data/constants.js'
import {
  handleUnsupportedLocationType,
  handleUKLocationData,
  handleNILocationData,
  refreshOAuthToken,
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

/**
 * ''  Build options with API key headers
 */
function buildApiOptions() {
  const cdpXApiKey = config.get('cdpXApiKey')
  if (cdpXApiKey) {
    return { headers: { 'x-api-key': cdpXApiKey } }
  }
  return {}
}

const fetchForecasts = async (di = {}) => {
  // ''  Simple DI with fallbacks
  const testModeChecker = di.isTestMode || isTestMode
  const testLogger = di.logger || logger
  
  const testModeResult = fetchForecastsTestMode(testModeChecker, testLogger)
  if (testModeResult) {
    if (!testModeResult['forecast-summary']) {
      testModeResult['forecast-summary'] = { today: null }
    }
    return testModeResult
  }

  // ''  Call forecasts API
  const forecastsResult = await callForecastsApi({
    injectedConfig: di.config || config,
    injectedForecastsApiPath:
      di.FORECASTS_API_PATH || config.get('forecastsApiUrl'),
    injectedOptionsEphemeralProtected:
      di.optionsEphemeralProtected || buildApiOptions(),
    injectedOptions: di.options || {},
    injectedCatchFetchError: di.catchFetchError || catchFetchError,
    injectedHttpStatusOk: di.HTTP_STATUS_OK || 200,
    injectedLogger: testLogger,
    injectedErrorResponse: di.errorResponse || errorResponse,
    request: di.request,
    nodeEnv: di.nodeEnv
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
  // ''  Simple DI with fallbacks
  const diLogger = di.logger || logger
  const diConfig = di.config || config
  const diCatchFetchError = di.catchFetchError || catchFetchError
  const diOptions = di.optionsEphemeralProtected || buildApiOptions()
  const diExtraOptions = di.options || {}
  const diNodeEnv = di.nodeEnv || process.env.NODE_ENV
  const diIsTestMode =
    typeof di.isTestMode === 'function' ? di.isTestMode : isTestMode

  // 1. Test mode logic
  const testModeResult = fetchMeasurementsTestMode(diIsTestMode, diLogger)
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
        injectedConfig: diConfig,
        injectedLogger: diLogger,
        injectedNodeEnv: diNodeEnv,
        injectedOptionsEphemeralProtected: diOptions,
        injectedOptions: diExtraOptions,
        request: di.request
      }
    )
    url = selection.url
    opts = selection.opts
  } catch (err) {
    diLogger.error(`Unexpected error in fetchMeasurements: ${err.message}`)
    return []
  }

  // 3. Call API and handle response
  return callAndHandleMeasurementsResponse(
    url,
    opts,
    diCatchFetchError,
    diLogger
  )
}

/**
 * ''  Fetch air quality data for a location
 */
async function fetchData(
  request,
  { locationType, userLocation, searchTerms, secondSearchTerm },
  diOverrides = {}
) {
  if (!request) {
    throw new Error(
      "fetchData: 'request' argument is required and was not provided."
    )
  }

  // ''  Simple DI with defaults
  const {
    fetchForecasts: diFetchForecasts = fetchForecasts,
    handleUKLocationData: diHandleUKLocationData = handleUKLocationData,
    handleNILocationData: diHandleNILocationData = handleNILocationData,
    isTestMode: diIsTestMode = isTestMode,
    validateParams: diValidateParams = validateParams,
    logger: diLogger = logger,
    errorResponse: diErrorResponse = errorResponse,
    isMockEnabled: diIsMockEnabled = isMockEnabled,
    refreshOAuthToken: diRefreshOAuthToken = refreshOAuthToken,
    buildUKLocationFilters: diBuildUKLocationFilters = buildUKLocationFilters,
    combineUKSearchTerms: diCombineUKSearchTerms = combineUKSearchTerms,
    isValidFullPostcodeUK: diIsValidFullPostcodeUK = isValidFullPostcodeUK,
    isValidPartialPostcodeUK:
      diIsValidPartialPostcodeUK = isValidPartialPostcodeUK,
    buildUKApiUrl: diBuildUKApiUrl = buildUKApiUrl,
    shouldCallUKApi: diShouldCallUKApi = shouldCallUKApi,
    config: diConfig = config
  } = diOverrides

  // Input validation
  const validationError = diValidateParams(
    { locationType, userLocation },
    ['locationType', 'userLocation']
  )
  if (validationError) {
    return validationError
  }

  // ''  Build OAuth options for NI if needed
  let optionsOAuth
  if (locationType === LOCATION_TYPE_NI) {
    const niOptions = await buildNIOptionsOAuth({
      request,
      injectedIsMockEnabled: diIsMockEnabled,
      injectedRefreshOAuthToken: diRefreshOAuthToken
    })
    optionsOAuth = niOptions.optionsOAuth
  }

  // ''  Fetch forecasts data
  const diRequest = diOverrides?.request ?? request
  const getForecasts = await diFetchForecasts({
    ...diOverrides,
    request: diRequest
  })

  // ''  Extract daily summary from forecasts
  let getDailySummary = getForecasts?.['forecast-summary']
  if (!getDailySummary || typeof getDailySummary !== 'object') {
    getDailySummary = { today: null }
  }

  // ''  Test mode handling
  if (diIsTestMode()) {
    return handleTestModeFetchData({
      locationType,
      userLocation,
      searchTerms,
      secondSearchTerm,
      optionsOAuth,
      getDailySummary,
      getForecasts,
      injectedHandleUKLocationData: diHandleUKLocationData,
      injectedHandleNILocationData: diHandleNILocationData,
      injectedLogger: diLogger,
      injectedErrorResponse: diErrorResponse,
      args: diOverrides
    })
  }

  // ''  Handle UK locations
  if (locationType === LOCATION_TYPE_UK) {
    const di = {
      ...diOverrides,
      request: diRequest || {},
      buildUKLocationFilters: diBuildUKLocationFilters,
      combineUKSearchTerms: diCombineUKSearchTerms,
      isValidFullPostcodeUK: diIsValidFullPostcodeUK,
      isValidPartialPostcodeUK: diIsValidPartialPostcodeUK,
      buildUKApiUrl: diBuildUKApiUrl,
      shouldCallUKApi: (...args) =>
        diShouldCallUKApi(
          ...args.map((arg) => (Array.isArray(arg) ? arg : []))
        ),
      config: diConfig
    }
    const osPlacesResult = await diHandleUKLocationData(
      userLocation,
      searchTerms,
      secondSearchTerm,
      di
    )
    return { getDailySummary, getForecasts, getOSPlaces: osPlacesResult }
  }

  // ''  Handle NI locations
  if (locationType === LOCATION_TYPE_NI) {
    const di = { ...diOverrides, request: diRequest || {} }
    const isMock =
      typeof diIsMockEnabled === 'function'
        ? diIsMockEnabled()
        : !!diIsMockEnabled
    const getNIPlaces = await diHandleNILocationData(
      userLocation,
      searchTerms,
      secondSearchTerm,
      isMock,
      optionsOAuth,
      undefined,
      diRequest,
      di
    )
    return { getDailySummary, getForecasts, getNIPlaces }
  }

  // ''  Unsupported location type
  diLogger.error('Unsupported location type provided:', locationType)
  return diErrorResponse('Unsupported location type provided', 400)
}

export {
  fetchData,
  handleUKLocationData,
  handleNILocationData,
  fetchForecasts,
  refreshOAuthToken,
  buildUKTestModeResult,
  buildNITestModeResult,
  handleUnsupportedLocationType,
  callAndHandleForecastsResponse
}
