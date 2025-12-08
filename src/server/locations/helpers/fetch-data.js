// ''  Data fetching functions for air quality locations
import {
  handleTestModeFetchData,
  fetchForecastsTestMode,
  fetchMeasurementsTestMode
} from './extracted/test-mode-helpers.js'
import {
  STATUS_BAD_REQUEST,
  STATUS_OK,
  LOCATION_TYPE_NI,
  LOCATION_TYPE_UK
} from '../../data/constants.js'
import {
  callForecastsApi,
  selectMeasurementsUrlAndOptions,
  callAndHandleMeasurementsResponse
} from './extracted/api-utils.js'
/* eslint-env node */
import { config } from '../../../config/index.js'
import { catchFetchError } from '../../common/helpers/catch-fetch-error.js'
import {
  handleUKLocationData as localHandleUKLocationData,
  handleNILocationData as localHandleNILocationData,
  refreshOAuthToken as localRefreshOAuthToken,
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
export {
  buildUKTestModeResult,
  buildNITestModeResult
} from './extracted/test-mode-helpers.js'
export { callAndHandleForecastsResponse } from './extracted/api-utils.js'
export {
  handleUnsupportedLocationType,
  handleUKLocationData,
  handleNILocationData,
  refreshOAuthToken
} from './extracted/util-helpers.js'
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

/**
 * ''  Ensure forecast-summary field exists
 */
function ensureForecastSummary(forecastData) {
  if (
    forecastData &&
    typeof forecastData === 'object' &&
    !('forecast-summary' in forecastData)
  ) {
    forecastData['forecast-summary'] = { today: null }
  }
  return forecastData
}

const fetchForecasts = async (di = {}) => {
  // ''  Simple DI with fallbacks
  const testModeChecker = di.isTestMode || isTestMode
  const testLogger = di.logger || logger

  const testModeResult = fetchForecastsTestMode(testModeChecker, testLogger)
  if (testModeResult) {
    return ensureForecastSummary(testModeResult)
  }

  // ''  Call forecasts API
  const forecastsResult = await callForecastsApi({
    config: di.config || config,
    optionsEphemeralProtected:
      di.optionsEphemeralProtected || buildApiOptions(),
    options: di.options || {},
    catchFetchError: di.catchFetchError || catchFetchError,
    httpStatusOk: di.HTTP_STATUS_OK || STATUS_OK,
    logger: testLogger,
    errorResponse: di.errorResponse || errorResponse,
    request: di.request
  })

  return ensureForecastSummary(forecastsResult)
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
        config: diConfig,
        logger: diLogger,
        optionsEphemeralProtected: diOptions,
        options: diExtraOptions,
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
 * ''  Extract and set up dependency injection defaults
 */
function setupDependencies(diOverrides) {
  const {
    fetchForecasts: diFetchForecasts = fetchForecasts,
    handleUKLocationData: diHandleUKLocationData = localHandleUKLocationData,
    handleNILocationData: diHandleNILocationData = localHandleNILocationData,
    isTestMode: diIsTestMode = isTestMode,
    validateParams: diValidateParams = validateParams,
    logger: diLogger = logger,
    errorResponse: diErrorResponse = errorResponse,
    isMockEnabled: diIsMockEnabled = isMockEnabled,
    refreshOAuthToken: diRefreshOAuthToken = localRefreshOAuthToken,
    buildUKLocationFilters: diBuildUKLocationFilters = buildUKLocationFilters,
    combineUKSearchTerms: diCombineUKSearchTerms = combineUKSearchTerms,
    isValidFullPostcodeUK: diIsValidFullPostcodeUK = isValidFullPostcodeUK,
    isValidPartialPostcodeUK:
      diIsValidPartialPostcodeUK = isValidPartialPostcodeUK,
    buildUKApiUrl: diBuildUKApiUrl = buildUKApiUrl,
    shouldCallUKApi: diShouldCallUKApi = shouldCallUKApi,
    config: diConfig = config
  } = diOverrides

  return {
    fetchForecasts: diFetchForecasts,
    handleUKLocationData: diHandleUKLocationData,
    handleNILocationData: diHandleNILocationData,
    isTestMode: diIsTestMode,
    validateParams: diValidateParams,
    logger: diLogger,
    errorResponse: diErrorResponse,
    isMockEnabled: diIsMockEnabled,
    refreshOAuthToken: diRefreshOAuthToken,
    buildUKLocationFilters: diBuildUKLocationFilters,
    combineUKSearchTerms: diCombineUKSearchTerms,
    isValidFullPostcodeUK: diIsValidFullPostcodeUK,
    isValidPartialPostcodeUK: diIsValidPartialPostcodeUK,
    buildUKApiUrl: diBuildUKApiUrl,
    shouldCallUKApi: diShouldCallUKApi,
    config: diConfig
  }
}

/**
 * ''  Handle UK location data fetching
 */
async function handleUKLocation(
  userLocation,
  searchTerms,
  secondSearchTerm,
  di,
  diRequest
) {
  const ukDi = {
    ...di.overrides,
    request: diRequest || {},
    buildUKLocationFilters: di.buildUKLocationFilters,
    combineUKSearchTerms: di.combineUKSearchTerms,
    isValidFullPostcodeUK: di.isValidFullPostcodeUK,
    isValidPartialPostcodeUK: di.isValidPartialPostcodeUK,
    buildUKApiUrl: di.buildUKApiUrl,
    shouldCallUKApi: (...args) =>
      di.shouldCallUKApi(...args.map((arg) => (Array.isArray(arg) ? arg : []))),
    config: di.config,
    searchTerms,
    secondSearchTerm
  }
  const osPlacesResult = await di.handleUKLocationData(userLocation, ukDi)
  return osPlacesResult
}

/**
 * ''  Handle NI location data fetching
 */
async function handleNILocation(
  userLocation,
  searchTerms,
  secondSearchTerm,
  optionsOAuth,
  di,
  diRequest
) {
  const niDi = { ...di.overrides, request: diRequest || {} }
  const isMock =
    typeof di.isMockEnabled === 'function'
      ? di.isMockEnabled()
      : !!di.isMockEnabled
  const getNIPlaces = await di.handleNILocationData(
    userLocation,
    searchTerms,
    secondSearchTerm,
    isMock,
    optionsOAuth,
    undefined,
    diRequest,
    niDi
  )
  return getNIPlaces
}

/**
 * ''  Extract daily summary from forecast data
 */
function extractDailySummary(getForecasts) {
  let getDailySummary = getForecasts?.['forecast-summary']
  if (!getDailySummary || typeof getDailySummary !== 'object') {
    getDailySummary = { today: null }
  }
  return getDailySummary
}

// Helper to build OAuth options for NI locations
async function buildOAuthForNI(locationType, deps, request) {
  if (locationType !== LOCATION_TYPE_NI) {
    return null
  }
  const niOptions = await buildNIOptionsOAuth({
    request,
    isMockEnabled: deps.isMockEnabled,
    refreshOAuthTokenFn: deps.refreshOAuthToken
  })
  return niOptions.optionsOAuth
}

// Helper to fetch and extract forecasts
async function fetchAndExtractForecasts(deps, diRequest, diOverrides) {
  const getForecasts = await deps.fetchForecasts({
    ...diOverrides,
    request: diRequest
  })
  const getDailySummary = extractDailySummary(getForecasts)
  return { getForecasts, getDailySummary }
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

  const deps = setupDependencies(diOverrides)

  const validationError = deps.validateParams({ locationType, userLocation }, [
    'locationType',
    'userLocation'
  ])
  if (validationError) {
    return validationError
  }

  const diRequest = diOverrides?.request ?? request

  const optionsOAuth = await buildOAuthForNI(locationType, deps, request)
  const { getForecasts, getDailySummary } = await fetchAndExtractForecasts(
    deps,
    diRequest,
    diOverrides
  )

  if (deps.isTestMode()) {
    return handleTestModeFetchData({
      locationType,
      userLocation,
      searchTerms,
      secondSearchTerm,
      optionsOAuth,
      getDailySummary,
      getForecasts,
      handleUKLocationData: deps.handleUKLocationData,
      handleNILocationData: deps.handleNILocationData,
      logger: deps.logger,
      errorResponse: deps.errorResponse,
      args: diOverrides
    })
  }

  if (locationType === LOCATION_TYPE_UK) {
    const osPlacesResult = await handleUKLocation(
      userLocation,
      searchTerms,
      secondSearchTerm,
      deps,
      diRequest
    )
    return { getDailySummary, getForecasts, getOSPlaces: osPlacesResult }
  }

  // ''  Handle NI locations
  if (locationType === LOCATION_TYPE_NI) {
    const getNIPlaces = await handleNILocation(
      userLocation,
      searchTerms,
      secondSearchTerm,
      optionsOAuth,
      deps,
      diRequest
    )
    return { getDailySummary, getForecasts, getNIPlaces }
  }

  // ''  Unsupported location type
  deps.logger.error('Unsupported location type provided:', locationType)
  return deps.errorResponse(
    'Unsupported location type provided',
    STATUS_BAD_REQUEST
  )
}

export { fetchData, fetchForecasts }
