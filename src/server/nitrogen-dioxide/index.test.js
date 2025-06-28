import { nitrogenDioxideController } from './controller.js'
import { nitrogenDioxide } from './index.js'
import Hapi from '@hapi/hapi'

describe('nitrogen dioxide index plugin - en', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await nitrogenDioxide.plugin.register(server)
  })

  beforeEach(() => {
    vi.mock('../nitrogen-dioxide/controller.js', () => ({
      nitrogenDioxideController: {
        handler: vi.fn(),
        options: {}
      }
    }))
  })

  test('should register nitrogen dioxide route', () => {
    const routes = server.table()
    const nitrogenDioxideRoute = routes.find(
      (routes) =>
        routes.path === '/pollutants/nitrogen-dioxide' &&
        routes.method === 'get'
    )
    expect(nitrogenDioxideRoute).toBeDefined()
    expect(nitrogenDioxideRoute.settings.handler).toBe(
      nitrogenDioxideController.handler
    )
  })
})
