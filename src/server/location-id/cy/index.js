import { getLocationDetailsController } from '~/src/server/locations/cy/controller'

const locationIdCy = {
  plugin: {
    name: 'lleoliad{id}',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/lleoliad/cy/{id}',
          ...getLocationDetailsController
        }
      ])
    }
  }
}

export { locationIdCy }
