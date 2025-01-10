import { particulateMatter10Controller } from './controller'
import { particulateMatter10Cy } from './index'
import Hapi from '@hapi/hapi'

describe('particulateMatter10 index plugin - cy', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await particulateMatter10Cy.plugin.register(server)
  })

  beforeEach(() => {
    jest.mock('./controller', () => ({
      particulateMatter10Controller: {
        handler: jest.fn(),
        options: {}
      }
    }))
  })

  test('should register particulateMatter10 route - cy', () => {
    const routes = server.table()
    const particulateMatter10CyRoute = routes.find(
      (routes) =>
        routes.path === '/llygryddion/mater-gronynnol-10/cy' &&
        routes.method === 'get'
    )
    expect(particulateMatter10CyRoute).toBeDefined()
    expect(particulateMatter10CyRoute.settings.handler).toBe(
      particulateMatter10Controller.handler
    )
  })
})
