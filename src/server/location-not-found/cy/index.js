import { locationNotFoundController } from '~/src/server/location-not-found/cy/controller'

const locationNotFoundCy = {
  plugin: {
    name: 'lleoliad-heb-ei-ganfod',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/lleoliad-heb-ei-ganfod/cy',
          ...locationNotFoundController
        }
      ])
    }
  }
}

export { locationNotFoundCy }
