import { getLocationDataController } from '~/src/server/multiple-results/cy/controller.js'
import { multipleResultsCy } from '~/src/server/multiple-results/cy/index.js'

describe('multiple-results index plugin - cy', () => {
  let server

  beforeEach(() => {
    server = {
      route: jest.fn()
    }
  })

  test('should register multiple-results route', async () => {
    await multipleResultsCy.plugin.register(server)

    expect(server.route).toHaveBeenCalledWith([
      {
        method: ['GET'],
        path: '/canlyniadau-lluosog/cy',
        ...getLocationDataController
      }
    ])
  })
})
