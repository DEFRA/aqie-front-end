import { config } from '../../../../config/index.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import {
  CIRCUIT_BREAKER_DEFAULT_FAILURE_THRESHOLD,
  SERVICE_UNAVAILABLE_ERROR
} from '../../../data/constants.js'

const logger = createLogger()
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
    failureThreshold:
      config.get('niApiCircuitBreakerFailureThreshold') ??
      CIRCUIT_BREAKER_DEFAULT_FAILURE_THRESHOLD,
    openDurationMs: config.get('niApiCircuitBreakerOpenMs') ?? 60 * 1000
  }
}

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

function getCircuitBreakerSnapshot() {
  return {
    failureCount: circuitBreakerState.failureCount,
    openUntilMs: circuitBreakerState.openUntilMs,
    halfOpenInFlight: circuitBreakerState.halfOpenInFlight
  }
}

export {
  getCacheKey,
  setCachedResult,
  recordCircuitBreakerFailure,
  resetCircuitBreaker,
  resetNiPlacesState,
  getFallbackFromCacheOrServiceUnavailable,
  getCircuitBreakerShortCircuitResponse,
  getCircuitBreakerSnapshot
}
