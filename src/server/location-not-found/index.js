import { locationNotFoundController } from '~/src/server/location-not-found/controller'

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
