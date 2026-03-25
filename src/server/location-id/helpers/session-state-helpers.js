import {
  REDIS_PRESSURE_MIN_GROWTH_RATIO,
  SESSION_GUARD_LOG_LIMIT_PER_REQUEST
} from '../../data/constants.js'
import { getSessionRedisClient } from '../../common/helpers/session-cache/cache-engine.js'

const REDIS_PRESSURE_DEFAULT_WINDOW_MS = 30000
const REDIS_PRESSURE_DEFAULT_COOLDOWN_MS = 300000
const REDIS_PRESSURE_DEFAULT_MIN_GROWTH_MEBIBYTES = 20
const REDIS_PRESSURE_GROWTH_RATIO_PRECISION = 3

function parseRedisInfoValue(infoText, key) {
  const match = infoText?.match(new RegExp(`^${key}:(.*)$`, 'm'))
  return match?.[1]?.trim() || ''
}

function isObjectLikeValue(value) {
  return Boolean(value && typeof value === 'object')
}

function hasObjectReferencePair(currentValue, nextValue) {
  return isObjectLikeValue(currentValue) && isObjectLikeValue(nextValue)
}

function areObjectValuesEqual(currentValue, nextValue) {
  try {
    return JSON.stringify(currentValue) === JSON.stringify(nextValue)
  } catch {
    return false
  }
}

function areSessionValuesEqual(currentValue, nextValue) {
  if (Object.is(currentValue, nextValue)) {
    return !hasObjectReferencePair(currentValue, nextValue)
  }

  if (hasObjectReferencePair(currentValue, nextValue)) {
    return areObjectValuesEqual(currentValue, nextValue)
  }

  return false
}

let runtimeDependencies

const redisPressureGuardState = {
  lastCheckAtMs: 0,
  lastUsedMemoryBytes: null,
  activeUntilMs: 0,
  inFlight: false
}

function getRuntimeDependencies() {
  if (!runtimeDependencies) {
    throw new Error('Session state helpers are not initialized')
  }
  return runtimeDependencies
}

function hasSessionCookie(request) {
  const { config } = getRuntimeDependencies()
  const sessionCookieName = config.get('session.cache.name')
  return Boolean(request?.state?.[sessionCookieName])
}

function isGlobalSessionGuardEnabled() {
  const { config } = getRuntimeDependencies()
  const env = config.get('env') || config.get('nodeEnv')
  if (env === 'production') {
    return true
  }

  if (env === 'test') {
    return false
  }

  const globalGuardEnabled = config.get('session.cache.globalGuardEnabled')
  return typeof globalGuardEnabled === 'boolean' ? globalGuardEnabled : true
}

function logSessionGuardSkip(request, operation, sessionKey, reason) {
  const { logger } = getRuntimeDependencies()
  const currentCount = request?.app?.sessionGuardSkipCount || 0
  const nextCount = currentCount + 1

  if (request?.app) {
    request.app.sessionGuardSkipCount = nextCount
  }

  if (nextCount <= SESSION_GUARD_LOG_LIMIT_PER_REQUEST) {
    logger.info(
      `[SESSION GUARD] Skipped session ${operation} for key='${sessionKey}' (${reason})`
    )
  }
}

function getRedisPressureConfigValue(path, fallbackValue) {
  const { config } = getRuntimeDependencies()
  const configuredValue = Number(config.get(path))
  return Number.isFinite(configuredValue) && configuredValue > 0
    ? configuredValue
    : fallbackValue
}

function getRedisPressureThresholds() {
  const checkIntervalMs = getRedisPressureConfigValue(
    'session.cache.redisPressure.checkIntervalMs',
    10000
  )
  const windowMs = getRedisPressureConfigValue(
    'session.cache.redisPressure.windowMs',
    REDIS_PRESSURE_DEFAULT_WINDOW_MS
  )
  const cooldownMs = getRedisPressureConfigValue(
    'session.cache.redisPressure.cooldownMs',
    REDIS_PRESSURE_DEFAULT_COOLDOWN_MS
  )
  const minGrowthMebibytes = getRedisPressureConfigValue(
    'session.cache.redisPressure.minGrowthMebibytes',
    REDIS_PRESSURE_DEFAULT_MIN_GROWTH_MEBIBYTES
  )
  const bytesPerMebibyte = getRedisPressureConfigValue(
    'session.cache.redisPressure.bytesPerMebibyte',
    1024 * 1024
  )

  return {
    checkIntervalMs,
    windowMs,
    cooldownMs,
    minGrowthBytes: minGrowthMebibytes * bytesPerMebibyte
  }
}

function isRedisPressureGuardActive() {
  return redisPressureGuardState.activeUntilMs > Date.now()
}

