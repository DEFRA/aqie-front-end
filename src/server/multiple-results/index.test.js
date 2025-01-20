import { getLocationDataController } from '~/src/server/multiple-results/controller.js'
import { multipleResults } from '~/src/server/multiple-results/index.js'
import Hapi from '@hapi/hapi'

describe('multiple-results index plugin - en', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await multipleResults.plugin.register(server)
  })

  beforeEach(() => {
    jest.mock('~/src/server/multiple-results/controller', () => ({
      getLocationDataController: {
        handler: jest.fn(),
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
