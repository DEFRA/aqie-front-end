import { vi } from 'vitest'

import { Cluster, Redis } from 'ioredis'

import { config } from '../../../config/index.js'
import { buildRedisClient } from './redis-client.js'

vi.mock('ioredis', async () => {
  const actualIoredis = await vi.importActual('ioredis')
  return {
    ...actualIoredis,
    Cluster: vi.fn().mockReturnValue({ on: () => ({}) }),
    Redis: vi.fn().mockReturnValue({ on: () => ({}) })
  }
})

describe('#buildRedisClient', () => {
  describe('When Redis Single InstanceCache is requested', () => {
    beforeEach(() => {
      buildRedisClient(config.get('redis'))
    })

    test('Should instantiate a single Redis client', () => {
      expect(Redis).toHaveBeenCalledWith({
        db: 0,
        host: '127.0.0.1',
        keyPrefix: 'aqie-front-end',
        port: 6379
      })
    })
  })

  describe('When a Redis Cluster is requested', () => {
    const testUsername = process.env.REDIS_TEST_USERNAME || 'test-user'
    const testPassword = process.env.REDIS_TEST_PASSWORD || 'test-password-123'
    
    beforeEach(() => {
      buildRedisClient({
        ...config.get('redis'),
        useSingleInstanceCache: false,
        useTLS: true,
        username: testUsername,
        password: testPassword
      })
    })

    test('Should instantiate a Redis Cluster client', () => {
      expect(Cluster).toHaveBeenCalledWith(
        [{ host: '127.0.0.1', port: 6379 }],
        {
          dnsLookup: expect.any(Function),
          keyPrefix: 'aqie-front-end',
          redisOptions: { db: 0, password: testPassword, tls: {}, username: testUsername },
          slotsRefreshTimeout: 10000
        }
      )
    })
  })
})
