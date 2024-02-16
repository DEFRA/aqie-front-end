/* eslint-disable prettier/prettier */
import { particulateMatter25Controller } from '~/src/server/particulate-matter-25/controller'

const particulateMatter25 = {
  plugin: {
    name: 'particulate matter 25',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/pollutants/particulate-matter-25',
          ...particulateMatter25Controller
        }
      ])
    }
  }
}

export { particulateMatter25 }
