/* global vi */
import {
  routes,
  configureRoutes,
  confirmAlertDetailsGetController,
  confirmAlertDetailsPostController
} from './routes.js'

describe('Confirm Alert Details Routes', () => {
  test('configureRoutes returns correct route configuration', () => {
    const mockGetController = { handler: vi.fn() }
    const mockPostController = { handler: vi.fn() }

    const result = configureRoutes(mockGetController, mockPostController)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      method: 'GET',
      path: '/notify/register/sms-confirm-details',
      handler: mockGetController.handler
    })
    expect(result[1]).toEqual({
      method: 'POST',
      path: '/notify/register/sms-confirm-details',
      handler: mockPostController.handler
    })
  })

  test('routes array is defined correctly', () => {
    expect(routes).toBeDefined()
    expect(Array.isArray(routes)).toBe(true)
    expect(routes).toHaveLength(2)
  })

  test('controllers are defined correctly', () => {
    expect(confirmAlertDetailsGetController).toBeDefined()
    expect(confirmAlertDetailsPostController).toBeDefined()
    expect(typeof confirmAlertDetailsGetController.handler).toBe('function')
    expect(typeof confirmAlertDetailsPostController.handler).toBe('function')
  })
})
