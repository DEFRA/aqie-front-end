import { particulateMatter25Controller } from './controller.js'

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
