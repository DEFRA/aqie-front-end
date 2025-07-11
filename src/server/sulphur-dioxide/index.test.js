import { sulphurDioxideController } from './controller.js'
import { sulphurDioxide } from './index'
import Hapi from '@hapi/hapi'

describe('sulphurDioxide index plugin - en', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await sulphurDioxide.plugin.register(server)
  })

  beforeEach(() => {
    vi.mock('./controller.js', () => ({
      sulphurDioxideController: {
        handler: vi.fn(),
        options: {}
      }
    }))
  })

  test('should register sulphurDioxide route', () => {
    const routes = server.table()
    const sulphurDioxideRoute = routes.find(
      (route) =>
        route.path === '/pollutants/sulphur-dioxide' && route.method === 'get'
    )
    expect(sulphurDioxideRoute).toBeDefined()
    expect(sulphurDioxideRoute.settings.handler).toBe(
      sulphurDioxideController.handler
    )
  })
})
