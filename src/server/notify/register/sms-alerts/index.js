import { handleNotifyRequest, handleNotifyPost } from './controller.js'

const notify = {
  plugin: {
    name: 'notify-sms-alerts',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/notify/register/sms-alerts',
          handler: handleNotifyRequest
        },
        {
          method: 'POST',
          path: '/notify/register/sms-alerts',
          handler: handleNotifyPost
        }
      ])
    }
  }
}

export { notify }
