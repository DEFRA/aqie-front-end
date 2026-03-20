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

const getFirstConfigValue = (configInstance, keys = []) => {
  for (const key of keys) {
    const value = configInstance.get(key)
    if (value) {
      return value
    }
  }
  return null
}

const getApiKeyCandidatesByEnv = (env) => {
  if (env === 'perf-test') {
    return ['cdpXApiKeyPerfTest', 'cdpXApiKey']
  }
  if (env === 'test') {
    return ['cdpXApiKeyTest', 'cdpXApiKey']
  }
  return ['cdpXApiKeyTest', 'cdpXApiKeyDev', 'cdpXApiKey']
}

const getOverrideOrDefault = (overrides, key, fallback) => {
  if (overrides?.[key]) {
    return overrides[key]
  }
  return fallback
}

/**
 * ''  Build options with API key headers
 */
function buildApiOptions(request) {
  const env = request?.app?.config?.env || process.env.NODE_ENV
  const cdpXApiKey = getFirstConfigValue(config, getApiKeyCandidatesByEnv(env))

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
  const testModeChecker = getOverrideOrDefault(di, 'isTestMode', isTestMode)
  const testLogger = getOverrideOrDefault(di, 'logger', logger)

  const testModeResult = fetchForecastsTestMode(testModeChecker, testLogger)
  if (testModeResult) {
    return ensureForecastSummary(testModeResult)
  }

  const forecastsConfig = getOverrideOrDefault(di, 'config', config)
  const forecastsOptions = getOverrideOrDefault(di, 'options', {})
  const optionsEphemeralProtected = getOverrideOrDefault(
    di,
    'optionsEphemeralProtected',
    buildApiOptions(di.request)
  )
  const forecastsCatchFetchError = getOverrideOrDefault(
    di,
    'catchFetchError',
    catchFetchError
  )
  const forecastsErrorResponse = getOverrideOrDefault(
    di,
    'errorResponse',
    errorResponse
  )
  const httpStatusOk = getOverrideOrDefault(di, 'HTTP_STATUS_OK', STATUS_OK)

  // ''  Call forecasts API
  const forecastsResult = await callForecastsApi({
    config: forecastsConfig,
    optionsEphemeralProtected,
    options: forecastsOptions,
    catchFetchError: forecastsCatchFetchError,
    httpStatusOk,
    logger: testLogger,
    errorResponse: forecastsErrorResponse,
    request: di.request
  })

  return ensureForecastSummary(forecastsResult)
}

const resolveMeasurementsInputs = (
  useNewRicardoMeasurementsEnabledOrDi,
  diOverride
) => {
  const isLegacySignature =
    typeof useNewRicardoMeasurementsEnabledOrDi === 'boolean'
  const di =
    isLegacySignature && diOverride
      ? diOverride
      : useNewRicardoMeasurementsEnabledOrDi || {}
  const useNewRicardoMeasurementsEnabled = isLegacySignature
    ? useNewRicardoMeasurementsEnabledOrDi
    : true

  return {
    isLegacySignature,
    di,
    useNewRicardoMeasurementsEnabled
  }
}

const resolveMeasurementsDependencies = (di) => ({
  logger: di.logger || logger,
  config: di.config || config,
  catchFetchError: di.catchFetchError || catchFetchError,
  optionsEphemeralProtected:
    di.optionsEphemeralProtected || buildApiOptions(di.request),
  options: di.options || {},
  isTestMode: typeof di.isTestMode === 'function' ? di.isTestMode : isTestMode
})

const selectMeasurementsRequestData = ({
  latitude,
  longitude,
  useNewRicardoMeasurementsEnabled,
  deps,
  di,
  isLegacySignature
}) => {
  try {
    const selection = selectMeasurementsUrlAndOptions(
      latitude,
      longitude,
      useNewRicardoMeasurementsEnabled,
      {
        config: deps.config,
        logger: deps.logger,
        optionsEphemeralProtected: deps.optionsEphemeralProtected,
        options: deps.options,
        request: di.request
      }
    )

    return { url: selection.url, opts: selection.opts }
  } catch (err) {
    if (
      isLegacySignature &&
      String(err?.message || '').includes('config fail')
    ) {
      throw err
    }
    deps.logger.error(`Unexpected error in fetchMeasurements: ${err.message}`)
    return null
  }
}

