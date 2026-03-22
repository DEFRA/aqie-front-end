import { describe, expect, it, vi } from 'vitest'

import { loadingController } from './controller.js'
import { loadingStatusController } from './status-controller.js'
import { configureRoutes, loading } from './index.js'

describe('loading index', () => {
  it('configureRoutes registers loading and loading-status routes', () => {
    const server = {
      route: vi.fn()
    }

    configureRoutes(server)

    expect(server.route).toHaveBeenCalledTimes(1)
    const routes = server.route.mock.calls[0][0]
    expect(routes).toHaveLength(2)
    expect(routes[0]).toEqual({
      method: 'GET',
      path: '/loading',
      ...loadingController
    })
    expect(routes[1]).toEqual({
      method: 'GET',
      path: '/loading-status',
      ...loadingStatusController
    })
  })

  it('plugin register calls configureRoutes', async () => {
    const server = {
      route: vi.fn()
    }

    expect(loading.plugin.name).toBe('loading')

    await loading.plugin.register(server)

    expect(server.route).toHaveBeenCalledTimes(1)
  })
})
