/* global globalThis, window */
/* eslint-env node */
import { catchProxyFetchError } from '../../common/helpers/catch-proxy-fetch-error.js'
import {
  buildUKLocationFilters,
  combineUKSearchTerms,
  buildUKApiUrl,
  shouldCallUKApi,
  formatUKApiResponse,
  buildNIPostcodeUrl,
  isTestMode,
  errorResponse,
  validateParams,
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK
} from './location-helpers.js'
import { config } from '../../../config/index.js'
import {
  optionsEphemeralProtected as paramOptionsEphemeralProtected,
  options as paramOptions
} from '../../common/helpers/logging/logger-options.js'
import { fetchOAuthToken } from './get-ni-places.js'
import { getOSPlaces as getOSPlacesHelper } from './get-os-places.js'
import { catchFetchError } from '../../common/helpers/catch-fetch-error.js'
import {
  LOCATION_TYPE_NI,
  LOCATION_TYPE_UK,
  FORECASTS_API_PATH,
  HTTP_STATUS_OK,
  STATUS_UNAUTHORIZED,
  SYMBOLS_ARRAY,
  ROUND_OF_SIX,
  MEASUREMENTS_API_PATH
} from '../../data/constants.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { formatNorthernIrelandPostcode } from './convert-string.js'

let SafeURLSearchParams
try {
  if (typeof URLSearchParams !== 'undefined') {
    SafeURLSearchParams = URLSearchParams
  } else if (typeof globalThis !== 'undefined' && globalThis.URLSearchParams) {
    SafeURLSearchParams = globalThis.URLSearchParams
  } else if (typeof window !== 'undefined' && window.URLSearchParams) {
    SafeURLSearchParams = window.URLSearchParams
  }
} catch (e) {
  // Ignore if unable to polyfill
}
// Helper to call the forecasts API and handle the response
async function callAndHandleForecastsResponse(
  url,
  opts,
  injectedCatchFetchError,
  injectedHttpStatusOk,
  injectedLogger,
  injectedErrorResponse
) {
  const [forecastStatus, getForecasts] = await injectedCatchFetchError(
    url,
    opts
  )
  if (forecastStatus !== injectedHttpStatusOk) {
    injectedLogger.error(
      'Error fetching forecasts data: status code',
      forecastStatus
    )
    return injectedErrorResponse(
      'Forecasts fetch failed',
      forecastStatus || 500
    )
  }
  injectedLogger.info('Forecasts data fetched')
  return getForecasts
}

const logger = createLogger()
const isMockEnabled = false
// Ensure these are available at the top level for DI helpers
const optionsEphemeralProtected = paramOptionsEphemeralProtected
const options = paramOptions
// Helper to normalize location type
function normalizeLocationType(locationType) {
  if (locationType === 'UK' || locationType === LOCATION_TYPE_UK) {
    return LOCATION_TYPE_UK
  }
  if (locationType === 'NI' || locationType === LOCATION_TYPE_NI) {
    return LOCATION_TYPE_NI
  }
  return locationType
}

// Helper to build UK test mode result
function buildUKTestModeResult(getOSPlaces) {
  return {
    getDailySummary: 'summary',
    getForecasts: 'summary',
    getOSPlaces: {
      results: Array.isArray(getOSPlaces?.results)
        ? getOSPlaces.results
        : [getOSPlaces]
    }
  }
}

// Helper to build NI test mode result
function buildNITestModeResult(getNIPlaces) {
  return {
    getDailySummary: 'summary',
    getForecasts: { 'forecast-summary': 'summary' },
    getNIPlaces: getNIPlaces || { results: [] }
  }
}

