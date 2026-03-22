import { describe, it, expect, vi } from 'vitest'

import { routes, configureRoutes, duplicateGetController } from './routes.js'

vi.mock('./controller.js', () => ({
  handleDuplicateSubscriptionRequest: vi.fn()
}))

vi.mock('../../../../config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'notify.duplicateSubscriptionPath') {
        return '/notify/register/sms-duplicate'
      }
      return undefined
    })
  }
}))

describe('sms-duplicate/routes', () => {
  it('exports configured GET route', () => {
    expect(routes).toHaveLength(1)
    expect(routes[0].method).toBe('GET')
    expect(routes[0].path).toBe('/notify/register/sms-duplicate')
  })

  it('configureRoutes uses supplied controller', () => {
    const customController = { handler: vi.fn() }
    const customRoutes = configureRoutes(customController)

    expect(customRoutes[0].handler).toBe(customController.handler)
  })

  it('exports duplicateGetController', () => {
    expect(typeof duplicateGetController.handler).toBe('function')
  })
})
