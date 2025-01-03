import { particulateMatter25Controller } from './controller'
import { particulateMatter25 } from './index'
import Hapi from '@hapi/hapi'

describe('particulateMatter25 index plugin - en', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await particulateMatter25.plugin.register(server)
  })

  beforeEach(() => {
    jest.mock('./controller', () => ({
      particulateMatter25Controller: {
        handler: jest.fn(),
        options: {}
      }
    }))
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
