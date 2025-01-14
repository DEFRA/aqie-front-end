import { searchLocationController } from './controller'
import { searchLocation } from './index.js'
import Hapi from '@hapi/hapi'

describe('search location index plugin - en', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await searchLocation.plugin.register(server)
  })

  beforeEach(() => {
    jest.mock('./controller', () => ({
      searchLocationController: {
        handler: jest.fn(),
        options: {}
      }
    }))
  })

  test('should register search location route', () => {
    const routes = server.table()
    const searchLocationRoute = routes.find(
      (routes) => routes.path === '/search-location' && routes.method === 'get'
    )
    expect(searchLocationRoute).toBeDefined()
    expect(searchLocationRoute.settings.handler).toBe(
      searchLocationController.handler
    )
  })
})