// Helper to handle unsupported location type
function handleUnsupportedLocationType(
  injectedLogger,
  injectedErrorResponse,
  locationType
) {
  injectedLogger.error('Unsupported location type provided:', locationType)
  return injectedErrorResponse('Unsupported location type provided', 400)
}
// Helper to setup DI for fetchForecasts
function setupFetchForecastsDI(di = {}) {
  return {
    injectedConfig: di.config || config,
    injectedLogger: di.logger || logger,
    injectedCatchFetchError: di.catchFetchError || catchFetchError,
    injectedErrorResponse: di.errorResponse || errorResponse,
    injectedIsTestMode: di.isTestMode || isTestMode,
    injectedForecastsApiPath: di.FORECASTS_API_PATH || FORECASTS_API_PATH,
    injectedHttpStatusOk: di.HTTP_STATUS_OK || HTTP_STATUS_OK,
    injectedOptionsEphemeralProtected:
      di.optionsEphemeralProtected || optionsEphemeralProtected,
    injectedOptions: di.options || options
  }
}

// Helper to select the correct forecasts URL and options based on environment
// ''
// Refactored to use the request object for local detection
function selectForecastsUrlAndOptions({
  request,
  forecastsApiUrl,
  optionsEphemeralProtected: localOptionsEphemeralProtected,
  options: localOptions
}) {
  // ''
  // Only use the request object to determine if the call is local
  let isLocal = false
  if (request && request.headers && request.headers.host) {
    const host = request.headers.host
    isLocal = host.includes('localhost') || host.includes('127.0.0.1')
  }
  let url = forecastsApiUrl
  if (isLocal && typeof config?.get === 'function') {
    const ephemeralProtectedDevApiUrl = config.get(
      'ephemeralProtectedDevApiUrl'
    )
    if (ephemeralProtectedDevApiUrl) {
      url = ephemeralProtectedDevApiUrl + FORECASTS_API_PATH
    }
  }
  return {
    url,
    opts: isLocal ? localOptionsEphemeralProtected : localOptions // ''
  }
}

// Helper to handle API call and response for forecasts
async function callForecastsApi({
  injectedConfig,
  injectedOptionsEphemeralProtected,
  injectedOptions,
  injectedCatchFetchError,
  injectedHttpStatusOk,
  injectedLogger,
  injectedErrorResponse,
  request
}) {
  const forecastsApiUrl = injectedConfig.get('forecastsApiUrl')
  // ''
  const { url, opts } = selectForecastsUrlAndOptions({
    request,
    forecastsApiUrl,
    optionsEphemeralProtected: injectedOptionsEphemeralProtected,
    options: injectedOptions
  })
  return callAndHandleForecastsResponse(
    url,
    opts,
    injectedCatchFetchError,
    injectedHttpStatusOk,
    injectedLogger,
    injectedErrorResponse
  )
}
// Helper to setup DI for handleNILocationData
function setupNILocationDataDI(di = {}) {
  return {
    injectedLogger: di.logger || logger,
    injectedBuildNIPostcodeUrl: di.buildNIPostcodeUrl || buildNIPostcodeUrl,
    injectedIsMockEnabled:
      di.isMockEnabled !== undefined ? di.isMockEnabled : isMockEnabled,
    injectedConfig: di.config || config,
    injectedFormatNorthernIrelandPostcode:
      di.formatNorthernIrelandPostcode || formatNorthernIrelandPostcode,
    injectedCatchProxyFetchError:
      di.catchProxyFetchError || catchProxyFetchError,
    injectedIsTestMode: di.isTestMode || isTestMode
  }
}

// Helper to setup DI for handleUKLocationData
function setupUKLocationDataDI(di = {}) {
  return {
    injectedLogger: di.logger || logger,
    injectedConfig: di.config || config,
    injectedBuildUKLocationFilters:
      di.buildUKLocationFilters || buildUKLocationFilters,
    injectedCombineUKSearchTerms:
      di.combineUKSearchTerms || combineUKSearchTerms,
    injectedIsValidFullPostcodeUK:
      di.isValidFullPostcodeUK || isValidFullPostcodeUK,
    injectedIsValidPartialPostcodeUK:
      di.isValidPartialPostcodeUK || isValidPartialPostcodeUK,
    injectedBuildUKApiUrl: di.buildUKApiUrl || buildUKApiUrl,
    injectedShouldCallUKApi: di.shouldCallUKApi || shouldCallUKApi,
    injectedCatchProxyFetchError:
      di.catchProxyFetchError || catchProxyFetchError,
    injectedFormatUKApiResponse: di.formatUKApiResponse || formatUKApiResponse,
    injectedIsTestMode: di.isTestMode || isTestMode,
    injectedSymbolsArray: di.SYMBOLS_ARRAY || SYMBOLS_ARRAY,
    injectedHttpStatusOk: di.HTTP_STATUS_OK || HTTP_STATUS_OK,
    injectedOptions: di.options || options
  }
}

