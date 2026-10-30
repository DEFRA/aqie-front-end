/* global vi */

import { privacy } from './index.js'
import { privacyController } from './controller.js'
import Hapi from '@hapi/hapi'

vi.mock('./controller.js', () => ({
  privacyController: {
    handler: vi.fn(),
    options: {}
  }
}))

describe('privacy index plugin - en', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await privacy.plugin.register(server)
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
