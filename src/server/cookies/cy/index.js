import { cookiesController } from '~/src/server/cookies/cy/controller'

const cookiesCy = {
  plugin: {
    name: 'cookiesCy',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/briwsion/cy',
          ...cookiesController,
          options: { auth: { mode: 'try' } }
        }
      ])
    }
  }
}

export { cookiesCy }
