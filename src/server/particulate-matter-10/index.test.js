import { particulateMatter10Controller } from './controller'
import { particulateMatter10 } from './index'
import Hapi from '@hapi/hapi'

describe('particulateMatter10 index plugin - en', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await particulateMatter10.plugin.register(server)
  })

  beforeEach(() => {
    jest.mock('./controller', () => ({
      particulateMatter10Controller: {
        handler: jest.fn(),
        options: {}
      }
    }))
  })

  test('should register particulateMatter10 route', () => {
    const routes = server.table()
    const particulateMatter10Route = routes.find(
      (routes) =>
        routes.path === '/pollutants/particulate-matter-10' &&
        routes.method === 'get'
    )
    expect(particulateMatter10Route).toBeDefined()
    expect(particulateMatter10Route.settings.handler).toBe(
      particulateMatter10Controller.handler
    )
  })
})