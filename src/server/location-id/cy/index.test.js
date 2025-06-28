import { locationIdCy } from './index'
import { getLocationDetailsController } from './controller.js'
import Hapi from '@hapi/hapi'

vi.mock('./controller.js', () => ({
  getLocationDetailsController: {
    handler: vi.fn(),
    options: {}
  }
}))

describe('configureRoutes', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await locationIdCy.plugin.register(server)
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
