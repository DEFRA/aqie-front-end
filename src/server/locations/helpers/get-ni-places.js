import { catchProxyFetchError } from '../../common/helpers/catch-proxy-fetch-error.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { config } from '../../../config/index.js'
import { refreshOAuthToken } from './extracted/util-helpers.js'
import { fetchWithRetry } from '../../common/helpers/fetch-with-retry.js'

const logger = createLogger()
const STATUS_CODE_SUCCESS = 200
const SERVICE_UNAVAILABLE_ERROR = 'service-unavailable'

// '' Simple in-memory cache and circuit breaker state
const niPlacesCache = new Map()
const circuitBreakerState = {
  failureCount: 0,
  openUntilMs: 0,
  halfOpenInFlight: false
}

function getCacheKey(normalizedPostcode = '') {
  return normalizedPostcode
}

function getCacheConfig() {
  return {
    enabled: config.get('niApiCacheEnabled') ?? true,
    ttlMs: config.get('niApiCacheTtlMs') ?? 10 * 60 * 1000
  }
}

function getCircuitBreakerConfig() {
  return {
    enabled: config.get('niApiCircuitBreakerEnabled') ?? true,
    failureThreshold: config.get('niApiCircuitBreakerFailureThreshold') ?? 3,
    openDurationMs: config.get('niApiCircuitBreakerOpenMs') ?? 60 * 1000
  }
}

function getCachedResult(cacheKey = '', nowMs = Date.now()) {
  const { enabled } = getCacheConfig()
  if (!enabled || !cacheKey) {
    return null
  }

  const cachedEntry = niPlacesCache.get(cacheKey)
  if (!cachedEntry) {
    return null
  }

  if (cachedEntry.expiresAtMs <= nowMs) {
    niPlacesCache.delete(cacheKey)
    return null
  }

  return cachedEntry.data
}

function setCachedResult(cacheKey = '', data = null, nowMs = Date.now()) {
  const { enabled, ttlMs } = getCacheConfig()
  if (!enabled || !cacheKey || !data) {
    return
  }

  niPlacesCache.set(cacheKey, {
    data,
    expiresAtMs: nowMs + ttlMs
  })
}

function getCircuitBreakerDecision(nowMs = Date.now()) {
  const { enabled } = getCircuitBreakerConfig()
  if (!enabled) {
    return { shouldShortCircuit: false, isHalfOpenProbe: false }
  }

  if (circuitBreakerState.openUntilMs > nowMs) {
    return { shouldShortCircuit: true, isHalfOpenProbe: false }
  }

  // '' Allow a single probe request after open duration expires
  if (
    circuitBreakerState.openUntilMs > 0 &&
    !circuitBreakerState.halfOpenInFlight
  ) {
    circuitBreakerState.halfOpenInFlight = true
    return { shouldShortCircuit: false, isHalfOpenProbe: true }
  }

  if (
    circuitBreakerState.openUntilMs > 0 &&
    circuitBreakerState.halfOpenInFlight
  ) {
    return { shouldShortCircuit: true, isHalfOpenProbe: false }
  }

  return { shouldShortCircuit: false, isHalfOpenProbe: false }
}

function recordCircuitBreakerFailure(nowMs = Date.now()) {
  const { enabled, failureThreshold, openDurationMs } =
    getCircuitBreakerConfig()
  if (!enabled) {
    return
  }

  const wasHalfOpen = circuitBreakerState.halfOpenInFlight
  circuitBreakerState.failureCount += 1
  circuitBreakerState.halfOpenInFlight = false

  if (wasHalfOpen || circuitBreakerState.failureCount >= failureThreshold) {
    circuitBreakerState.openUntilMs = nowMs + openDurationMs
    circuitBreakerState.failureCount = Math.max(
      circuitBreakerState.failureCount,
      failureThreshold
    )
    logger.warn(
      `[getNIPlaces] Circuit breaker opened for ${openDurationMs}ms after ${circuitBreakerState.failureCount} failures`
    )
  }
}

function resetCircuitBreaker() {
  circuitBreakerState.failureCount = 0
  circuitBreakerState.openUntilMs = 0
  circuitBreakerState.halfOpenInFlight = false
}

