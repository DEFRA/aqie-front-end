import { locationIdCy } from '~/src/server/location-id/cy/index'
import { getLocationDetailsController } from '~/src/server/location-id/cy/controller'
import Hapi from '@hapi/hapi'

describe('configureRoutes', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await locationIdCy.plugin.register(server)
  })

  beforeEach(() => {
    jest.mock('~/src/server/location-id/cy/controller', () => ({
      getLocationDetailsController: {
        handler: jest.fn(),
        options: {}
      }
    }))
  })

  it('should configure routes correctly', () => {
    const routes = server.table()
    const locationRoute = routes.find(
      (routes) => routes.path === '/lleoliad/{id}' && routes.method === 'get'
    )
    expect(locationRoute).toBeDefined()
    expect(locationRoute.settings.handler).toBe(
      getLocationDetailsController.handler
    )
  })
})
