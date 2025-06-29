import { locationNotFoundController } from './controller.js'

const locationNotFound = {
  plugin: {
    name: 'location-not-found',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/location-not-found',
          ...locationNotFoundController
        }
      ])
    }
  }
}

export { locationNotFound }
