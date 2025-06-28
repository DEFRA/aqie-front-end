import { sulphurDioxideController } from './controller.js'

const sulphurDioxide = {
  plugin: {
    name: 'sulphur dioxide',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/pollutants/sulphur-dioxide',
          ...sulphurDioxideController
        }
      ])
    }
  }
}

export { sulphurDioxide }
