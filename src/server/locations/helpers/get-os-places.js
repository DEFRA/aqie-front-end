import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { catchProxyFetchError } from '../../common/helpers/catch-proxy-fetch-error.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { config } from '../../../config/index.js' // Updated imports to use correct relative path
import {
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK
} from './convert-string.js'

const FILE_NAME = fileURLToPath(import.meta.url)
const DIR_NAME = path.dirname(FILE_NAME)
const logger = createLogger()
const STATUS_CODE_SUCCESS = 200 // Define constant for success status code

const LOCAL_HOSTS = ['localhost', '127.0.0.1']

const isLocalRequestHost = (request) => {
  const host = request?.headers?.host
  if (!host) {
    return false
  }
  return LOCAL_HOSTS.some((localHost) => host.includes(localHost))
}

const getConfiguredUserLocation = (
  userLocation,
  searchTerms,
  secondSearchTerm
) => {
  const upperLocation = userLocation.toUpperCase()
  const isPostcode =
    isValidFullPostcodeUK(upperLocation) ||
    isValidPartialPostcodeUK(upperLocation)

  if (!isPostcode && searchTerms && secondSearchTerm !== 'UNDEFINED') {
    return `${searchTerms} ${secondSearchTerm}`
  }

  return userLocation
}

const getCdpApiKey = () => {
  if (process.env.CDP_X_API_KEY) {
    return process.env.CDP_X_API_KEY
  }

  const configPath = path.resolve(DIR_NAME, '../../../config/local.json')
  const localConfigRaw = fs.readFileSync(configPath, 'utf-8')
  const localConfig = JSON.parse(localConfigRaw)
  return localConfig.cdpXApiKey
}

const withLocalApiKeyHeader = (optionsInput) => {
  const existingHeaders = optionsInput.headers

  return {
    ...optionsInput,
    headers: existingHeaders
      ? { ...existingHeaders, 'x-api-key': getCdpApiKey() }
      : { 'x-api-key': getCdpApiKey() }
  }
}

const withoutApiKeyHeader = (optionsInput) => {
  if (!optionsInput.headers?.['x-api-key']) {
    return optionsInput
  }

  const rest = { ...optionsInput.headers }
  delete rest['x-api-key']
  return {
    ...optionsInput,
    headers: rest
  }
}

const getOptionsForRequest = (optionsInput, request) => {
  if (isLocalRequestHost(request)) {
    return withLocalApiKeyHeader(optionsInput)
  }
  return withoutApiKeyHeader(optionsInput)
}

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
  const baseOptions = options || {}
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
  const locationQuery = getConfiguredUserLocation(
    userLocation,
    searchTerms,
    secondSearchTerm
  )
  const osNamesApiUrlFull = `${osNamesApiUrl}${encodeURIComponent(
    locationQuery
  )}&fq=${encodeURIComponent(filters)}&key=${osNamesApiKey}`
  const updatedOptions = getOptionsForRequest(baseOptions, request)
  const fetchErrorFn = injectedCatchProxyFetchError || catchProxyFetchError
  const [statusCodeOSPlace, osPlacesData] = await fetchErrorFn(
    osNamesApiUrlFull,
    updatedOptions,
    shouldCallApi
  )
  if (statusCodeOSPlace === STATUS_CODE_SUCCESS) {
    // Defensive: always return a defined object
    return osPlacesData || { results: [] }
  }

  logger.error(`Error fetching statusCodeOSPlace data: ${statusCodeOSPlace}`)
  // Always return a defined object, even on error
  return { results: [] }
}

export { getOSPlaces }
