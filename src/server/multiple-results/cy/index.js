import { getLocationDataController } from '~/src/server/multiple-results/cy/controller'

const multipleResultsCy = {
  plugin: {
    name: 'canlyniadau lluosog',
    register: async (server) => {
      server.route([
        {
          method: ['GET'],
          path: '/canlyniadau-lluosog/cy',
          ...getLocationDataController
        }
      ])
    }
  }
}

export { multipleResultsCy }
