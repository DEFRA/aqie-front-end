import { homeController } from '~/src/server/home/controller'

const home = {
  plugin: {
    name: 'Check local air quality',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/',
          ...homeController
        }
      ])
    }
  }
}

export { home }
