import { describe, test, expect, vi } from 'vitest'
import {
  routes,
  configureRoutes,
  sendActivationGetController,
  sendActivationPostController
} from './routes.js'

describe('SMS Send Activation Routes', () => {
  test('configureRoutes returns correct route configuration', () => {
    const mockGetController = { handler: vi.fn() }
    const mockPostController = { handler: vi.fn() }

    const result = configureRoutes(mockGetController, mockPostController)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      method: 'GET',
      path: '/notify/register/sms-send-activation',
      handler: mockGetController.handler
    })
    expect(result[1]).toEqual({
      method: 'POST',
      path: '/notify/register/sms-send-activation',
      handler: mockPostController.handler
    })
  })

  test('routes array is defined correctly', () => {
    expect(routes).toBeDefined()
    expect(Array.isArray(routes)).toBe(true)
    expect(routes).toHaveLength(2)
  })

  test('controller objects have handler functions', () => {
    expect(sendActivationGetController).toHaveProperty('handler')
    expect(sendActivationPostController).toHaveProperty('handler')
    expect(typeof sendActivationGetController.handler).toBe('function')
    expect(typeof sendActivationPostController.handler).toBe('function')
  })
})
