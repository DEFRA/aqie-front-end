import { ozoneController } from './controller'
import { ozone } from './index'
import Hapi from '@hapi/hapi'

describe('ozone index plugin - en', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await ozone.plugin.register(server)
  })

  beforeEach(() => {
    jest.mock('./controller', () => ({
      ozoneController: {
        handler: jest.fn(),
        options: {}
      }
    }))
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
