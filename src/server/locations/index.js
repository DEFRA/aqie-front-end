import { getLocationDataController } from '~/src/server/locations/controller'
import { searchMiddleware } from '~/src/server/locations/middleware'

// Define the route configuration function
const configureRoutes = (server) => {
  server.route([
    {
      method: ['GET', 'POST'],
      path: '/location',
      options: {
        pre: [{ method: searchMiddleware, assign: 'location' }]
      },
      ...getLocationDataController
    }
  ])
}

// Define the plugin
const locations = {
  plugin: {
    name: 'location',
    register: async (server) => {
      configureRoutes(server)
    }
  }
}

export { locations, configureRoutes }
