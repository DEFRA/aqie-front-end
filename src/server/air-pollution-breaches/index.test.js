import Hapi from '@hapi/hapi'
import { airPollutionBreachesController } from './controller.js'
import { airPollutionBreaches } from './index.js'

describe('air pollution breaches index plugin - en', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await airPollutionBreaches.plugin.register(server)
  })

  test('should register air pollution breaches route - en', () => {
    const routes = server.table()
    const route = routes.find(
      (item) => item.path === '/air-pollution-breaches' && item.method === 'get'
    )

    expect(route).toBeDefined()
    expect(route.settings.handler).toBe(airPollutionBreachesController.handler)
  })
})
