import { getLocationDataController } from '~/src/server/locations/controller'

const locations = {
  plugin: {
    name: 'location',
    register: async (server) => {
      server.route([
        {
          method: ['GET', 'POST'],
          path: '/location',
          ...getLocationDataController
        }
      ])
    }
  }
}

export { locations }
