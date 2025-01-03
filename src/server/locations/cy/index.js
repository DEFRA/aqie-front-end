import { getLocationDataController } from '~/src/server/locations/cy/controller'
import { searchMiddlewareCy } from '~/src/server/locations/cy/middleware-cy'

// Define the route configuration function
const configureRoutesCy = (server) => {
  server.route([
    {
      method: ['GET', 'POST'],
      path: '/lleoliad',
      options: {
        pre: [{ method: searchMiddlewareCy, assign: 'lleoliad' }]
      },
      ...getLocationDataController
    }
  ])
}

// Define the plugin
const locationsCy = {
  plugin: {
    name: 'lleoliad',
    register: async (server) => {
      configureRoutesCy(server)
    }
  }
}

export { locationsCy, configureRoutesCy }
