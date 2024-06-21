import { searchLocationController } from '~/src/server/search-location/cy/controller'

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
