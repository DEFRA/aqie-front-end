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
})
