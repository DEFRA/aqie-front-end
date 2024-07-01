/* eslint-disable prettier/prettier */
import { ozoneController } from '~/src/server/ozone/cy/controller'

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
