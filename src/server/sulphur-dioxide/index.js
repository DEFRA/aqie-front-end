/* eslint-disable prettier/prettier */
import { sulphurDioxideController } from '~/src/server/sulphur-dioxide/controller'

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