export async function buildNIOptionsOAuth({
  request,
  injectedIsMockEnabled,
  injectedRefreshOAuthToken
}) {
  let optionsOAuth
  let accessToken
  if (!injectedIsMockEnabled) {
    const savedAccessToken = request.yar.get('savedAccessToken')
    accessToken = savedAccessToken || (await injectedRefreshOAuthToken(request))
    optionsOAuth = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  }
  return { optionsOAuth, accessToken }
}
// Helper to handle test mode logic for fetchDailySummary
export function fetchDailySummaryTestMode(injectedIsTestMode, injectedLogger) {
  if (injectedIsTestMode && injectedIsTestMode()) {
    if (injectedLogger && typeof injectedLogger.info === 'function') {
      injectedLogger.info('Test mode: fetchDailySummary returning mock summary')
    }
    return { summary: 'mock-summary' }
  }
  return null
}

// ''
// Refactored to use the request object for local detection
export function selectDailySummaryUrlAndOptions({
  request,
  forecastsApiUrl,
  options: localOptions
}) {
  // ''
  // Only use the request object to determine if the call is local
  let isLocal = false
  if (request && request.headers && request.headers.host) {
    const host = request.headers.host
    isLocal = host.includes('localhost') || host.includes('127.0.0.1')
  }
  let url = forecastsApiUrl
  let selectedOptions = paramOptions
  if (isLocal && typeof config?.get === 'function') {
    const ephemeralProtectedDevApiUrl = config.get(
      'ephemeralProtectedDevApiUrl'
    )
    if (ephemeralProtectedDevApiUrl) {
      url = ephemeralProtectedDevApiUrl + FORECASTS_API_PATH
      selectedOptions = paramOptionsEphemeralProtected
    }
  }
  // Use localOptions if provided, otherwise fallback to selectedOptions
  return {
    url,
    opts: localOptions || selectedOptions // ''
  }
}

// Helper to call the daily summary API and handle the response
export async function callAndHandleDailySummaryResponse(
  url,
  opts,
  injectedCatchFetchError,
  injectedLogger,
  injectedErrorResponse
) {
  if (injectedLogger && typeof injectedLogger.info === 'function') {
    injectedLogger.info(`Fetch Daily Summary URL: ${url}`)
    injectedLogger.info(`Fetch Daily Summary Options: ${JSON.stringify(opts)}`)
  }
  const [status, data] = await injectedCatchFetchError(url, opts)
  if (status !== HTTP_STATUS_OK) {
    injectedLogger.error('Error fetching daily summary: status code', status)
    return injectedErrorResponse('Daily summary fetch failed', status || 500)
  }
  injectedLogger.info('Daily summary data fetched')
  return data
}
// Helper to handle test mode logic for fetchMeasurements
export function fetchMeasurementsTestMode(injectedIsTestMode, injectedLogger) {
  if (injectedIsTestMode?.()) {
    if (injectedLogger && typeof injectedLogger.info === 'function') {
      injectedLogger.info(
        'Test mode: fetchMeasurements returning mock measurements'
      )
    }
    return [{ measurement: 'mock-measurement' }]
  }
  return null
}

