/* global vi */
import { sulphurDioxideController } from './controller.js'
import { sulphurDioxideCy } from './index'
import Hapi from '@hapi/hapi'

describe('sulphurDioxide index plugin - cy', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await sulphurDioxideCy.plugin.register(server)
  })

  beforeEach(() => {
    vi.mock('./controller.js', () => ({
      sulphurDioxideController: {
        handler: vi.fn(),
        options: {}
      }
    }))
  })

  it('should register sulphurDioxide route - cy', () => {
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
