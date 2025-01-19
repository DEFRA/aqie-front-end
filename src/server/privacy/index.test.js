import { privacy } from './index.js'
import { privacyController } from './controller'
import Hapi from '@hapi/hapi'

describe('privacy index plugin - en', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await privacy.plugin.register(server)
  })

  beforeEach(() => {
    jest.mock('./controller', () => ({
      privacyController: {
        handler: jest.fn(),
        options: {}
      }
    }))
  })

  test('should register privacy route - en', () => {
    const routes = server.table()
    const privacyRoute = routes.find(
      (routes) => routes.path === '/privacy' && routes.method === 'get'
    )
    expect(privacyRoute).toBeDefined()
    expect(privacyRoute.settings.handler).toBe(privacyController.handler)
  })
})
