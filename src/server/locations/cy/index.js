import { getLocationDataController } from '~/src/server/locations/cy/controller'

const locationsCy = {
  plugin: {
    name: 'lleoliad',
    register: async (server) => {
      server.route([
        {
          method: ['GET', 'POST'],
          path: '/lleoliad/cy',
          ...getLocationDataController
        }
      ])
    }
  }
}

export { locationsCy }
