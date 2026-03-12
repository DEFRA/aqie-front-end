// ''
import { config } from '../../../config/index.js'
import { createLogger } from './logging/logger.js'
import { getSessionRedisClient } from './session-cache/cache-engine.js'
import { FIFTEEN_MINUTES_MS } from '../../data/constants.js'

const logger = createLogger()
const USER_DATA_CACHE_PREFIX = 'userdata:'

function normalizeSegment(value, fallback = 'na') {
  const normalized = String(value ?? fallback)
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9_-]/gi, '')

  return normalized || fallback
}

function resolveUserScope(request) {
  const sessionCookieName = config.get('session.cache.name')
  return (
    request?.state?.[sessionCookieName] || request?.yar?.id || request?.info?.id
  )
}

function getUserDataPolicy(request) {
  return request?.server?.app?.cachePolicies?.userDataPolicy
}

export function buildUserLocationMetaCacheKey(
  request,
  locationId,
  lang = 'en'
) {
  const userScope = resolveUserScope(request)
  const normalizedLang = normalizeSegment(lang?.slice?.(0, 2) || 'en', 'en')
  const normalizedLocationId = normalizeSegment(locationId, 'unknown')

  return `${USER_DATA_CACHE_PREFIX}location-meta:${normalizeSegment(userScope, 'anon')}:${normalizedLang}:${normalizedLocationId}`
}

export async function getUserDataPayload(request, cacheKey) {
  const userDataPolicy = getUserDataPolicy(request)
  if (userDataPolicy && cacheKey) {
    try {
      const payload = await userDataPolicy.get(cacheKey)
      return payload || null
    } catch (error) {
      logger.warn(
        `[USER DATA CACHE] userDataPolicy read failed for key='${cacheKey}': ${error.message}`
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
      `[USER DATA CACHE] redis read failed for key='${cacheKey}': ${error.message}`
    )
    return null
  }
}

export async function setUserDataPayload(request, cacheKey, payload) {
  const userDataPolicy = getUserDataPolicy(request)
  if (userDataPolicy && cacheKey && payload) {
    try {
      await userDataPolicy.set(cacheKey, payload, FIFTEEN_MINUTES_MS)
      return true
    } catch (error) {
      logger.warn(
        `[USER DATA CACHE] userDataPolicy write failed for key='${cacheKey}': ${error.message}`
      )
    }
  }

  const redisClient = getSessionRedisClient()
  if (!redisClient || !cacheKey || !payload) {
    return false
  }

  try {
    await redisClient.psetex(
      cacheKey,
      FIFTEEN_MINUTES_MS,
      JSON.stringify(payload)
    )
    return true
  } catch (error) {
    logger.warn(
      `[USER DATA CACHE] redis write failed for key='${cacheKey}': ${error.message}`
    )
    return false
  }
}
