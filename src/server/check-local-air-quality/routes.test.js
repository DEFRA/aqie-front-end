import { configureRoutes } from '~/src/server/home/routes'
import { homeController } from '~/src/server/home/controller'

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
