/* eslint-disable prettier/prettier */
import { particulateMatter10Controller } from '~/src/server/particulate-matter-10/cy/controller'

const particulateMatter10Cy = {
  plugin: {
    name: 'particulate-matter-10-cy',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/llygryddion/mater-gronynnol-10/cy',
          ...particulateMatter10Controller
        }
      ])
    }
  }
}

export { particulateMatter10Cy }
