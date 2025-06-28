import { searchLocationController } from './controller.js'

const searchLocationCy = {
  plugin: {
    name: 'search-location-cy',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/chwilio-lleoliad/cy',
          ...searchLocationController
        }
      ])
    }
  }
}

export { searchLocationCy }
