/* eslint-disable prettier/prettier */
import { particulateMatter25Controller } from '~/src/server/particulate-matter-25/cy/controller'

const particulateMatter25Cy = {
  plugin: {
    name: 'particulate matter 25 cy',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/llygryddion/mater-gronynnol-25/cy',
          ...particulateMatter25Controller
        }
      ])
    }
  }
}

export { particulateMatter25Cy }
