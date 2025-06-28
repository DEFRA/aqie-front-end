import { particulateMatter10Controller } from './controller.js'

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
