import { searchLocationController } from './controller.js'
import { searchLocationCy } from './index.js'
import Hapi from '@hapi/hapi'

describe('search location index plugin - cy', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await searchLocationCy.plugin.register(server)
  })

  beforeEach(() => {
    vi.mock('./controller.js', () => ({
      searchLocationController: {
        handler: vi.fn(),
        options: {}
      }
    }))
  })

  test('should register search location route', () => {
    const routes = server.table()
    const searchLocationRoute = routes.find(
      (routes) =>
        routes.path === '/chwilio-lleoliad/cy' && routes.method === 'get'
    )
    expect(searchLocationRoute).toBeDefined()
    expect(searchLocationRoute.settings.handler).toBe(
      searchLocationController.handler
    )
  })
})
