import { ozoneController } from './controller.js'

const ozoneCy = {
  plugin: {
    name: 'ozone-cy',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/llygryddion/oson/cy',
          ...ozoneController
        }
      ])
    }
  }
}

export { ozoneCy }
