import { getLocationDataController } from './controller.js'

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
