import { privacyCy } from './index.js'
import { privacyController } from './controller'
import Hapi from '@hapi/hapi'

describe('privacy index plugin - cy', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await privacyCy.plugin.register(server)
  })

  beforeEach(() => {
    jest.mock('./controller', () => ({
      privacyController: {
        handler: jest.fn(),
        options: {}
      }
    }))
  })

  test('should register privacy route - cy', () => {
    const routes = server.table()
    const privacyRoute = routes.find(
      (routes) => routes.path === '/preifatrwydd/cy' && routes.method === 'get'
    )
    expect(privacyRoute).toBeDefined()
    expect(privacyRoute.settings.handler).toBe(privacyController.handler)
  })
})