export const fetchMeasurements = async (
  latitude,
  longitude,
  useNewRicardoMeasurementsEnabledOrDi,
  diOverride
) => {
  const { isLegacySignature, di, useNewRicardoMeasurementsEnabled } =
    resolveMeasurementsInputs(useNewRicardoMeasurementsEnabledOrDi, diOverride)
  const deps = resolveMeasurementsDependencies(di)

  // 1. Test mode logic
  const testModeResult = fetchMeasurementsTestMode(deps.isTestMode, deps.logger)
  if (testModeResult) {
    return testModeResult
  }

  // 2. Select API URL and options
  const selection = selectMeasurementsRequestData({
    latitude,
    longitude,
    useNewRicardoMeasurementsEnabled,
    deps,
    di,
    isLegacySignature
  })
  if (!selection) {
    return []
  }

  // 3. Call API and handle response
  return callAndHandleMeasurementsResponse(
    selection.url,
    selection.opts,
    deps.catchFetchError,
    deps.logger
  )
}

/**
 * ''  Extract and set up dependency injection defaults
 */
function setupDependencies(diOverrides) {
  const overrides = diOverrides || {}

  return {
    fetchForecasts: getOverrideOrDefault(
      overrides,
      'fetchForecasts',
      fetchForecasts
    ),
    handleUKLocationData: getOverrideOrDefault(
      overrides,
      'handleUKLocationData',
      localHandleUKLocationData
    ),
    handleNILocationData: getOverrideOrDefault(
      overrides,
      'handleNILocationData',
      localHandleNILocationData
    ),
    isTestMode: getOverrideOrDefault(overrides, 'isTestMode', isTestMode),
    validateParams: getOverrideOrDefault(
      overrides,
      'validateParams',
      validateParams
    ),
    logger: getOverrideOrDefault(overrides, 'logger', logger),
    errorResponse: getOverrideOrDefault(
      overrides,
      'errorResponse',
      errorResponse
    ),
    isMockEnabled: getOverrideOrDefault(
      overrides,
      'isMockEnabled',
      isMockEnabled
    ),
    refreshOAuthToken: getOverrideOrDefault(
      overrides,
      'refreshOAuthToken',
      localRefreshOAuthToken
    ),
    buildUKLocationFilters: getOverrideOrDefault(
      overrides,
      'buildUKLocationFilters',
      buildUKLocationFilters
    ),
    combineUKSearchTerms: getOverrideOrDefault(
      overrides,
      'combineUKSearchTerms',
      combineUKSearchTerms
    ),
    isValidFullPostcodeUK: getOverrideOrDefault(
      overrides,
      'isValidFullPostcodeUK',
      isValidFullPostcodeUK
    ),
    isValidPartialPostcodeUK: getOverrideOrDefault(
      overrides,
      'isValidPartialPostcodeUK',
      isValidPartialPostcodeUK
    ),
    buildUKApiUrl: getOverrideOrDefault(
      overrides,
      'buildUKApiUrl',
      buildUKApiUrl
    ),
    shouldCallUKApi: getOverrideOrDefault(
      overrides,
      'shouldCallUKApi',
      shouldCallUKApi
    ),
    config: getOverrideOrDefault(overrides, 'config', config)
  }
}

