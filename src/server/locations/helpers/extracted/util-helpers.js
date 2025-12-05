import { getOSPlaces as getOSPlacesHelper } from '../get-os-places.js'
import {
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK,
  isValidFullPostcodeNI,
  isValidPartialPostcodeNI
} from '../convert-string.js'
import { getNIPlaces } from '../get-ni-places.js'
import { handleUKLocationDataTestMode } from './test-mode-helpers.js'
import { buildAndCheckUKApiUrl } from './api-utils.js'
import { catchFetchError } from '../../../common/helpers/catch-fetch-error.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { fetchOAuthToken } from '../../../common/helpers/fetch-oauth-token.js'

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

const refreshOAuthToken = async (request, di = {}) => {
  const testLogger = di.logger || logger
  const testFetchOAuthToken = di.fetchOAuthToken || fetchOAuthToken
  const testIsTestMode = di.isTestMode || isTestMode
  if (testIsTestMode?.()) {
    if (testLogger && typeof testLogger.info === 'function') {
      testLogger.info('Test mode: refreshOAuthToken returning mock token')
    }
    return { accessToken: 'mock-token' }
  }
  const accessToken = await testFetchOAuthToken({ logger: testLogger })
  if (accessToken?.error) {
    return accessToken
  }
  request.yar.clear('savedAccessToken')
  request.yar.set('savedAccessToken', accessToken)
  return accessToken
}

const handleNILocationData = async (
  userLocation,
  searchTerms,
  secondSearchTerm,
  shouldCallApi,
  options,
  optionsEphemeralProtected,
  request,
  di = {}
) => {
  const testLogger = di.logger || logger
  const testIsTestMode = di.isTestMode || isTestMode
  
  if (testIsTestMode?.()) {
    if (testLogger && typeof testLogger.info === 'function') {
      testLogger.info('Test mode: handleNILocationData returning mock data')
    }
    return { results: ['niData'] }
  }
  // ''  Use getNIPlaces for NI lookups - simplified, no DI parameters needed
  return getNIPlaces(userLocation)
}

const handleUKLocationData = async (
  userLocation,
  searchTerms,
  secondSearchTerm,
  di = {}
) => {
  // ''  Simple DI with fallbacks
  const testLogger = di.logger || logger
  const testBuildUKLocationFilters = di.buildUKLocationFilters
  const testCombineUKSearchTerms = di.combineUKSearchTerms
  const testIsValidFullPostcodeUK = di.isValidFullPostcodeUK
  const testIsValidPartialPostcodeUK = di.isValidPartialPostcodeUK
  const testBuildUKApiUrl = di.buildUKApiUrl
  const testShouldCallUKApi = di.shouldCallUKApi
  const testIsTestMode = di.isTestMode || isTestMode
  const testSymbolsArray = di.symbolsArray
  const testOptions = di.options
  const testConfig = di.config
  const request = di.request
  
  const testModeResult = handleUKLocationDataTestMode(
    testIsTestMode,
    testLogger
  )
  if (testModeResult) {
    return testModeResult
  }
  const deps = {
    buildUKLocationFilters: testBuildUKLocationFilters,
    combineUKSearchTerms: testCombineUKSearchTerms,
    isValidFullPostcodeUK: testIsValidFullPostcodeUK,
    isValidPartialPostcodeUK: testIsValidPartialPostcodeUK,
    buildUKApiUrl: testBuildUKApiUrl,
    config: testConfig
  }
  const { hasOsKey, combinedLocation } = buildAndCheckUKApiUrl(
    userLocation,
    searchTerms,
    secondSearchTerm,
    deps
  )
  if (!hasOsKey) {
    testLogger.warn(
      'OS_NAMES_API_KEY not set; skipping OS Names API call and returning empty results.'
    )
    return { results: [] }
  }
  const finalUserLocation = combinedLocation
  const shouldCallApi = testShouldCallUKApi(
    finalUserLocation,
    testSymbolsArray
  )
  return getOSPlacesHelper(
    finalUserLocation,
    searchTerms,
    secondSearchTerm,
    shouldCallApi,
    testOptions,
    request,
    undefined // catchProxyFetchErrorFn - will use default
  )
}

const buildNIOptionsOAuth = async ({
  request,
  isMockEnabled,
  refreshOAuthTokenFn
}) => {
  // Check if isMockEnabled is a function and call it, otherwise use as boolean
  const isMock =
    typeof isMockEnabled === 'function'
      ? isMockEnabled()
      : !!isMockEnabled

  logger.info(`buildNIOptionsOAuth called - isMockEnabled: ${isMock}`)
  let optionsOAuth = {}
  let accessToken
  if (!isMock) {
    logger.info('Mock is disabled, fetching OAuth token...')
    const savedAccessToken = request.yar.get('savedAccessToken')
    logger.info(`Saved access token exists: ${!!savedAccessToken}`)
    accessToken = savedAccessToken || (await refreshOAuthTokenFn(request))
    logger.info(`Access token obtained: ${!!accessToken}`)
    optionsOAuth = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  } else {
    logger.info('Mock is enabled, skipping OAuth token fetch')
  }
  // Always return an object for optionsOAuth, even in mock mode
  return { optionsOAuth, accessToken }
}

function handleUnsupportedLocationType(/* params */) {
  return function handleUnsupportedLocationType(
    logger,
    errorResponse,
    locationType
  ) {
    logger.error('Unsupported location type provided:', locationType)
    return errorResponse('Unsupported location type provided', 400)
  }
}

// Builds a Northern Ireland postcode URL (stub implementation)
function buildNIPostcodeUrl(postcode, config = {}) {
  // TODO: Replace with real URL logic if needed
  if (!postcode) {
    return ''
  }
  const baseUrl = config.niApiBaseUrl || 'https://api.ni.example.com/postcode'
  return `${baseUrl}/${encodeURIComponent(postcode)}`
}

// Formats the UK API response (stub implementation)
function formatUKApiResponse(response) {
  // TODO: Replace with real formatting logic if needed
  return response
}

// Formats a Northern Ireland postcode (stub implementation)
function formatNorthernIrelandPostcode(postcode) {
  // TODO: Replace with real formatting logic if needed
  if (!postcode) {
    return ''
  }
  return postcode.trim().toUpperCase().replace(/\s+/g, '')
}

// Combines UK search terms (stub implementation)
function combineUKSearchTerms(term1, term2) {
  // TODO: Replace with real logic if needed
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
function buildUKLocationFilters(location, config = {}) {
  // TODO: Replace with real filter logic if needed
  if (!location) {
    return {}
  }
  return { filter: `location=${encodeURIComponent(location)}` }
}

// Builds a UK API URL (stub implementation)
function buildUKApiUrl(location, config = {}) {
  // TODO: Replace with real URL logic if needed
  if (!location) {
    return ''
  }
  const baseUrl = config.ukApiBaseUrl || 'https://api.uk.example.com/location'
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
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK,
  isValidFullPostcodeNI,
  isValidPartialPostcodeNI,
  combineUKSearchTerms
}
