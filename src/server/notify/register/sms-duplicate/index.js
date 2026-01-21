import { handleDuplicateSubscriptionRequest } from './controller.js'

const smsDuplicate = {
  plugin: {
    name: 'notify-sms-duplicate',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/notify/register/duplicate-subscription',
          handler: handleDuplicateSubscriptionRequest
        }
      ])
    }
  }
}

export { smsDuplicate }
