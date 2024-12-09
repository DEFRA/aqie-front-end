import { getLocationDetailsController } from '~/src/server/locations/controller'

// Define the route configuration function
const configureRoutes = (server) => {
  server.route([
    {
      method: 'GET',
      path: '/location/{id}',
      ...getLocationDetailsController
    }
  ])
}

// Define the plugin
const locationId = {
  plugin: {
    name: 'location{id}',
    register: async (server) => {
      configureRoutes(server)
    }
  }
}

export { locationId, configureRoutes }
