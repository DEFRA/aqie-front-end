/* global vi */
import { routes, configureRoutes } from './routes.js'

describe('Notify Routes', () => {
  test('configureRoutes returns correct route configuration', () => {
    const mockGetController = vi.fn()
    const mockPostController = vi.fn()

    const result = configureRoutes(mockGetController, mockPostController)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      method: 'GET',
      path: '/notify/register/sms-alerts',
      handler: mockGetController
    })
    expect(result[1]).toEqual({
      method: 'POST',
      path: '/notify/register/sms-alerts',
      handler: mockPostController
    })
  })

  test('routes array is defined correctly', () => {
    expect(routes).toBeDefined()
    expect(Array.isArray(routes)).toBe(true)
    expect(routes).toHaveLength(2)
  })
})
