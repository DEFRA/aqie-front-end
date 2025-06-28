import { getLocationDataController } from './controller.js'
import { multipleResults } from './index.js'
import Hapi from '@hapi/hapi'

describe('multiple-results index plugin - en', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await multipleResults.plugin.register(server)
  })

  beforeEach(() => {
    vi.mock('./controller.js', () => ({
      getLocationDataController: {
        handler: vi.fn(),
        options: {}
      }
    }))
  })

  test('should register multiple-results route', () => {
    const routes = server.table()
    const multipleResultsRoute = routes.find(
      (routes) => routes.path === '/multiple-results' && routes.method === 'get'
    )
    expect(multipleResultsRoute).toBeDefined()
    expect(multipleResultsRoute.settings.handler).toBe(
      getLocationDataController.handler
    )
  })
})