function maybeRefreshRedisPressureGuard() {
  const { logger } = getRuntimeDependencies()
  const nowMs = Date.now()
  const { checkIntervalMs, windowMs, cooldownMs, minGrowthBytes } =
    getRedisPressureThresholds()

  if (redisPressureGuardState.inFlight) {
    return
  }

  if (nowMs - redisPressureGuardState.lastCheckAtMs < checkIntervalMs) {
    return
  }

  const redisClient = getSessionRedisClient()
  if (!redisClient) {
    return
  }

  const previousCheckAtMs = redisPressureGuardState.lastCheckAtMs
  redisPressureGuardState.inFlight = true
  redisPressureGuardState.lastCheckAtMs = nowMs

  redisClient
    .info('memory')
    .then((memoryInfo) => {
      const usedMemoryBytes = Number(
        parseRedisInfoValue(memoryInfo, 'used_memory')
      )

      if (!Number.isFinite(usedMemoryBytes)) {
        return
      }

      const previousUsedMemoryBytes =
        redisPressureGuardState.lastUsedMemoryBytes
      const elapsedMs = nowMs - previousCheckAtMs

      if (Number.isFinite(previousUsedMemoryBytes) && elapsedMs <= windowMs) {
        const growthBytes = usedMemoryBytes - previousUsedMemoryBytes
        const growthRatio =
          previousUsedMemoryBytes > 0
            ? growthBytes / previousUsedMemoryBytes
            : 0

        if (
          growthBytes >= minGrowthBytes &&
          growthRatio >= REDIS_PRESSURE_MIN_GROWTH_RATIO
        ) {
          redisPressureGuardState.activeUntilMs = Date.now() + cooldownMs
          logger.warn(
            `[SESSION GUARD] Redis pressure guard activated growthBytes=${growthBytes} growthRatio=${growthRatio.toFixed(REDIS_PRESSURE_GROWTH_RATIO_PRECISION)} cooldownMs=${cooldownMs}`
          )
        }
      }

      redisPressureGuardState.lastUsedMemoryBytes = usedMemoryBytes
    })
    .catch((error) => {
      logger.warn(
        `[SESSION GUARD] Redis pressure sample failed: ${error.message}`
      )
    })
    .finally(() => {
      redisPressureGuardState.inFlight = false
    })
}

function isSessionMutationAllowed(request, operation, sessionKey) {
  const isGlobalGuardEnabled = isGlobalSessionGuardEnabled()

  if (isGlobalGuardEnabled && !hasSessionCookie(request)) {
    logSessionGuardSkip(request, operation, sessionKey, 'no session cookie')
    return false
  }

  if (isGlobalGuardEnabled) {
    maybeRefreshRedisPressureGuard()
    if (isRedisPressureGuardActive()) {
      logSessionGuardSkip(
        request,
        operation,
        sessionKey,
        'redis pressure guard active'
      )
      return false
    }
  }

  return true
}

function clearSessionKeyIfExists(request, sessionKey) {
  if (!isSessionMutationAllowed(request, 'clear', sessionKey)) {
    return
  }

  const currentValue = request?.yar?.get?.(sessionKey)
  if (currentValue !== undefined) {
    request.yar.clear(sessionKey)
    if (sessionKey === 'locationData') {
      request.yar.clear('locationDataCacheKey')
    }
  }
}

function setSessionKeyIfSessionExists(request, sessionKey, value) {
  if (!isSessionMutationAllowed(request, 'set', sessionKey)) {
    return
  }

  const currentValue = request?.yar?.get?.(sessionKey)
  if (areSessionValuesEqual(currentValue, value)) {
    return
  }

  request.yar.set(sessionKey, value)
}

async function persistLocationDataForLocationRoute(request, locationData) {
  const { buildSharedLocationPayloadCacheKey, setSharedLocationPayload } =
    getRuntimeDependencies()

  if (!isSessionMutationAllowed(request, 'set', 'locationData')) {
    return
  }

  const cacheKey = buildSharedLocationPayloadCacheKey(request, locationData)
  const isSharedCacheWriteSuccessful = await setSharedLocationPayload(
    request,
    cacheKey,
    locationData
  )

  if (!isSharedCacheWriteSuccessful) {
    setSessionKeyIfSessionExists(request, 'locationData', locationData)
    return
  }

  const locationDataLite = {
    cacheKey,
    locationType: locationData?.locationType,
    showSummaryDate: locationData?.showSummaryDate,
    issueTime: locationData?.issueTime,
    englishDate: locationData?.englishDate,
    welshDate: locationData?.welshDate,
    dailySummary: locationData?.dailySummary
      ? { issue_date: locationData.dailySummary.issue_date }
      : undefined
  }

  setSessionKeyIfSessionExists(request, 'locationDataCacheKey', cacheKey)
  setSessionKeyIfSessionExists(request, 'locationData', locationDataLite)
}

async function resolveLocationDataFromSessionOrSharedCache(request) {
  const { buildSharedLocationPayloadCacheKey, getSharedLocationPayload } =
    getRuntimeDependencies()

  const sessionLocationData = request.yar.get('locationData') || {}
  const hasFullLocationData =
    Array.isArray(sessionLocationData?.results) &&
    Boolean(sessionLocationData?.getForecasts)

  if (hasFullLocationData) {
    return sessionLocationData
  }

  const locationDataCacheKey = buildSharedLocationPayloadCacheKey(
    request,
    sessionLocationData
  )

  const sharedLocationData = await getSharedLocationPayload(
    request,
    locationDataCacheKey
  )
  if (sharedLocationData) {
    return sharedLocationData
  }

  return sessionLocationData
}

function createSessionStateHelpers(dependencies) {
  runtimeDependencies = dependencies

  return {
    hasSessionCookie,
    clearSessionKeyIfExists,
    setSessionKeyIfSessionExists,
    persistLocationDataForLocationRoute,
    resolveLocationDataFromSessionOrSharedCache
  }
}

export { createSessionStateHelpers }
