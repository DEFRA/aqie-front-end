import { searchLocationController } from './controller.js'
import { EventEmitter } from 'node:events'

// Increase the maximum number of listeners for the process object
EventEmitter.defaultMaxListeners = 20

// Define the route configuration function
const configureRoutes = (server) => {
  server.route([
    {
      method: 'GET',
      path: '/search-location',
      ...searchLocationController
    }
  ])
}

// Define the plugin
const searchLocation = {
  plugin: {
    name: 'search-location',
    register: async (server) => {
      configureRoutes(server)
    }
  }
}

export { searchLocation, configureRoutes }
