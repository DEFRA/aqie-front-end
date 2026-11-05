import { particulateMatter25Controller } from './controller.js'
import { particulateMatter25Cy } from './index'
import Hapi from '@hapi/hapi'

vi.mock('./controller.js', () => ({
  particulateMatter25Controller: {
    handler: vi.fn(),
    options: {}
  }
}))

describe('particulateMatter25 index plugin - cy', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await particulateMatter25Cy.plugin.register(server)
  })

  test('should register particulateMatter25 route - cy', () => {
    const routes = server.table()
    const particulateMatter25CyRoute = routes.find(
      (routes) =>
        routes.path === '/llygryddion/mater-gronynnol-25/cy' &&
        routes.method === 'get'
    )
    expect(particulateMatter25CyRoute).toBeDefined()
    expect(particulateMatter25CyRoute.settings.handler).toBe(
      particulateMatter25Controller.handler
    )
  })
})
