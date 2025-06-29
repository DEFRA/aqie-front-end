import { locationNotFoundController } from '../location-not-found/controller.js'
import { locationNotFound } from '../location-not-found/index.js'

describe('location-not-found index plugin - en', () => {
  let server

  beforeEach(() => {
    server = {
      route: vi.fn()
    }
  })

  it('should register location-not-found route', async () => {
    await locationNotFound.plugin.register(server)

    expect(server.route).toHaveBeenCalledWith([
      {
        method: 'GET',
        path: '/location-not-found',
        ...locationNotFoundController
      }
    ])
  })
})