// Helper to select API URL and options for new/old Ricardo measurements
export function selectMeasurementsUrlAndOptions(
  latitude,
  longitude,
  useNewRicardoMeasurementsEnabled,
  di = {}
) {
  const {
    injectedConfig,
    injectedLogger,
    injectedOptionsEphemeralProtected,
    injectedOptions,
    request
  } = di
  const formatCoordinate = (coord) => Number(coord).toFixed(ROUND_OF_SIX)
  if (useNewRicardoMeasurementsEnabled) {
    injectedLogger.info(
      'Using mock measurements with latitude:',
      latitude,
      ', longitude:',
      longitude
    )
    // Use SafeURLSearchParams polyfill for all environments
    if (!SafeURLSearchParams) {
      throw new Error('URLSearchParams is not available in this environment')
    }
    const queryParams = new SafeURLSearchParams({
      page: '1',
      'latest-measurement': 'true',
      'with-closed': 'false',
      'with-pollutants': 'true',
      latitude: formatCoordinate(latitude),
      longitude: formatCoordinate(longitude),
      'networks[]': '4',
      totalItems: '3',
      distance: '60',
      'daqi-pollutant': 'true'
    })
    const baseUrl = injectedConfig.get('ricardoMeasurementsApiUrl')
    const newRicardoMeasurementsApiUrl = `${baseUrl}?${queryParams.toString()}`
    injectedLogger.info(
      'New Ricardo measurements API URL:',
      newRicardoMeasurementsApiUrl
    )
    // Use isLocal logic based on request object
    let isLocal = false
    if (request && request.headers && request.headers.host) {
      const host = request.headers.host
      isLocal = host.includes('localhost') || host.includes('127.0.0.1')
    }
    if (isLocal) {
      const ephemeralProtectedDevApiUrl = injectedConfig.get(
        'ephemeralProtectedDevApiUrl'
      )
      return {
        url: `${ephemeralProtectedDevApiUrl}${MEASUREMENTS_API_PATH}${queryParams.toString()}`,
        opts: injectedOptionsEphemeralProtected
      }
    } else {
      return {
        url: newRicardoMeasurementsApiUrl,
        opts: injectedOptions
      }
    }
  } else {
    const measurementsAPIurl = injectedConfig.get('measurementsApiUrl')
    injectedLogger.info('Old measurements API URL:', measurementsAPIurl)
    return {
      url: measurementsAPIurl,
      opts: injectedOptions
    }
  }
}

