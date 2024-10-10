import { homeController, loginController } from '~/src/server/home/controller'

const home = {
  plugin: {
    name: 'home',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/',
          ...homeController
          // options: { auth: { mode: 'try' } }
        },
        {
          method: 'POST',
          path: '/',
          ...loginController
          // options: { auth: { mode: 'try' } }
        }
      ])
    }
  }
}

export { home }
