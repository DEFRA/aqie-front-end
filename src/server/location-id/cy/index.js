import { getLocationDetailsController } from '~/src/server/location-id/cy/controller'

const locationIdCy = {
  plugin: {
    name: 'lleoliad/{id}',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/lleoliad/{id}',
          ...getLocationDetailsController
        }
      ])
    }
  }
}

export { locationIdCy }
