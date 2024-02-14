import { searchLocationController } from '~/src/server/search-location/controller'

const searchLocation = {
  plugin: {
    name: 'search-location',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/search-location',
          ...searchLocationController
        }
      ])
    }
  }
}

export { searchLocation }
