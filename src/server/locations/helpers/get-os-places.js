import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { catchProxyFetchError } from '../../common/helpers/catch-proxy-fetch-error.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { config } from '../../../config/index.js' // Updated imports to use correct relative path
import {
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK
} from './convert-string.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const logger = createLogger()
const STATUS_CODE_SUCCESS = 200 // Define constant for success status code

// ''
// Refactored to use the request object for local detection
async function getOSPlaces(
  userLocation,
  searchTerms,
  secondSearchTerm,
  shouldCallApi,
  options,
  request,
  injectedCatchProxyFetchError
) {
  let updatedOptions = options || {}
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
  let isLocal = false
  // ''
  if (request?.headers?.host) {
    const host = request.headers.host
    isLocal = host.includes('localhost') || host.includes('127.0.0.1')
  }
  if (isLocal) {
    let cdpXApiKey = process.env.CDP_X_API_KEY
    if (!cdpXApiKey) {
      const configPath = path.resolve(dirname, '../../../config/local.json')
      const localConfigRaw = fs.readFileSync(configPath, 'utf-8')
      const localConfig = JSON.parse(localConfigRaw)
      cdpXApiKey = localConfig.cdpXApiKey
    }
    updatedOptions = {
      ...updatedOptions,
      headers: {
        ...(updatedOptions.headers || {}),
        'x-api-key': cdpXApiKey
      }
    }
  } else {
    if (updatedOptions.headers?.['x-api-key']) {
      const rest = { ...updatedOptions.headers }
      delete rest['x-api-key']
      updatedOptions = {
        ...updatedOptions,
        headers: rest
      }
    }
  }
  logger.info(
    `[DEBUG] Calling catchProxyFetchError with URL: ${osNamesApiUrlFull}`
  )
  logger.info(`[DEBUG] Options: ${JSON.stringify(updatedOptions)}`)
  const fetchErrorFn = injectedCatchProxyFetchError || catchProxyFetchError
  const [statusCodeOSPlace, osPlacesData] = await fetchErrorFn(
    osNamesApiUrlFull,
    updatedOptions,
    shouldCallApi
  )
  if (statusCodeOSPlace === STATUS_CODE_SUCCESS) {
    logger.info(`osPlacesData fetched:`)
    // Defensive: always return a defined object
    return osPlacesData || { results: [] }
  } else {
    logger.error(`Error fetching statusCodeOSPlace data: ${statusCodeOSPlace}`)
    // Always return a defined object, even on error
    return { results: [] }
  }
}

export { getOSPlaces }
