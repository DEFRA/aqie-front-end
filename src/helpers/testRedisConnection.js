import Redis from 'ioredis'

// '' - Function to test Redis connection
export async function testRedisConnection() {
  const redis = new Redis()

  try {
    await redis.ping()
    await redis.disconnect()
    return true
  } catch (error) {
    await redis.disconnect()
    return false
  }
}
