import { searchLocationController } from '~/src/server/search-location/controller'

const searchLocationCy = {
  plugin: {
    name: 'lleoliad',
    register: async (server) => {
      server.route([
        {
          method: 'POST',
          path: '/lleoliad{id}',
          ...searchLocationController
        }
      ])
    }
  }
}

export { searchLocationCy }