function resetNiPlacesState() {
  niPlacesCache.clear()
  resetCircuitBreaker()
}

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
  const cacheKey = getCacheKey(normalizedUserLocation)
  const postcodeNortherIrelandURL = isMockEnabled
    ? `${mockOsPlacesApiPostcodeNorthernIrelandUrl}${encodeURIComponent(normalizedUserLocation)}&_limit=1`
    : `${osPlacesApiPostcodeNorthernIrelandUrl}${encodeURIComponent(normalizedUserLocation)}&maxresults=1`

  // '' Check circuit breaker before calling upstream
  const { shouldShortCircuit, isHalfOpenProbe } = getCircuitBreakerDecision()
  if (shouldShortCircuit) {
    logger.warn(
      `[getNIPlaces] Circuit breaker open - skipping NI API call for ${normalizedUserLocation}`
    )

    const cachedResult = getCachedResult(cacheKey)
    if (cachedResult) {
      logger.info(
        `[getNIPlaces] Returning cached NI result for ${normalizedUserLocation}`
      )
      return cachedResult
    }

    return { results: [], error: SERVICE_UNAVAILABLE_ERROR, breakerOpen: true }
  }

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

  if (isHalfOpenProbe) {
    logger.warn(
      `[getNIPlaces] Circuit breaker half-open probe for ${normalizedUserLocation}`
    )
  }

  // '' Wrap NI API call with retry logic for better reliability
  const runNiRequest = async (requestOptions) =>
    fetchWithRetry(
      async (controller) => {
        // Pass abort controller signal to catchProxyFetchError
        const optionsWithSignal = controller
          ? { ...requestOptions, signal: controller.signal }
          : requestOptions

        const result = await catchProxyFetchError(
          postcodeNortherIrelandURL,
          optionsWithSignal,
          true
        )

        const [statusCode] = result
        const isRetriableStatus =
          !statusCode || statusCode >= 500 || statusCode === 429

        // '' Treat upstream timeouts/5xx as retriable failures
        if (isRetriableStatus) {
          const error = new Error(
            `[getNIPlaces] Retriable NI API failure - statusCode: ${statusCode ?? 'unknown'}`
          )
          error.name = 'RetriableNiApiError'
          throw error
        }

        return result
      },
      {
        operationName: `NI API call for ${normalizedUserLocation}`,
        maxRetries:
          isMockEnabled || isHalfOpenProbe ? 0 : config.get('niApiMaxRetries'),
        retryDelayMs: config.get('niApiRetryDelayMs'),
        timeoutMs: config.get('niApiTimeoutMs')
      }
    )

  let statusCodeNI, niPlacesData
  try {
    ;[statusCodeNI, niPlacesData] = await runNiRequest(optionsOAuth)
  } catch (error) {
    logger.error(
      `[getNIPlaces] NI API call failed after retries: ${error.message}`
    )
    recordCircuitBreakerFailure()
    const cachedResult = getCachedResult(cacheKey)
    if (cachedResult) {
      logger.info(
        `[getNIPlaces] Returning cached NI result for ${normalizedUserLocation}`
      )
      return cachedResult
    }
    return { results: [], error: SERVICE_UNAVAILABLE_ERROR }
  }

  // '' If token expired, refresh OAuth token and retry once
  if (!isMockEnabled && statusCodeNI === 401) {
    logger.warn('[getNIPlaces] NI API returned 401; refreshing OAuth token')
    const tokenResult = await refreshOAuthToken(request, { logger })
    if (tokenResult?.error) {
      logger.error(
        `[getNIPlaces] OAuth token refresh failed after 401: ${tokenResult.error}`
      )
      return { results: [], error: SERVICE_UNAVAILABLE_ERROR }
    }

    const accessToken = tokenResult?.accessToken
    if (!accessToken) {
      logger.error('[getNIPlaces] OAuth token missing after refresh')
      return { results: [], error: SERVICE_UNAVAILABLE_ERROR }
    }

    optionsOAuth = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }

    try {
      ;[statusCodeNI, niPlacesData] = await runNiRequest(optionsOAuth)
    } catch (error) {
      logger.error(
        `[getNIPlaces] NI API retry failed after token refresh: ${error.message}`
      )
      return { results: [], error: SERVICE_UNAVAILABLE_ERROR }
    }
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
    recordCircuitBreakerFailure()
    const cachedResult = getCachedResult(cacheKey)
    if (cachedResult) {
      logger.info(
        `[getNIPlaces] Returning cached NI result for ${normalizedUserLocation}`
      )
      return cachedResult
    }
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
    resetCircuitBreaker()
    setCachedResult(cacheKey, niPlacesData)
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

export { getNIPlaces, resetNiPlacesState }
