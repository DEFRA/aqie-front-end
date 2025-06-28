import { routes } from './routes.js'

const cookiesCy = {
  plugin: {
    name: 'cookiesCy',
    register: async (server) => {
      server.route(routes)
    }
  }
}

export { cookiesCy }
