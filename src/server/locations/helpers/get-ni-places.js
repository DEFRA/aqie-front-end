import { catchProxyFetchError } from '../../common/helpers/catch-proxy-fetch-error.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { config } from '../../../config/index.js'
import { refreshOAuthToken } from './extracted/util-helpers.js'

const logger = createLogger()
const STATUS_CODE_SUCCESS = 200

// ''  Simplified - removed test-only DI parameters
async function getNIPlaces(userLocation, request) {
  // Read configuration directly instead of via parameters
  const isMockEnabled = config.get('enabledMock')
  const osPlacesApiPostcodeNorthernIrelandUrl = config.get(
    'osPlacesApiPostcodeNorthernIrelandUrl'
  )
  const mockOsPlacesApiPostcodeNorthernIrelandUrl = config.get(
    'mockOsPlacesApiPostcodeNorthernIrelandUrl'
  )

  // '' Remove spaces from postcode for API call - NI API expects postcodes without spaces
  const userLocationNoSpaces = userLocation.toUpperCase().replace(/\s+/g, '')
  const postcodeNortherIrelandURL = isMockEnabled
    ? `${mockOsPlacesApiPostcodeNorthernIrelandUrl}${encodeURIComponent(userLocationNoSpaces)}&_limit=1`
    : `${osPlacesApiPostcodeNorthernIrelandUrl}${encodeURIComponent(userLocationNoSpaces)}&maxresults=1`

  // Build OAuth options if not in mock mode
  let optionsOAuth = {}
  if (!isMockEnabled) {
    const tokenResult = await refreshOAuthToken(request, { logger })
    // '' Extract accessToken from the returned object
    const accessToken = tokenResult?.accessToken
    if (accessToken) {
      optionsOAuth = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    }
  }

  logger.info(`[DEBUG getNIPlaces] isMockEnabled: ${isMockEnabled}`)
  logger.info(
    `[DEBUG getNIPlaces] Calling catchProxyFetchError with URL: ${postcodeNortherIrelandURL}`
  )
  logger.info(`[DEBUG getNIPlaces] Options: ${JSON.stringify(optionsOAuth)}`)

  let [statusCodeNI, niPlacesData] = await catchProxyFetchError(
    postcodeNortherIrelandURL,
    optionsOAuth,
    true
  )

  logger.info(
    `[DEBUG getNIPlaces] Raw response - statusCodeNI: ${statusCodeNI}`
  )
  logger.info(
    `[DEBUG getNIPlaces] Raw response - niPlacesData: ${JSON.stringify(niPlacesData)}`
  )

  // Always return an object with results array
  if (isMockEnabled) {
    niPlacesData = {
      results: Array.isArray(niPlacesData) ? niPlacesData : [niPlacesData]
    }
  } else if (niPlacesData?.results) {
    niPlacesData = {
      results: Array.isArray(niPlacesData.results)
        ? niPlacesData.results
        : [niPlacesData.results]
    }
  } else {
    niPlacesData = { results: [] }
  }

  if (statusCodeNI === STATUS_CODE_SUCCESS) {
    logger.info(`niPlacesData fetched:`)
    logger.info(
      `[DEBUG] niPlacesData structure:`,
      JSON.stringify(niPlacesData, null, 2)
    )
    logger.info(
      `[DEBUG] niPlacesData.results length: ${niPlacesData?.results?.length}`
    )
  } else {
    logger.error(`Error fetching statusCodeNI data: ${statusCodeNI}`)
  }

  return niPlacesData
}

export { getNIPlaces }
