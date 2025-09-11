import { routes } from './routes.js'

const notifyRegister = {
  plugin: {
    name: 'Notify Register',
    register: async (server) => {
      server.route(routes)
    }
  }
}

export { notifyRegister }
