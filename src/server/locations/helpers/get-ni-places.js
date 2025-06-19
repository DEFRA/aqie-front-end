import { catchProxyFetchError } from '~/src/server/common/helpers/catch-proxy-fetch-error'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import { config } from '~/src/config/index'
import { formatNorthernIrelandPostcode } from '~/src/server/locations/helpers/convert-string'
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
