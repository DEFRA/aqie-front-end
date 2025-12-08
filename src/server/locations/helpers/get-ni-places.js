import { catchProxyFetchError } from '../../common/helpers/catch-proxy-fetch-error.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { config } from '../../../config/index.js'
import { formatNorthernIrelandPostcode } from './convert-string.js'
import { refreshOAuthToken } from './extracted/util-helpers.js'

const logger = createLogger()
const STATUS_CODE_SUCCESS = 200

// ''  Simplified - removed test-only DI parameters
async function getNIPlaces(userLocation) {
  // Read configuration directly instead of via parameters
  const isMockEnabled = config.get('enabledMock')
  const osPlacesApiPostcodeNorthernIrelandUrl = config.get(
    'osPlacesApiPostcodeNorthernIrelandUrl'
  )
  const mockOsPlacesApiPostcodeNorthernIrelandUrl = config.get(
    'mockOsPlacesApiPostcodeNorthernIrelandUrl'
  )

  const userLocationLocal = formatNorthernIrelandPostcode(
    userLocation.toUpperCase()
  )
  const postcodeNortherIrelandURL = isMockEnabled
    ? `${mockOsPlacesApiPostcodeNorthernIrelandUrl}${encodeURIComponent(userLocationLocal)}&_limit=1`
    : `${osPlacesApiPostcodeNorthernIrelandUrl}${encodeURIComponent(userLocation)}&maxresults=1`

  // Build OAuth options if not in mock mode
  let optionsOAuth = {}
  if (!isMockEnabled) {
    const accessToken = await refreshOAuthToken(logger)
    if (accessToken) {
      optionsOAuth = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    }
  }

  logger.info(
    `[DEBUG] Calling catchProxyFetchError with URL: ${postcodeNortherIrelandURL}`
  )
  logger.info(`[DEBUG] Options: ${JSON.stringify(optionsOAuth)}`)

  let [statusCodeNI, niPlacesData] = await catchProxyFetchError(
    postcodeNortherIrelandURL,
    optionsOAuth,
    true
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
  } else {
    logger.error(`Error fetching statusCodeNI data: ${statusCodeNI}`)
  }

  return niPlacesData
}

export { getNIPlaces }
