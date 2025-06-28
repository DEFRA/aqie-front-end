import { getLocationDataController } from './controller.js'
import { multipleResultsCy } from './index.js'

describe('multiple-results index plugin - cy', () => {
  const server = {
    route: vi.fn()
  }

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
