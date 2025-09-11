import { notifyController, notifyPostController } from './controller.js'

const notify = {
  plugin: {
    name: 'notify-sms-subscription',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/notify/register/sms-mobile-number',
          ...notifyController
        },
        {
          method: 'POST',
          path: '/notify/register/sms-mobile-number',
          ...notifyPostController
        }
      ])
    }
  }
}

export { notify }
