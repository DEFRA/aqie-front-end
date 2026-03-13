// ''
import { createLogger } from './logging/logger.js'
import { ONE_HOUR_MS, FIFTEEN_MINUTES_MS } from '../../data/constants.js'

const logger = createLogger()

export function registerServerCachePolicies(server) {
  const existingCachePolicies = server.app.cachePolicies
  try {
    const serverPolicy = server.cache({
      cache: 'serverCache',
      segment: 'shared',
      expiresIn: ONE_HOUR_MS
    })

    const userDataPolicy = server.cache({
      cache: 'serverCache',
      segment: 'userdata',
      expiresIn: FIFTEEN_MINUTES_MS
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
