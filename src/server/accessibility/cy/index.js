import { routes } from './routes'

const accessibilityCy = {
  plugin: {
    name: 'accessibilityCy',
    register: async (server) => {
      server.route(routes)
    }
  }
}

export { accessibilityCy }
