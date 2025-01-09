import { configureRoutes } from '~/src/server/locations/index'
import { getLocationDetailsController } from '~/src/server/location-id/controller'

describe('Route Configuration', () => {
  let mockServer

  beforeEach(() => {
    mockServer = {
      route: jest.fn()
    }
  })

  it('should configure the routes correctly', () => {
    configureRoutes(mockServer)
    expect(mockServer.route).toHaveBeenCalledWith([
      {
        method: 'GET',
        path: '/location/{id}',
        ...getLocationDetailsController
      }
    ])
  })
})
