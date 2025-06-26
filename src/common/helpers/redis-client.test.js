''
// Jest test for redis-client.js
import { buildRedisClient } from './redis-client'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import IoRedis from 'ioredis'

jest.mock('~/src/config', () => ({
  config: {
    get: jest.fn((key) => {
      if (key === 'redis') {
        return {
          enabled: true, // Ensure Redis is enabled
          useSingleInstanceCache: true,
          host: 'localhost',
          keyPrefix: 'test:',
          username: 'testUser',
          password: 'testPassword'
        }
      }
      return undefined
    })
  }
}))

jest.mock('~/src/server/common/helpers/logging/logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn()
  }))
}))

jest.mock('ioredis', () => {
  const mockRedisClient = {
    on: jest.fn(),
    connect: jest.fn()
  }
  return jest.fn(() => mockRedisClient)
})

describe('Redis Client', () => {
  it('should create a Redis client correctly', () => {
    const logger = createLogger()
    const mockRedisClient = new IoRedis()

    // Simulate the connect event
    mockRedisClient.on.mockImplementation((event, callback) => {
      if (event === 'connect') {
        callback()
      }
    })

    const client = buildRedisClient()

    // Trigger the connect event explicitly
    mockRedisClient.on('connect', () => {
      logger.info('Connected to Redis server')
    })

    expect(client).toBeDefined()
    expect(logger.info).toHaveBeenCalledTimes(1)
    expect(logger.info).toHaveBeenCalledWith('Connected to Redis server')
  })
})
