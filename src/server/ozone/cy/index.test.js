import { ozoneController } from './controller.js'
import { ozoneCy } from './index'
import Hapi from '@hapi/hapi'

describe('ozone index plugin - cy', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await ozoneCy.plugin.register(server)
  })

  beforeEach(() => {
    vi.mock('./controller.js', () => ({
      ozoneController: {
        handler: vi.fn(),
        options: {}
      }
    }))
  })

  test('should register ozone route - cy', () => {
    const routes = server.table()
    const ozoneRoute = routes.find(
      (routes) =>
        routes.path === '/llygryddion/oson/cy' && routes.method === 'get'
    )
    expect(ozoneRoute).toBeDefined()
    expect(ozoneRoute.settings.handler).toBe(ozoneController.handler)
  })
})
