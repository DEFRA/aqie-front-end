import { privacyController } from './controller.js'

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
