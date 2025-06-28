import { routes } from '../home/routes.js'

const home = {
  plugin: {
    name: 'Check air quality',
    register: async (server) => {
      server.route(routes)
    }
  }
}

export { home }
