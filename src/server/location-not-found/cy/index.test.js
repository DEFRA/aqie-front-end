import { locationNotFoundController } from '~/src/server/location-not-found/cy/controller.js'
import { locationNotFoundCy } from '~/src/server/location-not-found/cy/index.js'

describe('location-not-found index plugin - cy', () => {
  let server

  beforeEach(() => {
    server = {
      route: jest.fn()
    }
  })

  test('should register location-not-found route', async () => {
    await locationNotFoundCy.plugin.register(server)

    expect(server.route).toHaveBeenCalledWith([
      {
        method: 'GET',
        path: '/lleoliad-heb-ei-ganfod/cy',
        ...locationNotFoundController
      }
    ])
  })
})
