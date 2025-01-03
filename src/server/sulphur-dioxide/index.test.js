import { sulphurDioxideController } from './controller'
import { sulphurDioxide } from './index'
import Hapi from '@hapi/hapi'

describe('sulphurDioxide index plugin - en', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await sulphurDioxide.plugin.register(server)
  })

  beforeEach(() => {
    jest.mock('./controller', () => ({
      sulphurDioxideController: {
        handler: jest.fn(),
        options: {}
      }
    }))
  })

  test('should register sulphurDioxide route', () => {
    const routes = server.table()
    const sulphurDioxideRoute = routes.find(
      (routes) =>
        routes.path === '/pollutants/sulphur-dioxide' && routes.method === 'get'
    )
    expect(sulphurDioxideRoute).toBeDefined()
    expect(sulphurDioxideRoute.settings.handler).toBe(
      sulphurDioxideController.handler
    )
  })
})
