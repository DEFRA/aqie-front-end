import { getLocationDataController } from './controller.js'
import { searchMiddlewareCy } from './middleware-cy.js'

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
