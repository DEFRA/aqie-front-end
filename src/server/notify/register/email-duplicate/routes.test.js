import { describe, it, expect, vi } from 'vitest'

import { routes, configureRoutes, duplicateGetController } from './routes.js'

vi.mock('./controller.js', () => ({
  handleEmailDuplicateRequest: vi.fn()
}))

vi.mock('../../../../config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'notify.emailDuplicatePath') {
        return '/notify/register/email-duplicate'
      }
      return undefined
    })
  }
}))

describe('email-duplicate/routes', () => {
  it('exports configured GET route', () => {
    expect(routes).toHaveLength(1)
    expect(routes[0].method).toBe('GET')
    expect(routes[0].path).toBe('/notify/register/email-duplicate')
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
