import { describe, it, expect, vi, beforeEach } from 'vitest'

import { config } from '../../../config/index.js'
import {
  clearMockAlerts,
  getMockAlertStorageSnapshot
} from '../../common/services/notify.js'
import clearMockStoragePlugin from './clear-mock-storage.js'

vi.mock('../../common/services/notify.js', () => ({
  clearMockAlerts: vi.fn(() => 3),
  getMockAlertStorageSnapshot: vi.fn(() => [
    { key: 'k1', location: 'Leeds' },
    { key: 'k2', location: 'York' }
  ])
}))

vi.mock('../../../config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'env') {
        return 'test'
      }
      return undefined
    })
  }
}))

const createH = () => ({
  response: vi.fn((payload) => ({
    payload,
    code: vi.fn((statusCode) => ({ payload, statusCode }))
  }))
})

describe('notify debug clear-mock-storage plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    config.get.mockImplementation((key) => {
      if (key === 'env') {
        return 'test'
      }
      return undefined
    })
  })

  it('registers debug routes in non-production and handles both routes', async () => {
    const server = {
      route: vi.fn(),
      log: vi.fn()
    }

    await clearMockStoragePlugin.plugin.register(server)

    expect(server.route).toHaveBeenCalledTimes(1)
    const routes = server.route.mock.calls[0][0]
    expect(routes).toHaveLength(2)

    const postRoute = routes.find((route) => route.method === 'POST')
    const getRoute = routes.find((route) => route.method === 'GET')

    const postResult = await postRoute.handler({}, createH())
    expect(clearMockAlerts).toHaveBeenCalledTimes(1)
    expect(postResult.statusCode).toBe(200)
    expect(postResult.payload.clearedCount).toBe(3)

    const getResult = await getRoute.handler({}, createH())
    expect(getMockAlertStorageSnapshot).toHaveBeenCalledTimes(1)
    expect(getResult.statusCode).toBe(200)
    expect(getResult.payload.totalAlerts).toBe(2)
    expect(getResult.payload.alerts).toHaveLength(2)

    expect(server.log).toHaveBeenCalledTimes(1)
  })

  it('does not register debug routes in production', async () => {
    config.get.mockImplementation((key) => {
      if (key === 'env') {
        return 'production'
      }
      return undefined
    })

    const server = {
      route: vi.fn(),
      log: vi.fn()
    }

    await clearMockStoragePlugin.plugin.register(server)

    expect(server.route).not.toHaveBeenCalled()
    expect(server.log).not.toHaveBeenCalled()
  })
})
