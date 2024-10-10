/* eslint-disable prettier/prettier */
import { privacyController } from '~/src/server/privacy/cy/controller'

const privacyCy = {
  plugin: {
    name: 'privacyCy',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/preifatrwydd/cy',
          ...privacyController
          // options: { auth: { mode: 'try' } }
        }
      ])
    }
  }
}

export { privacyCy }
