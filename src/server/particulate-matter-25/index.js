import { particulateMatter25Controller } from './controller.js'

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