// Helper to call the measurements API and handle the response
export async function callAndHandleMeasurementsResponse(
  url,
  opts,
  injectedCatchFetchError,
  injectedLogger
) {
  const [status, data] = await injectedCatchFetchError(url, opts)
  if (status !== 200) {
    injectedLogger.error('Error fetching data:', data && data.message)
    return []
  }
  injectedLogger.info('Data fetched successfully.')
  return data || []
}
// Helper to handle test mode logic for fetchForecasts
export function fetchForecastsTestMode(injectedIsTestMode, injectedLogger) {
  if (injectedIsTestMode?.()) {
    if (injectedLogger && typeof injectedLogger.info === 'function') {
      injectedLogger.info('Test mode: fetchForecasts returning mock forecasts')
    }
    return { forecasts: 'mock-forecasts' }
  }
  return null
}
// Helper to call the UK API and handle the response
export async function callAndHandleUKApiResponse(
  osNamesApiUrlFull,
  injectedOptions,
  injectedOptionsEphemeralProtected,
  shouldCallApi,
  injectedCatchProxyFetchError,
  injectedHttpStatusOk,
  injectedLogger,
  injectedFormatUKApiResponse
) {
  const isLocal =
    String(osNamesApiUrlFull).includes('localhost') ||
    String(osNamesApiUrlFull).includes('127.0.0.1')
  const selectedOptions = isLocal
    ? injectedOptionsEphemeralProtected
    : injectedOptions
  injectedLogger.info(
    `[DEBUG] Calling catchProxyFetchError with URL: ${osNamesApiUrlFull}`
  )
  injectedLogger.info('[DEBUG] Options:', JSON.stringify(selectedOptions))
  const [statusCodeOSPlace, getOSPlaces] = await injectedCatchProxyFetchError(
    osNamesApiUrlFull,
    selectedOptions,
    shouldCallApi
  )
  if (statusCodeOSPlace === injectedHttpStatusOk) {
    injectedLogger.info('getOSPlaces data fetched:')
    return injectedFormatUKApiResponse(getOSPlaces)
  } else {
    if (statusCodeOSPlace === STATUS_UNAUTHORIZED) {
      injectedLogger.warn(
        `OS Names API returned 401 (unauthorized). Check OS_NAMES_API_KEY. URL was suppressed in logs.`
      )
      return null
    } else {
      injectedLogger.error(
        'Error fetching statusCodeOSPlace data:',
        statusCodeOSPlace
      )
      return null
    }
  }
}
// Helper to build the UK API URL and check for API key
export function buildAndCheckUKApiUrl(
  userLocation,
  searchTerms,
  secondSearchTerm,
  injected
) {
  const filters = injected.buildUKLocationFilters()
  const osNamesApiUrl = injected.config.get('osNamesApiUrl')
  const osNamesApiKey = injected.config.get('osNamesApiKey')
  const hasOsKey = Boolean(osNamesApiKey && String(osNamesApiKey).trim() !== '')
  const combinedLocation = injected.combineUKSearchTerms(
    userLocation,
    searchTerms,
    secondSearchTerm,
    injected.isValidFullPostcodeUK,
    injected.isValidPartialPostcodeUK
  )
  const osNamesApiUrlFull = injected.buildUKApiUrl(
    combinedLocation,
    filters,
    osNamesApiUrl,
    osNamesApiKey
  )
  return { osNamesApiUrlFull, hasOsKey, combinedLocation }
}
// Helper to handle test mode logic for UK location data
export function handleUKLocationDataTestMode(
  injectedIsTestMode,
  injectedLogger
) {
  if (injectedIsTestMode?.()) {
    if (injectedLogger && typeof injectedLogger.info === 'function') {
      injectedLogger.info('Test mode: handleUKLocationData returning mock data')
    }
    return { results: ['ukData'] }
  } else {
    return null
  }
}

// ...existing code...
/**
 * Handles UK Location Data fetch.
 * @param {object} userLocation
 * @param {string} searchTerms
 * @param {string} secondSearchTerm
 * @param {object} di - Dependency injection object: {
 *   logger, config, buildUKLocationFilters, combineUKSearchTerms, isValidFullPostcodeUK, isValidPartialPostcodeUK,
 *   buildUKApiUrl, shouldCallUKApi, catchProxyFetchError, formatUKApiResponse, isTestMode, SYMBOLS_ARRAY, HTTP_STATUS_OK, options
 * }
 * @returns {object} API response or mock/test-mode value
 */
const handleUKLocationData = async (
  userLocation,
  searchTerms,
  secondSearchTerm,
  di = {}
) => {
  const {
    injectedLogger,
    injectedBuildUKLocationFilters,
    injectedCombineUKSearchTerms,
    injectedIsValidFullPostcodeUK,
    injectedIsValidPartialPostcodeUK,
    injectedBuildUKApiUrl,
    injectedShouldCallUKApi,
    injectedIsTestMode,
    injectedSymbolsArray,
    injectedOptions,
    injectedOptionsEphemeralProtected,
    injectedConfig,
    request
  } = setupUKLocationDataDI(di)

  // 1. Test mode logic
  const testModeResult = handleUKLocationDataTestMode(
    injectedIsTestMode,
    injectedLogger
  )
  if (testModeResult) {
    return testModeResult
  }

  // 2. Build API URL and check key
  const injected = {
    buildUKLocationFilters: injectedBuildUKLocationFilters,
    combineUKSearchTerms: injectedCombineUKSearchTerms,
    isValidFullPostcodeUK: injectedIsValidFullPostcodeUK,
    isValidPartialPostcodeUK: injectedIsValidPartialPostcodeUK,
    buildUKApiUrl: injectedBuildUKApiUrl,
    config: injectedConfig
  }
  const { hasOsKey, combinedLocation } = buildAndCheckUKApiUrl(
    userLocation,
    searchTerms,
    secondSearchTerm,
    injected
  )
  if (!hasOsKey) {
    injectedLogger.warn(
      'OS_NAMES_API_KEY not set; skipping OS Names API call and returning empty results.'
    )
    return { results: [] }
  }
  const finalUserLocation = combinedLocation

  // 3. Call API and handle response
  const shouldCallApi = injectedShouldCallUKApi(
    finalUserLocation,
    injectedSymbolsArray
  )
  return getOSPlacesHelper(
    finalUserLocation,
    searchTerms,
    secondSearchTerm,
    shouldCallApi,
    injectedOptions,
    injectedOptionsEphemeralProtected,
    request
  )
}

