import { sulphurDioxideController } from './controller'
import { sulphurDioxideCy } from './index'
import Hapi from '@hapi/hapi'

describe('sulphurDioxide index plugin - cy', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await sulphurDioxideCy.plugin.register(server)
  })

  beforeEach(() => {
    jest.mock('./controller', () => ({
      sulphurDioxideController: {
        handler: jest.fn(),
        options: {}
      }
    }))
  })

  test('should register sulphurDioxide route - cy', () => {
    const routes = server.table()
    const sulphurDioxideCyRoute = routes.find(
      (routes) =>
        routes.path === '/llygryddion/sylffwr-deuocsid/cy' &&
        routes.method === 'get'
    )
    expect(sulphurDioxideCyRoute).toBeDefined()
    expect(sulphurDioxideCyRoute.settings.handler).toBe(
      sulphurDioxideController.handler
    )
  })
})
