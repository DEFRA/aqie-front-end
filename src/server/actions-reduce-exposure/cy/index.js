import { actionsReduceExposureCyController } from './controller.js'

const actionsReduceExposureCy = {
  plugin: {
    name: 'actions reduce exposure cy',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/lleoliad/{locationId}/camau-lleihau-amlygiad/cy',
          ...actionsReduceExposureCyController
        }
      ])
    }
  }
}

export { actionsReduceExposureCy }
