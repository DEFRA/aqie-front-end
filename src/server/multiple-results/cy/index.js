import { getLocationDataController } from './controller.js'

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
