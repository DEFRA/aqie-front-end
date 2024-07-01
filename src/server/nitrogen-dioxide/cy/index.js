/* eslint-disable prettier/prettier */
import { nitrogenDioxideController } from '~/src/server/nitrogen-dioxide/cy/controller'

const nitrogenDioxideCy = {
  plugin: {
    name: 'nitrogen dioxide cy',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/llygryddion/nitrogen-deuocsid/cy',
          ...nitrogenDioxideController
        }
      ])
    }
  }
}

export { nitrogenDioxideCy }
