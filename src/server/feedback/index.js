/* eslint-disable prettier/prettier */
import { feedbackController } from '~/src/server/feedback/controller'

const feedback = {
  plugin: {
    name: 'feedback',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/feedback',
          ...feedbackController
        }
      ])
    }
  }
}

export { feedback }
