import { routes } from './routes'

const accessibility = {
  plugin: {
    name: 'accessibility',
    register: async (server) => {
      server.route(routes)
    }
  }
}

export { accessibility }
