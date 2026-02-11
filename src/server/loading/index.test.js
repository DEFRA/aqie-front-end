/* global vi */
import Hapi from '@hapi/hapi'
import { loadingController } from './controller.js'
import { loading } from './index.js'

// ''

describe('loading index plugin', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await loading.plugin.register(server)
  })

  beforeEach(() => {
    vi.mock('./controller.js', () => ({
      loadingController: {
        handler: vi.fn(),
        options: {}
      }
    }))
  })

  test('should register loading route', () => {
    const routes = server.table()
    const loadingRoute = routes.find(
      (route) => route.path === '/loading' && route.method === 'get'
    )
    expect(loadingRoute).toBeDefined()
    expect(loadingRoute.settings.handler).toBe(loadingController.handler)
  })
})
