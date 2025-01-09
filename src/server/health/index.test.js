import { healthController } from './controller'
import { health } from './index'
import Hapi from '@hapi/hapi'

describe('health index plugin', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await health.plugin.register(server)
  })

  beforeEach(() => {
    jest.mock('./controller', () => ({
      healthController: {
        handler: jest.fn(),
        options: {}
      }
    }))
  })

  test('should register healthController route', () => {
    const routes = server.table()
    const healthControllerRoute = routes.find(
      (routes) => routes.path === '/health' && routes.method === 'get'
    )
    expect(healthControllerRoute).toBeDefined()
    expect(healthControllerRoute.settings.handler).toBe(
      healthController.handler
    )
  })
})
