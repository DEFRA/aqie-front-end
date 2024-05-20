import { cookiesController } from '~/src/server/cookies/controller'

const cookies = {
  plugin: {
    name: 'cookies',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/cookies',
          ...cookiesController
        }
      ])
    }
  }
}

export { cookies }
