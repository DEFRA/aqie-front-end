/* global describe, test, expect, vi, beforeEach */

import { clientLogHandler } from './client-log-route.js'

vi.mock('../../config/index.js', () => {
  const configStore = new Map([['isProduction', false]])

  return {
    config: {
      get: (key) => configStore.get(key)
    }
  }
})

vi.mock('../common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn()
  })
}))

describe('client log route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('returns ok in non-production', () => {
    const h = {
      response: (payload) => ({
        payload,
        code: (statusCode) => ({ payload, statusCode })
      })
    }
    const request = {
      path: '/test/client-log',
      payload: { message: 'Test log' }
    }

    const result = clientLogHandler(request, h)

    expect(result.statusCode).toBe(200)
    expect(result.payload).toEqual({ ok: true })
  })
})
