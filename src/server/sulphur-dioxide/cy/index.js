import { sulphurDioxideController } from './controller.js'

const sulphurDioxideCy = {
  plugin: {
    name: 'sulphur dioxide cy',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/llygryddion/sylffwr-deuocsid/cy',
          ...sulphurDioxideController
        }
      ])
    }
  }
}

export { sulphurDioxideCy }
