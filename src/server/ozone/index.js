/* eslint-disable prettier/prettier */
import { ozoneController } from '~/src/server/ozone/controller'

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
