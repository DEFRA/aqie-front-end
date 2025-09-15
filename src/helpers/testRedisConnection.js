import Redis from 'ioredis'

// '' - Function to test Redis connection
export async function testRedisConnection() {
  const redis = new Redis()

  try {
    await redis.ping()
    redis.disconnect()
    return true
  } catch (error) {
    console.error('Redis connection test failed:', error.message)
    redis.disconnect()
    return false
  }
}
