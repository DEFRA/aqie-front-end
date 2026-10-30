import { nitrogenDioxideController } from './controller.js'
import { nitrogenDioxide } from './index.js'
import Hapi from '@hapi/hapi'
import { vi } from 'vitest'

vi.mock('./controller.js', () => ({
  nitrogenDioxideController: {
    handler: vi.fn(),
    options: {}
  }
}))

describe('nitrogen dioxide index plugin - en', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await nitrogenDioxide.plugin.register(server)
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
