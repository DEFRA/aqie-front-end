import { getLocationDataController } from './controller.js'
import { searchMiddleware } from './middleware.js'

// Define the route configuration function
// This function configures the routes for the server
const configureRoutes = (server, dependencies = {}) => {
  // Destructure dependencies with default values for easier testing
  const {
    middleware = searchMiddleware,
    controller = getLocationDataController
  } = dependencies

  // Define the route configuration
  server.route([
    {
      method: ['GET', 'POST'], // Support both GET and POST methods
      path: '/location', // Define the route path
      options: {
        pre: [{ method: middleware, assign: 'location' }] // Use injected middleware or default
      },
      ...controller // Use injected controller or default
    }
  ])
}

// Define the plugin
// This plugin registers the routes for the 'location' feature
const locations = {
  plugin: {
    name: 'location', // Plugin name
    register: async (server, options = {}) => {
      // Pass dependencies to configureRoutes for easier testing
      configureRoutes(server, options.dependencies)
    }
  }
}

export { locations, configureRoutes } // Export the plugin and route configuration function
