import { getLocationDataController } from '~/src/server/search-location/controller'

const locations = {
  plugin: {
    name: 'location',
    register: async (server) => {
      server.route([
        {
          method: 'POST',
          path: '/location',
          ...getLocationDataController
        }
      ])
    }
  }
}

export { locations }
