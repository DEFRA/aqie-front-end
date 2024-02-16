/* eslint-disable prettier/prettier */
import { particulateMatter10Controller } from '~/src/server/particulate-matter-10/controller'

const particulateMatter10 = {
  plugin: {
    name: 'particulate-matter-10',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/pollutants/particulate-matter-10',
          ...particulateMatter10Controller
        }
      ])
    }
  }
}

export { particulateMatter10 }
