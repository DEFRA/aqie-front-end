import { getLocationDetailsController } from '~/src/server/search-location/controller'

const locationId = {
  plugin: {
    name: 'location:id',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/location/{id}',
          ...getLocationDetailsController
        }
      ])
    }
  }
}

export { locationId }
