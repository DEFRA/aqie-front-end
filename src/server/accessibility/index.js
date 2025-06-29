import { routes } from './routes.js'

const accessibility = {
  plugin: {
    name: 'accessibility',
    register: async (server) => {
      server.route(routes)
    }
  }
}

export { accessibility }
