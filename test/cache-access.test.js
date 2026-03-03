/**
 * Test to verify we can access and write to the session cache
 * This validates the approach for async NI session updates
 */

import { describe, it, beforeAll, afterAll } from 'vitest'
import hapi from '@hapi/hapi'
import { config } from '../src/config/index.js'
import { getCacheEngine } from '../src/server/common/helpers/session-cache/cache-engine.js'
import { sessionCache } from '../src/server/common/helpers/session-cache/session-cache.js'

describe('Cache Access Test', () => {
  let server
  let sessionCachePolicy

  beforeAll(async () => {
    // Create minimal server with cache
    server = hapi.server({
      cache: [
        {
          name: config.get('session.cache.name'),
          engine: getCacheEngine(config.get('session.cache.engine'))
        }
      ]
    })

    await server.register(sessionCache)
    // '' Create a single cache policy instance to reuse in tests
    sessionCachePolicy = server.cache({
      cache: config.get('session.cache.name'),
      segment: 'session',
      expiresIn: 3600000
    })
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  it('should access cache via server and write session data', async () => {
    // Get cache instance
    const testSessionId = 'test-session-id-' + Date.now()
    const testData = {
      niProcessing: false,
      niRedirectTo: '/location/test',
      niError: null,
      testValue: 'cache-access-works'
    }

    // Write to cache
    await sessionCachePolicy.set(testSessionId, testData, 0)
    console.log('✓ Successfully wrote to cache')

    // Read back from cache
    const retrieved = await sessionCachePolicy.get(testSessionId)
    console.log('✓ Successfully read from cache:', retrieved)

    // Verify data matches
    if (JSON.stringify(retrieved) === JSON.stringify(testData)) {
      console.log('✓ Data matches! Cache access works correctly')
    } else {
      throw new Error('Data mismatch!')
    }
  })

  it('should access cache via server._core.caches if cache() fails', async () => {
    try {
      // Check if we can access internal caches
      const caches = server._core?.caches
      console.log('Available caches:', Object.keys(caches || {}))

      if (caches) {
        const sessionCacheName = config.get('session.cache.name')
        const cacheClient = caches.get(sessionCacheName)?.client
        console.log('✓ Found cache client:', !!cacheClient)
      }
    } catch (error) {
      console.log('Internal cache access not available:', error.message)
    }
  })

  it('should simulate yar session workflow', async () => {
    // Create a test route that uses yar
    server.route({
      method: 'GET',
      path: '/test-cache',
      handler: async (request, h) => {
        // Get session ID
        const sessionId = request.yar.id
        console.log('Session ID:', sessionId)

        // Set some data via yar
        request.yar.set('testKey', 'testValue')

        // Get cache to write additional data
        // Simulate async update after response
        setTimeout(async () => {
          try {
            // Read current session
            const currentSession = await sessionCachePolicy.get(sessionId)
            console.log('Current session from cache:', currentSession)

            // Update it
            const updatedSession = {
              ...currentSession,
              asyncUpdate: true,
              niProcessing: false,
              niRedirectTo: '/test-redirect'
            }

            // Write back
            await sessionCachePolicy.set(sessionId, updatedSession, 0)
            console.log('✓ Successfully updated session asynchronously')
          } catch (error) {
            console.error('✗ Async update failed:', error.message)
          }
        }, 100)

        return h.response({ ok: true })
      }
    })

    // Make request
    const res = await server.inject({
      method: 'GET',
      url: '/test-cache'
    })

    console.log('Response:', res.statusCode)

    // Wait for async operation
    await new Promise((resolve) => setTimeout(resolve, 200))
  })
})
