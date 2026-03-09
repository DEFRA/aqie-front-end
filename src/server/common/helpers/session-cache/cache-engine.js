import { Engine as CatboxRedis } from '@hapi/catbox-redis'
import { Engine as CatboxMemory } from '@hapi/catbox-memory'

import { createLogger } from '../logging/logger.js'
import { buildRedisClient } from '../redis-client.js'
import { config } from '../../../../config/index.js'

let sessionRedisClient = null

export function getSessionRedisClient() {
  return sessionRedisClient
}

export function getCacheEngine(engine) {
  const logger = createLogger()

  if (engine === 'redis') {
    logger.info('Using Redis session cache')
    const redisClient = buildRedisClient(config.get('redis'))
    sessionRedisClient = redisClient
    return new CatboxRedis({ client: redisClient })
  }

  sessionRedisClient = null

  if (config.get('isProduction')) {
    logger.error(
      'Catbox Memory is for local development only, it should not be used in production!'
    )
  }

  const maxByteSize = config.get('session.cache.memory.maxByteSize')
  logger.info('Using Catbox Memory session cache')
  return new CatboxMemory({ maxByteSize })
}
