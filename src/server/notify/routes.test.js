import { describe, test, expect, vi } from 'vitest'
import { routes, configureRoutes } from './routes.js'

describe('Notify Routes', () => {
  test('configureRoutes returns correct route configuration', () => {
    const mockGetController = { handler: vi.fn() }
    const mockPostController = { handler: vi.fn() }

    const result = configureRoutes(mockGetController, mockPostController)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      method: 'GET',
      path: '/notify/register/sms-mobile-number',
      handler: mockGetController.handler
    })
    expect(result[1]).toEqual({
      method: 'POST',
      path: '/notify/register/sms-mobile-number',
      handler: mockPostController.handler
    })
  })

  test('routes array is defined correctly', () => {
    expect(routes).toBeDefined()
    expect(Array.isArray(routes)).toBe(true)
    expect(routes).toHaveLength(2)
  })
})
