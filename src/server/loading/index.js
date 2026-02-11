import { loadingController } from './controller.js'

// ''

const configureRoutes = (server) => {
  server.route([
    {
      method: ['GET', 'POST'],
      path: '/loading',
      ...loadingController
    }
  ])
}

const loading = {
  plugin: {
    name: 'loading',
    register: async (server) => {
      configureRoutes(server)
    }
  }
}

export { loading, configureRoutes }
