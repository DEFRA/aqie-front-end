// ''
import { config } from '../../../config/index.js'
import { createLogger } from './logging/logger.js'

const logger = createLogger()

function getDurationMs(key, fallbackMs) {
  const value = Number(config.get(key))
  return Number.isFinite(value) && value > 0 ? value : fallbackMs
}

export function registerServerCachePolicies(server) {
  const serverSharedCacheTtlMs = getDurationMs(
    'cacheDurations.serverSharedCacheTtlMs',
    60 * 60 * 1000
  )
  const userDataCacheTtlMs = getDurationMs(
    'cacheDurations.userDataCacheTtlMs',
    15 * 60 * 1000
  )
  const existingCachePolicies = server.app.cachePolicies
  try {
    const serverPolicy = server.cache({
      cache: 'serverCache',
      segment: 'shared',
      expiresIn: serverSharedCacheTtlMs
    })

    const userDataPolicy = server.cache({
      cache: 'serverCache',
      segment: 'userdata',
      expiresIn: userDataCacheTtlMs
    })

    server.app.cachePolicies = {
      ...existingCachePolicies,
      serverPolicy,
      userDataPolicy
    }

    return {
      serverPolicy,
      userDataPolicy
    }
  } catch (error) {
    logger.warn(
      `[SERVER CACHE POLICIES] Failed to initialize server cache policies: ${error.message}`
    )
    return existingCachePolicies || {}
  }
}
