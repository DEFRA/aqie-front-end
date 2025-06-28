import { configureRoutes, locationId } from './index'
import { getLocationDetailsController } from './controller.js'

describe('configureRoutes', () => {
  let server

  beforeEach(() => {
    server = {
      route: vi.fn()
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
      route: vi.fn()
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
