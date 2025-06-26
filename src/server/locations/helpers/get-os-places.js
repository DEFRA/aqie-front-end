import { catchProxyFetchError } from '~/src/server/common/helpers/catch-proxy-fetch-error'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import { config } from '~/src/config/index'
import {
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK
} from '~/src/server/locations/helpers/convert-string'
const logger = createLogger()
const STATUS_CODE_SUCCESS = 200 // Define constant for success status code

async function getOSPlaces(
  userLocation,
  searchTerms,
  secondSearchTerm,
  shouldCallApi,
  options
) {
  const filters = [
    'LOCAL_TYPE:City',
    'LOCAL_TYPE:Town',
    'LOCAL_TYPE:Village',
    'LOCAL_TYPE:Suburban_Area',
    'LOCAL_TYPE:Postcode',
    'LOCAL_TYPE:Airport'
  ].join('+')
  const osNamesApiUrl = config.get('osNamesApiUrl')
  const osNamesApiKey = config.get('osNamesApiKey')

  if (
    !isValidFullPostcodeUK(userLocation.toUpperCase()) &&
    !isValidPartialPostcodeUK(userLocation.toUpperCase()) &&
    searchTerms &&
    secondSearchTerm !== 'UNDEFINED'
  ) {
    userLocation = `${searchTerms} ${secondSearchTerm}`
  }
  const osNamesApiUrlFull = `${osNamesApiUrl}${encodeURIComponent(
    userLocation
  )}&fq=${encodeURIComponent(filters)}&key=${osNamesApiKey}`

  logger.info(`osPlace data requested osNamesApiUrlFull: ${osNamesApiUrlFull}`)
  // Invoking OS Names API
  const [statusCodeOSPlace, osPlacesData] = await catchProxyFetchError(
    osNamesApiUrlFull,
    options,
    shouldCallApi
  )
  if (statusCodeOSPlace !== STATUS_CODE_SUCCESS) {
    logger.error(`Error fetching statusCodeOSPlace data: ${statusCodeOSPlace}`)
  } else {
    logger.info(`osPlacesData fetched:`)
  }

  return osPlacesData
}

export { getOSPlaces }