/**
 * Handles NI Location Data fetch.
 * @param {object} userLocation
 * @param {object} optionsOAuth
 * @param {object} di - Dependency injection object: {
 *   logger, buildNIPostcodeUrl, isMockEnabled, config, formatNorthernIrelandPostcode,
 *   catchProxyFetchError, isTestMode
 * }
 * @returns {object} API response or mock/test-mode value
 */
const handleNILocationData = async (
  userLocation,
  optionsOAuth,
  searchTerms,
  secondSearchTerm,
  shouldCallApi,
  injectedOptions,
  injectedOptionsEphemeralProtected,
  request,
  di = {}
) => {
  // Setup DI
  const { injectedLogger, injectedIsTestMode } = setupNILocationDataDI(di)

  // Explicit test mode logic
  if (injectedIsTestMode?.()) {
    if (injectedLogger && typeof injectedLogger.info === 'function') {
      injectedLogger.info('Test mode: handleNILocationData returning mock data')
    }
    return { results: ['niData'] }
  }

  return getOSPlacesHelper(
    userLocation,
    searchTerms,
    secondSearchTerm,
    shouldCallApi,
    injectedOptions,
    injectedOptionsEphemeralProtected,
    request
  )
}
/**
 * Refreshes OAuth token and stores it in session.
 * @param {object} request - Hapi request object (required for session)
 * @param {object} di - Dependency injection object: { logger, fetchOAuthToken, isTestMode }
 * @returns {object} accessToken or mock value in test mode
 */
const refreshOAuthToken = async (request, di = {}) => {
  // Dependency injection with fallbacks
  const injectedLogger = di.logger || logger
  const injectedFetchOAuthToken = di.fetchOAuthToken || fetchOAuthToken
  const injectedIsTestMode = di.isTestMode || isTestMode

  // Explicit test mode logic
  if (injectedIsTestMode?.()) {
    if (injectedLogger && typeof injectedLogger.info === 'function') {
      injectedLogger.info('Test mode: refreshOAuthToken returning mock token')
    }
    return { accessToken: 'mock-token' }
  }

  // Production logic
  const accessToken = await injectedFetchOAuthToken({ logger: injectedLogger })
  if (accessToken?.error) {
    return accessToken
  }
  request.yar.clear('savedAccessToken')
  request.yar.set('savedAccessToken', accessToken)
  return accessToken
}

/**
 * Fetch forecasts from API
 */

/**
 * Fetches forecasts from API.
 * @param {object} di - Dependency injection object: {
 *   config, logger, catchFetchError, errorResponse, isTestMode, FORECASTS_API_PATH, HTTP_STATUS_OK, optionsEphemeralProtected, options
 * }
 * @returns {object} API response or mock/test-mode value
 */
