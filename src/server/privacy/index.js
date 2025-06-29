import { privacyController } from './controller.js'

const privacy = {
  plugin: {
    name: 'privacy',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/privacy',
          ...privacyController
          // options: { auth: { mode: 'try' } }
        }
      ])
    }
  }
}

export { privacy }
