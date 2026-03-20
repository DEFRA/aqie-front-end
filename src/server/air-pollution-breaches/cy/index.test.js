import Hapi from '@hapi/hapi'
import { airPollutionBreachesCyController } from '../controller.js'
import { airPollutionBreachesCy } from './index.js'

describe('air pollution breaches index plugin - cy', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server()
    await airPollutionBreachesCy.plugin.register(server)
  })

  test('should register air pollution breaches route - cy', () => {
    const routes = server.table()
    const route = routes.find(
      (item) =>
        item.path === '/torriadau-llygredd-aer/cy' && item.method === 'get'
    )

    expect(route).toBeDefined()
    expect(route.settings.handler).toBe(
      airPollutionBreachesCyController.handler
    )
  })
})
