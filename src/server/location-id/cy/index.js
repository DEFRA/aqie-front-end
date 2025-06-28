import { getLocationDetailsController } from './controller.js'

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
