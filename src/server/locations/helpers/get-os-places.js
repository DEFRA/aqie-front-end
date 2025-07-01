import { catchProxyFetchError } from '../common/helpers/catch-proxy-fetch-error.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { config } from '../../config/index.js' // Updated imports to use relative paths
import {
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK
} from './convert-string.js'
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
