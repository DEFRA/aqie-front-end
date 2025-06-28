import { nitrogenDioxideController } from './controller.js'
import { nitrogenDioxideCy } from './index.js'
import Hapi from '@hapi/hapi'

describe('nitrogen dioxide index plugin - cy', () => {
  let server
  beforeAll(async () => {
    server = Hapi.server()
    await nitrogenDioxideCy.plugin.register(server)
  })

  beforeEach(() => {
    vi.mock('./controller.js', () => ({
      nitrogenDioxideController: {
        handler: vi.fn(),
        options: {}
      }
    }))
  })

  test('should register nitrogen dioxide cy route ', () => {
    const routes = server.table()
    const nitrogenDioxideRoute = routes.find(
      (routes) =>
        routes.path === '/llygryddion/nitrogen-deuocsid/cy' &&
        routes.method === 'get'
    )
    expect(nitrogenDioxideRoute).toBeDefined()
    expect(nitrogenDioxideRoute.settings.handler).toBe(
      nitrogenDioxideController.handler
    )
  })
})
