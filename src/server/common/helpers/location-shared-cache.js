import { config } from '../../../config/index.js'
import { createLogger } from './logging/logger.js'
import { getSessionRedisClient } from './session-cache/cache-engine.js'
import { SHARED_LOCATION_CACHE_PREFIX } from '../../data/constants.js'

const logger = createLogger()

function normalizeSegment(value, fallback = 'na') {
  const normalized = String(value ?? fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/gi, '')

  return normalized || fallback
}

function buildMockSignature(query = {}) {
  const parts = [
    normalizeSegment(query.mockLevel, 'x'),
    normalizeSegment(query.mockDay, 'x'),
    normalizeSegment(query.mockPollutantBand, 'x'),
    normalizeSegment(query.testMode, 'x')
  ]
  return parts.join('_')
}

export function buildSharedLocationPayloadCacheKey(request, locationData = {}) {
  const query = request?.query || {}
  const locationId =
    request?.params?.id || locationData?.urlRoute || locationData?.headerTitle
  const lang = normalizeSegment(query.lang?.slice?.(0, 2) || 'en', 'en')
  const mockSignature = buildMockSignature(query)

  return `${SHARED_LOCATION_CACHE_PREFIX}${lang}:${normalizeSegment(locationId, 'unknown')}:${mockSignature}`
}

function getSharedLocationTtlMs() {
  const sharedLocationCacheTtlMs = Number(
    config.get('cacheDurations.sharedLocationCacheTtlMs')
  )
  const ttlCapMs =
    Number.isFinite(sharedLocationCacheTtlMs) && sharedLocationCacheTtlMs > 0
      ? sharedLocationCacheTtlMs
      : 20 * 60 * 1000

  const sessionTtlMs = Number(config.get('session.cache.ttl'))
  if (!Number.isFinite(sessionTtlMs) || sessionTtlMs <= 0) {
    return ttlCapMs
  }
  return Math.min(sessionTtlMs, ttlCapMs)
}

function getServerPolicy(request) {
  return request?.server?.app?.cachePolicies?.serverPolicy
}

export async function getSharedLocationPayload(request, cacheKey) {
  const serverPolicy = getServerPolicy(request)
  if (serverPolicy && cacheKey) {
    try {
      const payload = await serverPolicy.get(cacheKey)
      return payload || null
    } catch (error) {
      logger.warn(
        `[SHARED LOCATION CACHE] serverPolicy read failed for key='${cacheKey}': ${error.message}`
      )
    }
  }

  const redisClient = getSessionRedisClient()
  if (!redisClient || !cacheKey) {
    return null
  }

  try {
    const payload = await redisClient.get(cacheKey)
    if (!payload) {
      return null
    }
    return JSON.parse(payload)
  } catch (error) {
    logger.warn(
      `[SHARED LOCATION CACHE] failed to read key='${cacheKey}': ${error.message}`
    )
    return null
  }
}

export async function setSharedLocationPayload(request, cacheKey, payload) {
  const serverPolicy = getServerPolicy(request)
  if (serverPolicy && cacheKey && payload) {
    try {
      await serverPolicy.set(cacheKey, payload, getSharedLocationTtlMs())
      return true
    } catch (error) {
      logger.warn(
        `[SHARED LOCATION CACHE] serverPolicy write failed for key='${cacheKey}': ${error.message}`
      )
    }
  }

  const redisClient = getSessionRedisClient()
  if (!redisClient || !cacheKey || !payload) {
    return false
  }

  try {
    const ttlMs = getSharedLocationTtlMs()
    await redisClient.psetex(cacheKey, ttlMs, JSON.stringify(payload))
    return true
  } catch (error) {
    logger.warn(
      `[SHARED LOCATION CACHE] failed to write key='${cacheKey}': ${error.message}`
    )
    return false
  }
}
