import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { catchProxyFetchError } from '../../common/helpers/catch-proxy-fetch-error.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { config } from '../../../config/index.js'
import { formatNorthernIrelandPostcode } from './convert-string.js' // Updated imports to use relative paths

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const logger = createLogger()
const STATUS_CODE_SUCCESS = 200 // Define constant for success status code

// ''
// Refactored to use the request object for local detection
async function getNIPlaces(userLocation, isMockEnabled, optionsOAuth, request) {
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
  let updatedOptions = optionsOAuth || {}
  let isLocal = false
  if (request && request.headers && request.headers.host) {
    const host = request.headers.host
    isLocal = host.includes('localhost') || host.includes('127.0.0.1')
  }
  if (isLocal) {
    let cdpXApiKey = process.env.CDP_X_API_KEY
    if (!cdpXApiKey) {
      const configPath = path.resolve(__dirname, '../../../config/local.json')
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
    if (updatedOptions.headers && updatedOptions.headers['x-api-key']) {
      const rest = { ...updatedOptions.headers }
      delete rest['x-api-key']
      updatedOptions = {
        ...updatedOptions,
        headers: rest
      }
    }
  }
  logger.info(
    `[DEBUG] Calling catchProxyFetchError with URL: ${postcodeNortherIrelandURL}`
  )
  logger.info(`[DEBUG] Options: ${JSON.stringify(updatedOptions)}`)
  let [statusCodeNI, niPlacesData] = await catchProxyFetchError(
    postcodeNortherIrelandURL,
    updatedOptions,
    true
  )
  // Always return an object with results array
  if (isMockEnabled) {
    niPlacesData = {
      results: Array.isArray(niPlacesData) ? niPlacesData : [niPlacesData]
    }
  } else if (!niPlacesData || !niPlacesData.results) {
    niPlacesData = { results: [] }
  } else {
    // else clause for uncovered code
    niPlacesData = {
      results: Array.isArray(niPlacesData.results)
        ? niPlacesData.results
        : [niPlacesData.results]
    }
  }
  if (statusCodeNI !== STATUS_CODE_SUCCESS) {
    logger.error(`Error fetching statusCodeNI data: ${statusCodeNI}`)
  } else {
    logger.info(`niPlacesData fetched:`)
  }

  return niPlacesData
}

export async function fetchOAuthToken(params) {
  // TODO: Implement OAuth token fetching logic
  // Placeholder implementation
  return Promise.resolve({ token: 'mock-token', error: null })
}

export { getNIPlaces }
