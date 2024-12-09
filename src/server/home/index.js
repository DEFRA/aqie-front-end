import { routes } from '~/src/server/home/routes'

const home = {
  plugin: {
    name: 'Check air quality',
    register: async (server) => {
      server.route(routes)
    }
  }
}

export { home }
