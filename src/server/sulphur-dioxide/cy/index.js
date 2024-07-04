/* eslint-disable prettier/prettier */
import { sulphurDioxideController } from '~/src/server/sulphur-dioxide/cy/controller'

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
