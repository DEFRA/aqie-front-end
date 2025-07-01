import { routes } from './routes.js'

const accessibilityCy = {
  plugin: {
    name: 'accessibilityCy',
    register: async (server) => {
      server.route(routes)
    }
  }
}

export { accessibilityCy }
