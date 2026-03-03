import Redis from 'ioredis'
import { createLogger } from '../server/common/helpers/logging/logger.js'

const logger = createLogger()

// '' - Function to test Redis connection
export async function testRedisConnection() {
  const redis = new Redis()

  try {
    await redis.ping()
    redis.disconnect()
    return true
  } catch (error) {
    logger.error('Redis connection test failed:', error.message)
    redis.disconnect()
    return false
  }
}
