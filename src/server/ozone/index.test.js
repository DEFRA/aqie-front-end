import { ozoneController } from './controller.js'
import { ozone } from './index'
import Hapi from '@hapi/hapi'

vi.mock('./controller.js', () => ({
  ozoneController: {
    handler: vi.fn(),
    options: {}
  }
}))

describe('ozone index plugin - en', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await ozone.plugin.register(server)
  })

  test('should register ozone route', () => {
    const routes = server.table()
    const ozoneRoute = routes.find(
      (routes) => routes.path === '/pollutants/ozone' && routes.method === 'get'
    )
    expect(ozoneRoute).toBeDefined()
    expect(ozoneRoute.settings.handler).toBe(ozoneController.handler)
  })
})
