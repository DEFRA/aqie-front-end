import { nitrogenDioxideController } from './controller.js'

const nitrogenDioxide = {
  plugin: {
    name: 'nitrogen dioxide',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/pollutants/nitrogen-dioxide',
          ...nitrogenDioxideController
        }
      ])
    }
  }
}

export { nitrogenDioxide }
