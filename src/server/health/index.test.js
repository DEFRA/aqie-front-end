import { healthController } from './controller.js'
import { health } from './index'
import Hapi from '@hapi/hapi'

vi.mock('./controller.js', () => ({
  healthController: {
    handler: vi.fn(),
    options: {}
  }
}))

describe('health index plugin', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await health.plugin.register(server)
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
