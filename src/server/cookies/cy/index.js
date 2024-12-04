import { routes } from './routes'

const cookiesCy = {
  plugin: {
    name: 'cookiesCy',
    register: async (server) => {
      server.route(routes)
    }
  }
}

export { cookiesCy }
