import { locationNotFoundController } from './controller.js'

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
