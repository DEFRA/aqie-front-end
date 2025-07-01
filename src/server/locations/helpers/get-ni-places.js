import { catchProxyFetchError } from '../common/helpers/catch-proxy-fetch-error.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { config } from '../../config/index.js'
import { formatNorthernIrelandPostcode } from './convert-string.js' // Updated imports to use relative paths
const logger = createLogger()
const STATUS_CODE_SUCCESS = 200 // Define constant for success status code

async function getNIPlaces(userLocation, isMockEnabled, optionsOAuth) {
  ''
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
  let [statusCodeNI, niPlacesData] = await catchProxyFetchError(
    postcodeNortherIrelandURL,
    optionsOAuth,
    true
  )
  if (isMockEnabled) {
    niPlacesData = {
      results: Array.isArray(niPlacesData) ? niPlacesData : [niPlacesData]
    }
  }
  if (statusCodeNI !== STATUS_CODE_SUCCESS) {
    logger.error(`Error fetching statusCodeNI data: ${statusCodeNI}`)
  } else {
    logger.info(`niPlacesData fetched:`)
  }

  return niPlacesData
}

export { getNIPlaces }
