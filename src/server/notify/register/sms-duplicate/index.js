import { handleDuplicateSubscriptionRequest } from './controller.js'
import { config } from '../../../../config/index.js'

const smsDuplicate = {
  plugin: {
    name: 'notify-sms-duplicate',
    register: async (server) => {
      const duplicateSubscriptionPath = config.get(
        'notify.duplicateSubscriptionPath'
      )
      server.route([
        {
          method: 'GET',
          path: duplicateSubscriptionPath,
          handler: handleDuplicateSubscriptionRequest
        }
      ])
    }
  }
}

export { smsDuplicate }
