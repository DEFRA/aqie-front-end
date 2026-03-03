import { handleNotifyRequest, handleNotifyPost } from './controller.js'

const notify = {
  plugin: {
    name: 'notify-sms-mobile-number',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/notify/register/sms-mobile-number',
          handler: handleNotifyRequest
        },
        {
          method: 'POST',
          path: '/notify/register/sms-mobile-number',
          handler: handleNotifyPost
        }
      ])
    }
  }
}

export { notify }
