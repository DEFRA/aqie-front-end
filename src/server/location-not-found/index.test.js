import { locationNotFoundController } from '~/src/server/location-not-found/controller.js'
import { locationNotFound } from '~/src/server/location-not-found/index.js'

describe('location-not-found index plugin - en', () => {
  let server

  beforeEach(() => {
    server = {
      route: jest.fn()
    }
  })

  test('should register location-not-found route', async () => {
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
