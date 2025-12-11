import { describe, test, expect, vi } from 'vitest'
import {
  routes,
  configureRoutes,
  emailSendActivationGetController,
  emailSendActivationPostController
} from './routes.js'

describe('Email Send Activation Routes', () => {
  test('configureRoutes returns correct route configuration', () => {
    const mockGetController = { handler: vi.fn() }
    const mockPostController = { handler: vi.fn() }

    const result = configureRoutes(mockGetController, mockPostController)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      method: 'GET',
      path: '/notify/register/email-send-activation',
      handler: mockGetController.handler
    })
    expect(result[1]).toEqual({
      method: 'POST',
      path: '/notify/register/email-send-activation',
      handler: mockPostController.handler
    })
  })

  test('routes array is defined correctly', () => {
    expect(routes).toBeDefined()
    expect(Array.isArray(routes)).toBe(true)
    expect(routes).toHaveLength(2)
  })

  test('controller objects have handler functions', () => {
    expect(emailSendActivationGetController).toHaveProperty('handler')
    expect(emailSendActivationPostController).toHaveProperty('handler')
    expect(typeof emailSendActivationGetController.handler).toBe('function')
    expect(typeof emailSendActivationPostController.handler).toBe('function')
  })
})
