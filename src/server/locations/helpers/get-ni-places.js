import { catchProxyFetchError } from '../../common/helpers/catch-proxy-fetch-error.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { config } from '../../../config/index.js'
import { refreshOAuthToken } from './extracted/util-helpers.js'
import { fetchWithRetry } from '../../common/helpers/fetch-with-retry.js'

const logger = createLogger()
const STATUS_CODE_SUCCESS = 200
const SERVICE_UNAVAILABLE_ERROR = 'service-unavailable'

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

  // '' Normalize NI postcode for API call (remove spaces, uppercase)
  const normalizedUserLocation = (userLocation || '')
    .toUpperCase()
    .replace(/\s+/g, '')
  const postcodeNortherIrelandURL = isMockEnabled
    ? `${mockOsPlacesApiPostcodeNorthernIrelandUrl}${encodeURIComponent(normalizedUserLocation)}&_limit=1`
    : `${osPlacesApiPostcodeNorthernIrelandUrl}${encodeURIComponent(normalizedUserLocation)}&maxresults=1`

  // Build OAuth options if not in mock mode
  let optionsOAuth = {}
  if (!isMockEnabled) {
    const tokenResult = await refreshOAuthToken(request, { logger })

    // '' Check if token fetch failed
    if (tokenResult?.error) {
      logger.error(
        `[getNIPlaces] OAuth token fetch failed: ${tokenResult.error}, statusCode: ${tokenResult.statusCode}`
      )
      return { results: [], error: SERVICE_UNAVAILABLE_ERROR }
    }

    // '' Extract accessToken from the returned object
    const accessToken = tokenResult?.accessToken
    if (!accessToken) {
      logger.error('[getNIPlaces] OAuth token missing from successful response')
      return { results: [], error: SERVICE_UNAVAILABLE_ERROR }
    }

    if (accessToken) {
      optionsOAuth = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    }
  }

  logger.info(`[getNIPlaces] isMockEnabled: ${isMockEnabled}`)
  logger.info(
    `[getNIPlaces] Calling NI API with URL: ${postcodeNortherIrelandURL}`
  )
  logger.info(`[getNIPlaces] OAuth options: ${JSON.stringify(optionsOAuth)}`)

  // '' Wrap NI API call with retry logic for better reliability
  let statusCodeNI, niPlacesData
  try {
    ;[statusCodeNI, niPlacesData] = await fetchWithRetry(
      async (controller) => {
        // Pass abort controller signal to catchProxyFetchError
        const optionsWithSignal = controller
          ? { ...optionsOAuth, signal: controller.signal }
          : optionsOAuth

        return await catchProxyFetchError(
          postcodeNortherIrelandURL,
          optionsWithSignal,
          true
        )
      },
      {
        operationName: `NI API call for ${normalizedUserLocation}`,
        maxRetries: isMockEnabled ? 0 : config.get('niApiMaxRetries'),
        retryDelayMs: config.get('niApiRetryDelayMs'),
        timeoutMs: config.get('niApiTimeoutMs')
      }
    )
  } catch (error) {
    logger.error(
      `[getNIPlaces] NI API call failed after retries: ${error.message}`
    )
    return { results: [], error: SERVICE_UNAVAILABLE_ERROR }
  }

  logger.info(`[getNIPlaces] Response status: ${statusCodeNI}`)
  logger.info(`[getNIPlaces] Response data: ${JSON.stringify(niPlacesData)}`)

  // '' Handle 204 No Content as "postcode not found" (not a service error)
  if (statusCodeNI === 204) {
    logger.info(
      `[getNIPlaces] NI API returned 204 No Content - postcode not found`
    )
    return { results: [] }
  }

  // '' Handle upstream failures (network errors, 500, etc.) separately from postcode errors
  const isServiceUnavailable =
    !statusCodeNI || niPlacesData?.error === SERVICE_UNAVAILABLE_ERROR
  if (isServiceUnavailable) {
    logger.error(
      `[getNIPlaces] NI API unavailable - statusCodeNI: ${statusCodeNI}`
    )
    return { results: [], error: SERVICE_UNAVAILABLE_ERROR }
  }

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
    logger.info(`[getNIPlaces] NI data fetched successfully`)
    logger.info(
      `[getNIPlaces] Response structure:`,
      JSON.stringify(niPlacesData, null, 2)
    )
    logger.info(
      `[getNIPlaces] Number of results: ${niPlacesData?.results?.length}`
    )
    // '' Log coordinate fields from each result
    if (niPlacesData?.results?.length > 0) {
      niPlacesData.results.forEach((result, index) => {
        logger.info(
          `[getNIPlaces] Result ${index}: easting=${result.easting}, northing=${result.northing}, xCoordinate=${result.xCoordinate}, yCoordinate=${result.yCoordinate}, latitude=${result.latitude}, longitude=${result.longitude}`
        )
      })
    }
  } else {
    logger.error(
      `[getNIPlaces] Error fetching NI data - statusCode: ${statusCodeNI}`
    )
  }

  return niPlacesData
}

export { getNIPlaces }
