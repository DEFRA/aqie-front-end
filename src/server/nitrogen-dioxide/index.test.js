import { nitrogenDioxideController } from './controller.js'
import { nitrogenDioxide } from './index.js'
import Hapi from '@hapi/hapi'
import { vi } from 'vitest'

describe('nitrogen dioxide index plugin - en', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await nitrogenDioxide.plugin.register(server)
  })

  beforeEach(() => {
    vi.mock('../nitrogen-dioxide/controller.js', () => ({
      nitrogenDioxideController: {
        handler: vi.fn(),
        options: {}
      }
    }))
  })

  test('should register nitrogen dioxide route', () => {
    const allRoutes = server.table()
    const nitrogenDioxideRoute = allRoutes.find(
      (route) =>
        route.path === '/pollutants/nitrogen-dioxide' && route.method === 'get'
    )
    expect(nitrogenDioxideRoute).toBeDefined()
    expect(nitrogenDioxideRoute.settings.handler).toBe(
      nitrogenDioxideController.handler
    )
  })
})
