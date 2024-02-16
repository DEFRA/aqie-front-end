/* eslint-disable prettier/prettier */
import { nitrogenDioxideController } from '~/src/server/nitrogen-dioxide/controller'

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
