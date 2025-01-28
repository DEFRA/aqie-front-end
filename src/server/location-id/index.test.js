import { configureRoutes, locationId } from '~/src/server/location-id/index'
import { getLocationDetailsController } from '~/src/server/location-id/controller'

describe('configureRoutes', () => {
  let server

  beforeEach(() => {
    server = {
      route: jest.fn()
    }
  })

  it('should configure routes correctly', () => {
    configureRoutes(server)

    expect(server.route).toHaveBeenCalledWith([
      {
        method: 'GET',
        path: '/location/{id}',
        ...getLocationDetailsController
      }
    ])
  })
})

describe('locationId plugin', () => {
  let server

  beforeEach(() => {
    server = {
      route: jest.fn()
    }
  })

  it('should register the plugin and configure routes', async () => {
    await locationId.plugin.register(server)

    expect(server.route).toHaveBeenCalledWith([
      {
        method: 'GET',
        path: '/location/{id}',
        ...getLocationDetailsController
      }
    ])
  })
})
