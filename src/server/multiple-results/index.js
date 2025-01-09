import { getLocationDataController } from '~/src/server/multiple-results/controller'

const multipleResults = {
  plugin: {
    name: 'multiple-results',
    register: async (server) => {
      server.route([
        {
          method: ['GET'],
          path: '/multiple-results',
          ...getLocationDataController
        }
      ])
    }
  }
}

export { multipleResults }
