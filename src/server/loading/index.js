import { loadingController } from './controller.js'
import { loadingStatusController } from './status-controller.js'

// ''

const configureRoutes = (server) => {
  server.route([
    {
      method: 'GET',
      path: '/loading',
      ...loadingController
    },
    {
      method: 'GET',
      path: '/loading-status',
      ...loadingStatusController
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
