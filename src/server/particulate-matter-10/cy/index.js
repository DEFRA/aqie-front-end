import { particulateMatter10Controller } from './controller.js'

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
