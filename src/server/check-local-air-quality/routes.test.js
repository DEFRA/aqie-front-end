import { configureRoutes } from './routes'
import { homeController } from './controller'

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
