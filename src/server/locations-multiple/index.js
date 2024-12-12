import { getLocationDataController } from '~/src/server/locations-multiple/controller'

const locationMultiple = {
  plugin: {
    name: 'location-multiple',
    register: async (server) => {
      server.route([
        {
          method: ['GET', 'POST'],
          path: '/location-multiple',
          ...getLocationDataController
        }
      ])
    }
  }
}

export { locationMultiple }
