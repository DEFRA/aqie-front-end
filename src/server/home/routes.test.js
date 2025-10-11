import { configureRoutes } from './routes.js'
import { homeController } from './controller.js'

describe('Route Configuration', () => {
  it('should configure the routes correctly', () => {
    const routes = configureRoutes(homeController)
    expect(routes).toEqual([
      {
        method: 'GET',
        path: '/',
        ...homeController
      }
    ])
  })

  it('should test configureRoutes function directly', () => {
    // ''
    const mockController = { handler: () => {} }
    const result = configureRoutes(mockController)
    expect(result).toHaveLength(1)
    expect(result[0].method).toBe('GET')
    expect(result[0].path).toBe('/')
    expect(result[0].handler).toBe(mockController.handler)
  })
})