const routeFetchDataByLocationType = async ({
  locationType,
  userLocation,
  searchTerms,
  secondSearchTerm,
  optionsOAuth,
  deps,
  diRequest,
  getDailySummary,
  getForecasts,
  diOverrides
}) => {
  if (deps.isTestMode()) {
    return handleTestModeFetchData({
      locationType,
      userLocation,
      searchTerms,
      secondSearchTerm,
      optionsOAuth,
      getDailySummary,
      getForecasts,
      injectedHandleUKLocationData: deps.handleUKLocationData,
      injectedHandleNILocationData: deps.handleNILocationData,
      injectedLogger: deps.logger,
      injectedErrorResponse: deps.errorResponse,
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

  if (locationType === LOCATION_TYPE_NI) {
    logger.info(
      `[FETCH DATA] Step 4: Calling NI Places API for ${userLocation}...`
    )
    const getNIPlaces = await handleNILocation(
      userLocation,
      searchTerms,
      secondSearchTerm,
      optionsOAuth,
      deps,
      diRequest
    )
    logger.info(
      `[FETCH DATA] Step 5: NI Places API complete. Results: ${getNIPlaces?.results?.length ?? 0}`
    )
    return { getDailySummary, getForecasts, getNIPlaces }
  }

  deps.logger.error('Unsupported location type provided:', locationType)
  return deps.errorResponse(
    'Unsupported location type provided',
    STATUS_BAD_REQUEST
  )
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
    shouldCallUKApi: (...args) => di.shouldCallUKApi(...args),
    config: di.config,
    searchTerms,
    secondSearchTerm
  }
  const osPlacesResult =
    typeof di.handleUKLocationData === 'function' &&
    di.handleUKLocationData.length <= 2
      ? await di.handleUKLocationData(userLocation, ukDi)
      : await di.handleUKLocationData(
          userLocation,
          searchTerms,
          secondSearchTerm,
          ukDi
        )
  return osPlacesResult
}

/**
 * ''  Handle NI location data fetching
 */
async function handleNILocation(
  userLocation,
  _searchTerms,
  _secondSearchTerm,
  optionsOAuth,
  di,
  diRequest
) {
  const niDi = { ...di.overrides, request: diRequest || {} }
  // '' Pass userLocation and niDi (which contains request) to handleNILocationData
  const getNIPlaces = await di.handleNILocationData(
    userLocation,
    optionsOAuth,
    niDi
  )
  return getNIPlaces
}

/**
 * ''  Extract daily summary from forecast data
 */
function extractDailySummary(getForecasts) {
  let getDailySummary = getForecasts?.['forecast-summary']
  logger.info(`[DEBUG FORECAST] forecast-summary exists: ${!!getDailySummary}`)
  logger.info(
    `[DEBUG FORECAST] getForecasts keys: ${Object.keys(getForecasts || {}).join(', ')}`
  )
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
  // '' Log issue_date when first received from forecasts API
  const logInfo =
    typeof deps.logger?.info === 'function'
      ? deps.logger.info.bind(deps.logger)
      : logger.info.bind(logger)
  logInfo(
    `[DEBUG issue_date] received from forecasts: ${getDailySummary?.issue_date ?? 'N/A'}`,
    {
      issueDate: getDailySummary?.issue_date,
      requestPath: diRequest?.path,
      requestId: diRequest?.info?.id
    }
  )
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

  logger.info(
    `[FETCH DATA] Starting data fetch for ${locationType}: ${userLocation}`
  )
  logger.info(`[FETCH DATA] Step 1: Building OAuth for NI (if needed)...`)
  const optionsOAuth = await buildOAuthForNI(locationType, deps, request)
  logger.info(`[FETCH DATA] Step 2: Fetching forecasts...`)
  const { getForecasts, getDailySummary } = await fetchAndExtractForecasts(
    deps,
    diRequest,
    diOverrides
  )
  logger.info(`[FETCH DATA] Step 3: Forecast fetch complete`)

  return routeFetchDataByLocationType({
    locationType,
    userLocation,
    searchTerms,
    secondSearchTerm,
    optionsOAuth,
    deps,
    diRequest,
    getDailySummary,
    getForecasts,
    diOverrides
  })
}

export { fetchData, fetchForecasts }
