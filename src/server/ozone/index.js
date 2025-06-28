import { ozoneController } from './controller.js'

const ozone = {
  plugin: {
    name: 'ozone',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/pollutants/ozone',
          ...ozoneController
        }
      ])
    }
  }
}

export { ozone }
