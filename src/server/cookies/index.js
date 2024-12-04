import { routes } from './routes'

const cookies = {
  plugin: {
    name: 'cookies',
    register: async (server) => {
      server.route(routes)
    }
  }
}

export { cookies }
