import { getOSPlaces as getOSPlacesHelper } from '../get-os-places.js'
import {
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK,
  isValidFullPostcodeNI,
  isValidPartialPostcodeNI
} from '../convert-string.js'
import { setupNILocationDataDI, setupUKLocationDataDI } from './di-helpers.js'
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
  const injectedLogger = di.logger || logger
  const injectedFetchOAuthToken = di.fetchOAuthToken || fetchOAuthToken
  const injectedIsTestMode = di.isTestMode || isTestMode
  if (injectedIsTestMode?.()) {
    if (injectedLogger && typeof injectedLogger.info === 'function') {
      injectedLogger.info('Test mode: refreshOAuthToken returning mock token')
    }
    return { accessToken: 'mock-token' }
  }
  const accessToken = await injectedFetchOAuthToken({ logger: injectedLogger })
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
  injectedOptions,
  injectedOptionsEphemeralProtected,
  request,
  di = {}
) => {
  const { injectedLogger, injectedIsTestMode, injectedIsMockEnabled } =
    setupNILocationDataDI(di)
  if (injectedIsTestMode?.()) {
    if (injectedLogger && typeof injectedLogger.info === 'function') {
      injectedLogger.info('Test mode: handleNILocationData returning mock data')
    }
    return { results: ['niData'] }
  }
  // Use getNIPlaces for NI lookups
  // Pass userLocation, isMockEnabled, optionsOAuth, request
  // isMockEnabled: use injectedIsMockEnabled (from DI or config)
  // optionsOAuth: prefer injectedOptions (OAuth headers)
  return getNIPlaces(
    userLocation,
    typeof injectedIsMockEnabled === 'function'
      ? injectedIsMockEnabled()
      : !!injectedIsMockEnabled,
    injectedOptions,
    request
  )
}

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
  const testModeResult = handleUKLocationDataTestMode(
    injectedIsTestMode,
    injectedLogger
  )
  if (testModeResult) {
    return testModeResult
  }
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

const buildNIOptionsOAuth = async ({
  request,
  injectedIsMockEnabled,
  injectedRefreshOAuthToken
}) => {
  let optionsOAuth = {}
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
  // Always return an object for optionsOAuth, even in mock mode
  return { optionsOAuth, accessToken }
}

function handleUnsupportedLocationType(/* params */) {
  return function handleUnsupportedLocationType(
    injectedLogger,
    injectedErrorResponse,
    locationType
  ) {
    injectedLogger.error('Unsupported location type provided:', locationType)
    return injectedErrorResponse('Unsupported location type provided', 400)
  }
}

// ''
// Builds a Northern Ireland postcode URL (stub implementation)
function buildNIPostcodeUrl(postcode, config = {}) {
  // TODO: Replace with real URL logic if needed
  if (!postcode) return ''
  const baseUrl = config.niApiBaseUrl || 'https://api.ni.example.com/postcode'
  return `${baseUrl}/${encodeURIComponent(postcode)}`
}

// Formats the UK API response (stub implementation)
function formatUKApiResponse(response) {
  // TODO: Replace with real formatting logic if needed
  return response
}

// ''
// Formats a Northern Ireland postcode (stub implementation)
function formatNorthernIrelandPostcode(postcode) {
  // TODO: Replace with real formatting logic if needed
  if (!postcode) return ''
  return postcode.trim().toUpperCase().replace(/\s+/g, '')
}

// ''
// Combines UK search terms (stub implementation)
function combineUKSearchTerms(term1, term2) {
  // TODO: Replace with real logic if needed
  if (!term1 && !term2) return ''
  if (!term1) return term2
  if (!term2) return term1
  return `${term1} ${term2}`
}

// ''
// Builds UK location filters (stub implementation)
function buildUKLocationFilters(location, config = {}) {
  // TODO: Replace with real filter logic if needed
  if (!location) return {}
  return { filter: `location=${encodeURIComponent(location)}` }
}

// ''
// Builds a UK API URL (stub implementation)
function buildUKApiUrl(location, config = {}) {
  // TODO: Replace with real URL logic if needed
  if (!location) return ''
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
