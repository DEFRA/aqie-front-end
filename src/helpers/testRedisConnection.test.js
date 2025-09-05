import { describe, it, expect, vi, beforeEach } from 'vitest'
import { testRedisConnection } from './testRedisConnection.js'

// Mock the Redis client
const mockRedis = {
  ping: vi.fn(),
  disconnect: vi.fn()
}

// Mock the ioredis module
vi.mock('ioredis', () => {
  return {
    default: vi.fn(() => mockRedis)
  }
})

// Add a comment: ''

describe('testRedisConnection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return true when Redis connection is successful', async () => {
    // ''
    mockRedis.ping.mockResolvedValue('PONG')

    const result = await testRedisConnection()

    expect(result).toBe(true)
    expect(mockRedis.ping).toHaveBeenCalledOnce()
    expect(mockRedis.disconnect).toHaveBeenCalledOnce()
  })

  it('should return false when Redis connection fails', async () => {
    // ''
    mockRedis.ping.mockRejectedValue(new Error('Connection failed'))

    const result = await testRedisConnection()

    expect(result).toBe(false)
    expect(mockRedis.ping).toHaveBeenCalledOnce()
    expect(mockRedis.disconnect).toHaveBeenCalledOnce()
  })

  it('should handle Redis ping timeout gracefully', async () => {
    // ''
    mockRedis.ping.mockRejectedValue(new Error('Timeout'))

    const result = await testRedisConnection()

    expect(result).toBe(false)
    expect(mockRedis.disconnect).toHaveBeenCalledOnce()
  })

  it('should disconnect Redis client even if ping fails', async () => {
    // ''
    mockRedis.ping.mockRejectedValue(new Error('Network error'))

    await testRedisConnection()

    expect(mockRedis.disconnect).toHaveBeenCalledOnce()
  })
})