const fetchForecasts = async (di = {}) => {
  // Setup DI
  const {
    injectedConfig,
    injectedLogger,
    injectedCatchFetchError,
    injectedErrorResponse,
    injectedIsTestMode,
    injectedForecastsApiPath,
    injectedHttpStatusOk,
    injectedOptionsEphemeralProtected,
    injectedOptions,
    request
  } = { ...setupFetchForecastsDI(di), ...di }

  // Explicit test mode logic
  const testModeResult = fetchForecastsTestMode(
    injectedIsTestMode,
    injectedLogger
  )
  if (testModeResult) {
    // Always provide forecast-summary in test mode
    if (!testModeResult['forecast-summary']) {
      testModeResult['forecast-summary'] = { today: null }
    }
    return testModeResult
  }

  // Production logic
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
  // Always provide forecast-summary property, even if missing
  if (
    forecastsResult &&
    typeof forecastsResult === 'object' &&
    !('forecast-summary' in forecastsResult)
  ) {
    forecastsResult['forecast-summary'] = { today: null }
  }
  return forecastsResult
}

/**
 * Fetches measurements from API.
 * @param {number} latitude
 * @param {number} longitude
 * @param {boolean} useNewRicardoMeasurementsEnabled
 * @param {object} di - Dependency injection object: {
 *   logger, config, catchFetchError, optionsEphemeralProtected, options, nodeEnv, isTestMode
 * }
 * @returns {object[]} API response or mock/test-mode value
 */
export const fetchMeasurements = async (
  latitude,
  longitude,
  useNewRicardoMeasurementsEnabled,
  di = {}
) => {
  // Dependency injection with fallbacks
  const injectedLogger = di.logger || logger
  const injectedConfig = di.config || config
  const injectedCatchFetchError = di.catchFetchError || catchFetchError
  const injectedOptionsEphemeralProtected =
    di.optionsEphemeralProtected || optionsEphemeralProtected
  const injectedOptions = di.options || options
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

/**
 * Fetch daily summary from API
 */

// ''

// ''
export function handleTestModeFetchData({
  locationType,
  userLocation,
  searchTerms,
  secondSearchTerm,
  optionsOAuth,
  // getDailySummary and getForecasts are not used in this function
  injectedHandleUKLocationData,
  injectedHandleNILocationData,
  injectedLogger,
  injectedErrorResponse,
  args
}) {
  const type = normalizeLocationType(locationType)
  if (type === LOCATION_TYPE_UK) {
    const osPlacesResult = injectedHandleUKLocationData(
      userLocation,
      searchTerms,
      secondSearchTerm,
      args || {}
    )
    return buildUKTestModeResult(osPlacesResult)
  } else if (type === LOCATION_TYPE_NI) {
    const result = injectedHandleNILocationData(
      userLocation,
      optionsOAuth,
      args || {}
    )
    if (result && typeof result.then === 'function') {
      return result.then((getNIPlaces) => buildNITestModeResult(getNIPlaces))
    }
    return buildNITestModeResult(result)
  } else {
    return handleUnsupportedLocationType(
      injectedLogger,
      injectedErrorResponse,
      locationType
    )
  }
}

async function fetchData(
  request,
  { locationType, userLocation, searchTerms, secondSearchTerm },
  diOverrides = {}
) {
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
    refreshOAuthToken: injectedRefreshOAuthToken = refreshOAuthToken
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
    const di = { ...diOverrides, request: diRequest || {} }
    const osPlacesResult = await injectedHandleUKLocationData(
      userLocation,
      searchTerms,
      secondSearchTerm,
      di
    )
    return { getDailySummary, getForecasts, getOSPlaces: osPlacesResult }
  } else if (locationType === LOCATION_TYPE_NI) {
    const di = { ...diOverrides, request: diRequest || {} }
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

// Grouped exports for clarity


// Grouped exports for clarity
export {
  fetchData,
  handleUKLocationData,
  handleNILocationData,
  fetchForecasts,
  refreshOAuthToken,
  // Add all helpers required by tests
  normalizeLocationType,
  buildUKTestModeResult,
  buildNITestModeResult,
  handleUnsupportedLocationType,
  selectForecastsUrlAndOptions,
  callAndHandleForecastsResponse,
  // Add any other helpers as needed
}
