import { getOSPlaces as getOSPlacesHelper } from '../get-os-places.js'
import { getNIPlaces } from '../get-ni-places.js'
import { handleUKLocationDataTestMode } from './test-mode-helpers.js'
import { buildAndCheckUKApiUrl } from './api-utils.js'
import { catchFetchError } from '../../../common/helpers/catch-fetch-error.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { fetchOAuthToken } from '../../../common/helpers/fetch-oauth-token.js'
import { STATUS_BAD_REQUEST } from '../../../data/constants.js'
export {
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK,
  isValidFullPostcodeNI,
  isValidPartialPostcodeNI
} from '../convert-string.js'

// Helper to detect test mode for DI and unit tests
function isTestMode() {
  return (
    typeof process !== 'undefined' &&
    process.env &&
    (process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true')
  )
}

const logger = createLogger()

// Proxy-aware fetch error handler (stub, uses catchFetchError)
async function catchProxyFetchError(url, options, ...args) {
  // You can add proxy logic here if needed
  return catchFetchError(url, options, ...args)
}

function isRefreshTokenTestMode(testIsTestMode) {
  return Boolean(testIsTestMode?.())
}

function buildMockRefreshTokenResponse(testLogger) {
  if (testLogger && typeof testLogger.info === 'function') {
    testLogger.info('Test mode: refreshOAuthToken returning mock token')
  }
  return { accessToken: 'mock-token' }
}

function persistSavedAccessToken(request, accessToken) {
  if (!request?.yar) {
    return
  }

  request.yar.clear('savedAccessToken')
  request.yar.set('savedAccessToken', accessToken)
}

function getSavedAccessToken(request) {
  return request?.yar?.get?.('savedAccessToken')
}

function resolveOAuthErrorFallback(accessToken, savedAccessToken, testLogger) {
  if (!accessToken?.error) {
    return null
  }

  if (!savedAccessToken) {
    return accessToken
  }

  testLogger.warn('OAuth token fetch failed; using saved access token fallback')
  return { accessToken: savedAccessToken, isFallback: true }
}

const refreshOAuthToken = async (request, di = {}) => {
  const testLogger = di.logger || logger
  const testFetchOAuthToken = di.fetchOAuthToken || fetchOAuthToken
  const testIsTestMode = di.isTestMode || isTestMode
  // '' Read saved access token for fallback on fetch failure
  const savedAccessToken = getSavedAccessToken(request)

  if (isRefreshTokenTestMode(testIsTestMode)) {
    return buildMockRefreshTokenResponse(testLogger)
  }

  const accessToken = await testFetchOAuthToken({ logger: testLogger })
  const fallbackResponse = resolveOAuthErrorFallback(
    accessToken,
    savedAccessToken,
    testLogger
  )
  if (fallbackResponse) {
    return fallbackResponse
  }

  // '' Guard against missing request or yar (session) object
  persistSavedAccessToken(request, accessToken)
  return { accessToken }
}

const resolveNIDi = (...args) => {
  const maybeDi = args[args.length - 1]
  return maybeDi && typeof maybeDi === 'object' ? maybeDi : {}
}

const handleNILocationData = async (...args) => {
  const userLocation = args[0]
  const di = resolveNIDi(...args)
  const testLogger = di.logger || logger
  const testIsTestMode = di.isTestMode || isTestMode
  const testIsMockEnabled =
    typeof di.isMockEnabled === 'function'
      ? di.isMockEnabled()
      : Boolean(di.isMockEnabled)
  const request = di.request

  if (testIsTestMode?.()) {
    if (testLogger && typeof testLogger.info === 'function') {
      testLogger.info('Test mode: handleNILocationData returning mock data')
    }
    return { results: ['niData'] }
  }
  if (testIsMockEnabled) {
    return { results: ['niData'] }
  }
  // ''  Use getNIPlaces for NI lookups - pass request for OAuth token refresh
  return getNIPlaces(userLocation, request)
}

const resolveUKArgs = (...args) => {
  if (args.length >= 4) {
    return {
      userLocation: args[0],
      searchTerms: args[1],
      secondSearchTerm: args[2],
      di: args[3] || {}
    }
  }

  return {
    userLocation: args[0],
    searchTerms: args[1]?.searchTerms,
    secondSearchTerm: args[1]?.secondSearchTerm,
    di: args[1] || {}
  }
}

const resolveUKDependencies = (di = {}) => ({
  testLogger: di.logger || logger,
  testGetOSPlacesHelper: di.getOSPlacesHelper || getOSPlacesHelper,
  testBuildUKLocationFilters: di.buildUKLocationFilters,
  testCombineUKSearchTerms: di.combineUKSearchTerms,
  testIsValidFullPostcodeUK: di.isValidFullPostcodeUK,
  testIsValidPartialPostcodeUK: di.isValidPartialPostcodeUK,
  testBuildUKApiUrl: di.buildUKApiUrl,
  testShouldCallUKApi: di.shouldCallUKApi,
  testIsTestMode: di.isTestMode || isTestMode,
  testSymbolsArray:
    di.symbolsArray ?? di.SYMBOLS_ARRAY ?? di.injectedSymbolsArray ?? [],
  testOptions: di.options,
  testConfig: di.config,
  request: di.request
})

const buildUkApiDeps = (resolved) => ({
  buildUKLocationFilters: resolved.testBuildUKLocationFilters,
  combineUKSearchTerms: resolved.testCombineUKSearchTerms,
  isValidFullPostcodeUK: resolved.testIsValidFullPostcodeUK,
  isValidPartialPostcodeUK: resolved.testIsValidPartialPostcodeUK,
  buildUKApiUrl: resolved.testBuildUKApiUrl,
  config: resolved.testConfig
})

const handleUKLocationData = async (...args) => {
  const { userLocation, searchTerms, secondSearchTerm, di } = resolveUKArgs(
    ...args
  )
  // ''  Simple DI with fallbacks
  const resolved = resolveUKDependencies(di)

  const testModeResult = handleUKLocationDataTestMode(
    resolved.testIsTestMode,
    resolved.testLogger
  )
  if (testModeResult) {
    if (resolved.testLogger && typeof resolved.testLogger.info === 'function') {
      resolved.testLogger.info(
        'Test mode: handleUKLocationData returning mock data'
      )
    }
    return testModeResult
  }

  const deps = buildUkApiDeps(resolved)
  const { hasOsKey, combinedLocation } = buildAndCheckUKApiUrl(
    userLocation,
    searchTerms,
    secondSearchTerm,
    deps
  )

  if (!hasOsKey) {
    resolved.testLogger.warn(
      'OS_NAMES_API_KEY not set; skipping OS Names API call and returning empty results.'
    )
    return { results: [] }
  }

  const finalUserLocation = combinedLocation
  const shouldCallApi = resolved.testShouldCallUKApi(
    finalUserLocation,
    resolved.testSymbolsArray
  )

  return resolved.testGetOSPlacesHelper(
    finalUserLocation,
    searchTerms,
    secondSearchTerm,
    shouldCallApi,
    resolved.testOptions,
    resolved.request,
    undefined // catchProxyFetchErrorFn - will use default
  )
}

const buildNIOptionsOAuth = async ({
  request,
  isMockEnabled,
  injectedIsMockEnabled,
  refreshOAuthTokenFn,
  injectedRefreshOAuthToken
}) => {
  const resolvedIsMockEnabled = isMockEnabled ?? injectedIsMockEnabled
  const resolvedRefreshOAuthToken =
    refreshOAuthTokenFn || injectedRefreshOAuthToken

  // Check if isMockEnabled is a function and call it, otherwise use as boolean
  const isMock =
    typeof resolvedIsMockEnabled === 'function'
      ? resolvedIsMockEnabled()
      : !!resolvedIsMockEnabled

  logger.info(`buildNIOptionsOAuth called - isMockEnabled: ${isMock}`)
  let accessToken
  let optionsOAuth

  if (isMock) {
    logger.info('Mock is enabled, skipping OAuth token fetch')
    optionsOAuth = {}
  } else {
    logger.info('Mock is disabled, fetching OAuth token...')
    // '' Guard against missing request or yar object
    const savedAccessToken = request?.yar?.get('savedAccessToken')
    logger.info(`Saved access token exists: ${!!savedAccessToken}`)
    // '' Extract accessToken from the returned object if we need to refresh
    const tokenResult =
      savedAccessToken || (await resolvedRefreshOAuthToken(request))
    // '' Handle both cases: savedAccessToken is a string, tokenResult is an object
    accessToken =
      typeof tokenResult === 'string' ? tokenResult : tokenResult?.accessToken
    logger.info(`Access token obtained: ${!!accessToken}`)
    optionsOAuth = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  }
  // Always return an object for optionsOAuth, even in mock mode
  return { optionsOAuth, accessToken }
}

function handleUnsupportedLocationType() {
  return function createHandler(errorLogger, errorResponse, locationType) {
    errorLogger.error('Unsupported location type provided:', locationType)
    return errorResponse(
      'Unsupported location type provided',
      STATUS_BAD_REQUEST
    )
  }
}

// Builds a Northern Ireland postcode URL (stub implementation)
function buildNIPostcodeUrl(postcode) {
  if (!postcode) {
    return ''
  }
  const configArg = arguments[1]
  const baseUrl =
    configArg?.niApiBaseUrl || 'https://api.ni.example.com/postcode'
  return `${baseUrl}/${encodeURIComponent(postcode)}`
}

// Formats the UK API response (stub implementation)
function formatUKApiResponse(response) {
  return response
}

// Formats a Northern Ireland postcode (stub implementation)
function formatNorthernIrelandPostcode(postcode) {
  if (!postcode) {
    return ''
  }
  return postcode.trim().toUpperCase().replaceAll(/\s+/g, '')
}

// Combines UK search terms (stub implementation)
function combineUKSearchTerms(term1, term2) {
  if (!term1 && !term2) {
    return ''
  }
  if (!term1) {
    return term2
  }
  if (!term2) {
    return term1
  }
  return `${term1} ${term2}`
}

// Builds UK location filters (stub implementation)
function buildUKLocationFilters(location) {
  if (!location) {
    return {}
  }
  return { filter: `location=${encodeURIComponent(location)}` }
}

// Builds a UK API URL (stub implementation)
function buildUKApiUrl(location) {
  if (!location) {
    return ''
  }
  const configArg = arguments[1]
  const baseUrl =
    configArg?.ukApiBaseUrl || 'https://api.uk.example.com/location'
  return `${baseUrl}/${encodeURIComponent(location)}`
}

// Add all helpers that may be imported elsewhere
export {
  refreshOAuthToken,
  handleNILocationData,
  handleUKLocationData,
  buildNIOptionsOAuth,
  handleUnsupportedLocationType,
  catchProxyFetchError,
  buildNIPostcodeUrl,
  buildUKApiUrl,
  buildUKLocationFilters,
  formatNorthernIrelandPostcode,
  formatUKApiResponse,
  combineUKSearchTerms
}
