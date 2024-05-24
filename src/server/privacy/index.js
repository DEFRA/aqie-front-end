/* eslint-disable prettier/prettier */
import { privacyController } from '~/src/server/privacy/controller'

const privacy = {
  plugin: {
    name: 'privacy',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/privacy',
          ...privacyController
        }
      ])
    }
  }
}

export { privacy }
