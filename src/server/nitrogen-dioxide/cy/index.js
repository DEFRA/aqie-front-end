import { nitrogenDioxideController } from './controller.js'

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
