import { particulateMatter25Controller } from './controller.js'
import { particulateMatter25 } from './index'
import Hapi from '@hapi/hapi'

vi.mock('./controller.js', () => ({
  particulateMatter25Controller: {
    handler: vi.fn(),
    options: {}
  }
}))

describe('particulateMatter25 index plugin - en', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await particulateMatter25.plugin.register(server)
  })

  test('should register particulateMatter25 route', () => {
    const routes = server.table()
    const particulateMatter25Route = routes.find(
      (routes) =>
        routes.path === '/pollutants/particulate-matter-25' &&
        routes.method === 'get'
    )
    expect(particulateMatter25Route).toBeDefined()
    expect(particulateMatter25Route.settings.handler).toBe(
      particulateMatter25Controller.handler
    )
  })
})
