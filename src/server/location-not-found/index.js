import { searchLocationController } from '~/src/server/search-location/controller'

const searchLocation = {
  plugin: {
    name: 'location',
    register: async (server) => {
      server.route([
        {
          method: 'POST',
          path: '/location:id',
          ...searchLocationController
        }
      ])
    }
  }
}

export { searchLocation }
