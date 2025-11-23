import { actionsReduceExposureController } from './controller.js'

const actionsReduceExposure = {
  plugin: {
    name: 'actions reduce exposure',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/location/{locationId}/actions-reduce-exposure',
          ...actionsReduceExposureController
        }
      ])
    }
  }
}

export { actionsReduceExposure }
