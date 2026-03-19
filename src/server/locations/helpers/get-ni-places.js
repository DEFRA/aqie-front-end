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

// '' Helper to read cached data with metadata for logging
function getCachedResultWithMeta(cacheKey = '', nowMs = Date.now()) {
  const { enabled, ttlMs } = getCacheConfig()
  if (!enabled || !cacheKey) {
    return { data: null, meta: null }
  }

  const cachedEntry = niPlacesCache.get(cacheKey)
  if (!cachedEntry) {
    return { data: null, meta: null }
  }

  if (cachedEntry.expiresAtMs <= nowMs) {
    niPlacesCache.delete(cacheKey)
    return { data: null, meta: null }
  }

  const ageMs = nowMs - cachedEntry.storedAtMs
  const expiresInMs = cachedEntry.expiresAtMs - nowMs

  return {
    data: cachedEntry.data,
    meta: {
      ageMs,
      ttlMs,
      expiresInMs
    }
  }
}

function setCachedResult(cacheKey = '', data = null, nowMs = Date.now()) {
  const { enabled, ttlMs } = getCacheConfig()
  if (!enabled || !cacheKey || !data) {
    return
  }

  niPlacesCache.set(cacheKey, {
    data,
    storedAtMs: nowMs,
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

function getRedactedOAuthLog(optionsOAuth = {}) {
  const hasAuthHeader = Boolean(optionsOAuth?.headers?.Authorization)
  return {
    headers: {
      Authorization: hasAuthHeader ? 'Bearer [REDACTED]' : undefined,
      'Content-Type': optionsOAuth?.headers?.['Content-Type']
    }
  }
}

function getNiResponseSummary(niPlacesData = null) {
  return {
    hasData: Boolean(niPlacesData),
    hasHeader: Boolean(niPlacesData?.header),
    resultCount: Array.isArray(niPlacesData?.results)
      ? niPlacesData.results.length
      : 0,
    hasInfo: Boolean(niPlacesData?._info)
  }
}

function buildNiRequestContext(userLocation, isMockEnabled) {
  const osPlacesApiPostcodeNorthernIrelandUrl = config.get(
    'osPlacesApiPostcodeNorthernIrelandUrl'
  )
  const mockOsPlacesApiPostcodeNorthernIrelandUrl = config.get(
    'mockOsPlacesApiPostcodeNorthernIrelandUrl'
  )
  const normalizedUserLocation = (userLocation || '')
    .toUpperCase()
    .replace(/\s+/g, '')
  const cacheKey = getCacheKey(normalizedUserLocation)
  const postcodeNortherIrelandURL = isMockEnabled
    ? `${mockOsPlacesApiPostcodeNorthernIrelandUrl}${encodeURIComponent(normalizedUserLocation)}&_limit=1`
    : `${osPlacesApiPostcodeNorthernIrelandUrl}${encodeURIComponent(normalizedUserLocation)}&maxresults=1`

  return {
    normalizedUserLocation,
    cacheKey,
    postcodeNortherIrelandURL
  }
}

function getFallbackFromCacheOrServiceUnavailable(
  cacheKey,
  normalizedUserLocation,
  meta = {}
) {
  const { data: cachedResult, meta: cacheMeta } =
    getCachedResultWithMeta(cacheKey)
  if (cachedResult) {
    logger.info(
      `[getNIPlaces] Returning cached NI result for ${normalizedUserLocation}`,
      {
        cacheAgeMs: cacheMeta?.ageMs,
        cacheTtlMs: cacheMeta?.ttlMs,
        cacheExpiresInMs: cacheMeta?.expiresInMs,
        ...meta
      }
    )
    return cachedResult
  }

  return { results: [], error: SERVICE_UNAVAILABLE_ERROR }
}

function getCircuitBreakerShortCircuitResponse(
  cacheKey,
  normalizedUserLocation
) {
  const { shouldShortCircuit, isHalfOpenProbe } = getCircuitBreakerDecision()
  if (!shouldShortCircuit) {
    return { isHalfOpenProbe, shortCircuitResponse: null }
  }

  logger.warn(
    `[getNIPlaces] Circuit breaker open - skipping NI API call for ${normalizedUserLocation}`
  )
  const fallbackResponse = getFallbackFromCacheOrServiceUnavailable(
    cacheKey,
    normalizedUserLocation,
    { breakerOpen: true }
  )
  const shortCircuitResponse = fallbackResponse.error
    ? { ...fallbackResponse, breakerOpen: true }
    : fallbackResponse
  return { isHalfOpenProbe, shortCircuitResponse }
}

async function buildNiOAuthOptions(isMockEnabled, request) {
  if (isMockEnabled) {
    return { optionsOAuth: {} }
  }

  const tokenResult = await refreshOAuthToken(request, { logger })
  if (tokenResult?.error) {
    logger.error(
      `[getNIPlaces] OAuth token fetch failed: ${tokenResult.error}, statusCode: ${tokenResult.statusCode}`
    )
    return { error: SERVICE_UNAVAILABLE_ERROR }
  }

  const accessToken = tokenResult?.accessToken
  if (!accessToken) {
    logger.error('[getNIPlaces] OAuth token missing from successful response')
    return { error: SERVICE_UNAVAILABLE_ERROR }
  }

  return {
    optionsOAuth: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  }
}

function logNiRequestStart(
  isMockEnabled,
  postcodeNortherIrelandURL,
  optionsOAuth,
  isHalfOpenProbe,
  normalizedUserLocation
) {
  logger.info(`[getNIPlaces] isMockEnabled: ${isMockEnabled}`)
  logger.info(
    `[getNIPlaces] Calling NI API with URL: ${postcodeNortherIrelandURL}`
  )
  logger.info(
    `[getNIPlaces] OAuth options: ${JSON.stringify(getRedactedOAuthLog(optionsOAuth))}`
  )

  if (isHalfOpenProbe) {
    logger.warn(
      `[getNIPlaces] Circuit breaker half-open probe for ${normalizedUserLocation}`
    )
  }
}

function createNiRequestRunner(
  postcodeNortherIrelandURL,
  normalizedUserLocation,
  isMockEnabled,
  isHalfOpenProbe
) {
  return async (requestOptions) =>
    fetchWithRetry(
      async (controller) => {
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
}

async function executeNiRequestWithFailureHandling(
  runNiRequest,
  optionsOAuth,
  cacheKey,
  normalizedUserLocation,
  isHalfOpenProbe
) {
  try {
    const [statusCodeNI, niPlacesData] = await runNiRequest(optionsOAuth)
    return { statusCodeNI, niPlacesData }
  } catch (error) {
    const errorType =
      error.name === 'AbortError' || error.message?.includes('Timeout')
        ? 'timeout'
        : 'error'
    logger.error(
      `[getNIPlaces] NI API call failed after retries: ${error.message}`,
      {
        errorType,
        timeoutMs: config.get('niApiTimeoutMs'),
        maxRetries: config.get('niApiMaxRetries'),
        retryDelayMs: config.get('niApiRetryDelayMs'),
        breakerFailureCount: circuitBreakerState.failureCount,
        breakerOpenUntilMs: circuitBreakerState.openUntilMs,
        halfOpenProbe: isHalfOpenProbe
      }
    )
    recordCircuitBreakerFailure()

    return {
      fallback: getFallbackFromCacheOrServiceUnavailable(
        cacheKey,
        normalizedUserLocation,
        { errorType }
      )
    }
  }
}

async function retryNiRequestAfterUnauthorized(
  isMockEnabled,
  statusCodeNI,
  runNiRequest,
  request
) {
  if (isMockEnabled || statusCodeNI !== 401) {
    return null
  }

  logger.warn('[getNIPlaces] NI API returned 401; refreshing OAuth token')
  const tokenResult = await refreshOAuthToken(request, { logger })
  if (tokenResult?.error) {
    logger.error(
      `[getNIPlaces] OAuth token refresh failed after 401: ${tokenResult.error}`
    )
    return { error: SERVICE_UNAVAILABLE_ERROR }
  }

  const accessToken = tokenResult?.accessToken
  if (!accessToken) {
    logger.error('[getNIPlaces] OAuth token missing after refresh')
    return { error: SERVICE_UNAVAILABLE_ERROR }
  }

  const optionsOAuth = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  }

  try {
    const [nextStatusCodeNI, nextNiPlacesData] =
      await runNiRequest(optionsOAuth)
    return { statusCodeNI: nextStatusCodeNI, niPlacesData: nextNiPlacesData }
  } catch (error) {
    logger.error(
      `[getNIPlaces] NI API retry failed after token refresh: ${error.message}`
    )
    return { error: SERVICE_UNAVAILABLE_ERROR }
  }
}

function isNiServiceUnavailable(statusCodeNI, niPlacesData) {
  return !statusCodeNI || niPlacesData?.error === SERVICE_UNAVAILABLE_ERROR
}

function normalizeNiPlacesData(niPlacesData, isMockEnabled) {
  if (isMockEnabled) {
    return {
      results: Array.isArray(niPlacesData) ? niPlacesData : [niPlacesData]
    }
  }

  if (niPlacesData?.results) {
    return {
      results: Array.isArray(niPlacesData.results)
        ? niPlacesData.results
        : [niPlacesData.results]
    }
  }

  return { results: [] }
}

function logNiSuccessResult(niPlacesData) {
  logger.info(`[getNIPlaces] NI data fetched successfully`)
  logger.info(
    `[getNIPlaces] Number of results: ${niPlacesData?.results?.length}`
  )

  if (niPlacesData?.results?.length > 0) {
    niPlacesData.results.forEach((result, index) => {
      logger.info(
        `[getNIPlaces] Result ${index}: easting=${result.easting}, northing=${result.northing}, xCoordinate=${result.xCoordinate}, yCoordinate=${result.yCoordinate}, latitude=${result.latitude}, longitude=${result.longitude}`
      )
    })
  }
}

async function fetchNiPlacesDataWithRetry({
  runNiRequest,
  optionsOAuth,
  cacheKey,
  normalizedUserLocation,
  isHalfOpenProbe,
  isMockEnabled,
  request
}) {
  const niRequestResult = await executeNiRequestWithFailureHandling(
    runNiRequest,
    optionsOAuth,
    cacheKey,
    normalizedUserLocation,
    isHalfOpenProbe
  )
  if (niRequestResult.fallback) {
    return { earlyResponse: niRequestResult.fallback }
  }

  let { statusCodeNI, niPlacesData } = niRequestResult

  const retryResult = await retryNiRequestAfterUnauthorized(
    isMockEnabled,
    statusCodeNI,
    runNiRequest,
    request
  )
  if (retryResult?.error) {
    return { earlyResponse: { results: [], error: SERVICE_UNAVAILABLE_ERROR } }
  }
  if (retryResult?.statusCodeNI !== undefined) {
    statusCodeNI = retryResult.statusCodeNI
    niPlacesData = retryResult.niPlacesData
  }

  return { statusCodeNI, niPlacesData }
}

function finalizeNiPlacesResponse({
  statusCodeNI,
  niPlacesData,
  isMockEnabled,
  cacheKey,
  normalizedUserLocation
}) {
  const normalizedStatus = statusCodeNI ?? 'unknown'
  const normalizedData = niPlacesData ?? null
  logger.info(`[getNIPlaces] Response status: ${normalizedStatus}`)
  logger.info(
    `[getNIPlaces] Response summary: ${JSON.stringify(getNiResponseSummary(normalizedData))}`
  )

  if (statusCodeNI === 204) {
    logger.info(
      `[getNIPlaces] NI API returned 204 No Content - postcode not found`
    )
    return { results: [] }
  }

  if (isNiServiceUnavailable(statusCodeNI, niPlacesData)) {
    logger.error(
      `[getNIPlaces] NI API unavailable - statusCodeNI: ${statusCodeNI}`,
      {
        statusCodeNI,
        breakerFailureCount: circuitBreakerState.failureCount,
        breakerOpenUntilMs: circuitBreakerState.openUntilMs
      }
    )
    recordCircuitBreakerFailure()
    return getFallbackFromCacheOrServiceUnavailable(
      cacheKey,
      normalizedUserLocation
    )
  }

  const normalizedNiPlacesData = normalizeNiPlacesData(
    niPlacesData,
    isMockEnabled
  )
  if (statusCodeNI === STATUS_CODE_SUCCESS) {
    resetCircuitBreaker()
    setCachedResult(cacheKey, normalizedNiPlacesData)
    logNiSuccessResult(normalizedNiPlacesData)
  } else {
    logger.error(
      `[getNIPlaces] Error fetching NI data - statusCode: ${statusCodeNI}`
    )
  }

  return normalizedNiPlacesData
}

// ''  Simplified - removed test-only DI parameters
async function getNIPlaces(userLocation, request) {
  const isMockEnabled = config.get('enabledMock')
  const { normalizedUserLocation, cacheKey, postcodeNortherIrelandURL } =
    buildNiRequestContext(userLocation, isMockEnabled)

  const { isHalfOpenProbe, shortCircuitResponse } =
    getCircuitBreakerShortCircuitResponse(cacheKey, normalizedUserLocation)
  if (shortCircuitResponse) {
    return shortCircuitResponse
  }

  const oauthResult = await buildNiOAuthOptions(isMockEnabled, request)
  if (oauthResult.error) {
    return { results: [], error: SERVICE_UNAVAILABLE_ERROR }
  }

  const optionsOAuth = oauthResult.optionsOAuth

  logNiRequestStart(
    isMockEnabled,
    postcodeNortherIrelandURL,
    optionsOAuth,
    isHalfOpenProbe,
    normalizedUserLocation
  )

  const runNiRequest = createNiRequestRunner(
    postcodeNortherIrelandURL,
    normalizedUserLocation,
    isMockEnabled,
    isHalfOpenProbe
  )

  const requestResult = await fetchNiPlacesDataWithRetry({
    runNiRequest,
    optionsOAuth,
    cacheKey,
    normalizedUserLocation,
    isHalfOpenProbe,
    isMockEnabled,
    request
  })
  if (requestResult.earlyResponse) {
    return requestResult.earlyResponse
  }

  return finalizeNiPlacesResponse({
    statusCodeNI: requestResult.statusCodeNI,
    niPlacesData: requestResult.niPlacesData,
    isMockEnabled,
    cacheKey,
    normalizedUserLocation
  })
}

export { getNIPlaces, resetNiPlacesState }
