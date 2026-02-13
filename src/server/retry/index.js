import { retryController } from './controller.js'

// ''

const configureRoutes = (server) => {
  server.route([
    {
      method: ['GET', 'POST'],
      path: '/retry',
      ...retryController
    }
  ])
}

const retry = {
  plugin: {
    name: 'retry',
    register: async (server) => {
      configureRoutes(server)
    }
  }
}

export { retry, configureRoutes }
