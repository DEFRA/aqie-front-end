import { describe, expect, it, vi } from 'vitest'

import { configureRoutes, retry } from './index.js'
import { retryController } from './controller.js'

describe('retry index', () => {
  it('configureRoutes registers GET and POST /retry', () => {
    const server = {
      route: vi.fn()
    }

    configureRoutes(server)

    expect(server.route).toHaveBeenCalledTimes(1)
    const routes = server.route.mock.calls[0][0]
    expect(routes).toHaveLength(1)
    expect(routes[0]).toEqual({
      method: ['GET', 'POST'],
      path: '/retry',
      ...retryController
    })
  })

  it('plugin register delegates to configureRoutes', async () => {
    const server = {
      route: vi.fn()
    }

    expect(retry.plugin.name).toBe('retry')

    await retry.plugin.register(server)

    expect(server.route).toHaveBeenCalledTimes(1)
  })
})
