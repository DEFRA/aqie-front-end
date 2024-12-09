import { routes } from './routes'

const homeCy = {
  plugin: {
    name: 'Gwirio ansawdd aer',
    register: async (server) => {
      server.route(routes)
    }
  }
}

export { homeCy }
