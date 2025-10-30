// Helper functions for location data and API logic
import {
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK
} from './convert-string.js'

// --- UK Location Data Helpers ---
function buildUKLocationFilters() {
  return [
    'LOCAL_TYPE:City',
    'LOCAL_TYPE:Town',
    'LOCAL_TYPE:Village',
    'LOCAL_TYPE:Suburban_Area',
    'LOCAL_TYPE:Postcode',
    'LOCAL_TYPE:Airport'
  ].join('+')
}

function combineUKSearchTerms(
  userLocation,
  searchTerms,
  secondSearchTerm,
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK
) {
  if (
    !isValidFullPostcodeUK(userLocation.toUpperCase()) &&
    !isValidPartialPostcodeUK(userLocation.toUpperCase()) &&
    searchTerms &&
    secondSearchTerm !== 'UNDEFINED'
  ) {
    return `${searchTerms} ${secondSearchTerm}`
  }
  return userLocation
}

function buildUKApiUrl(userLocation, filters, osNamesApiUrl, osNamesApiKey) {
  return `${osNamesApiUrl}${encodeURIComponent(userLocation)}&fq=${encodeURIComponent(filters)}&key=${osNamesApiKey}`
}

function shouldCallUKApi(userLocation, SYMBOLS_ARRAY) {
  return !SYMBOLS_ARRAY.some((symbol) => userLocation.includes(symbol))
}

function formatUKApiResponse(getOSPlaces) {
  if (getOSPlaces && Array.isArray(getOSPlaces.results)) {
    return { results: getOSPlaces.results }
  } else if (getOSPlaces && Array.isArray(getOSPlaces)) {
    return { results: getOSPlaces }
  } else if (getOSPlaces && getOSPlaces.name) {
    return { results: [getOSPlaces] }
  } else {
    return { results: [] }
  }
}

// --- NI Location Data Helpers ---
function buildNIPostcodeUrl(
  userLocation,
  isMockEnabled,
  config,
  formatNorthernIrelandPostcode
) {
  const osPlacesApiPostcodeNorthernIrelandUrl = config.get(
    'osPlacesApiPostcodeNorthernIrelandUrl'
  )
  const mockOsPlacesApiPostcodeNorthernIrelandUrl = config.get(
    'mockOsPlacesApiPostcodeNorthernIrelandUrl'
  )
  const userLocationLocal = formatNorthernIrelandPostcode(
    userLocation.toUpperCase()
  )
  return isMockEnabled
    ? `${mockOsPlacesApiPostcodeNorthernIrelandUrl}${encodeURIComponent(userLocationLocal)}&_limit=1`
    : `${osPlacesApiPostcodeNorthernIrelandUrl}${encodeURIComponent(userLocation)}&maxresults=1`
}

function formatNIResponse(getNIPlaces) {
  if (getNIPlaces && Array.isArray(getNIPlaces.results)) {
    return { results: getNIPlaces.results }
  } else if (getNIPlaces && Array.isArray(getNIPlaces)) {
    return { results: getNIPlaces }
  } else if (getNIPlaces && getNIPlaces.name) {
    return { results: [getNIPlaces] }
  } else {
    return { results: [] }
  }
}

// --- General Utility Helpers ---
function isTestMode() {
  return process.env.NODE_ENV === 'test'
}

function isProductionMode() {
  return process.env.NODE_ENV === 'production'
}

function errorResponse(message, statusCode = 500) {
  return { error: true, message, statusCode }
}

function validateParams(params, requiredKeys = []) {
  for (const key of requiredKeys) {
    if (!params[key]) {
      return errorResponse(`Missing required parameter: ${key}`, 400)
    }
  }
  return null
}

async function fetchApi(url, options = {}, logger) {
  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      return errorResponse(
        `API request failed: ${response.statusText}`,
        response.status
      )
    }
    const data = await response.json()
    return { error: false, data }
  } catch (err) {
    logger.error('API request error:', err)
    return errorResponse('API request error', 500)
  }
}

function getToken(req) {
  return req?.headers?.authorization || null
}

function isMockEnabled() {
  return process.env.MOCK_ENABLED === 'true'
}

export {
  buildUKLocationFilters,
  combineUKSearchTerms,
  buildUKApiUrl,
  shouldCallUKApi,
  formatUKApiResponse,
  buildNIPostcodeUrl,
  formatNIResponse,
  isTestMode,
  isProductionMode,
  errorResponse,
  validateParams,
  fetchApi,
  getToken,
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK,
  isMockEnabled
}
