import { handleDuplicateSubscriptionRequest } from './controller.js'
import { config } from '../../../../config/index.js'

// Welsh placeholder path for sms-duplicate
const SMS_DUPLICATE_PATH_CY = '/hysbysiad/cofrestru/sms-dyblyg'

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
        },
        {
          method: 'GET',
          path: SMS_DUPLICATE_PATH_CY,
          handler: handleDuplicateSubscriptionRequest
        }
      ])
    }
  }
}

export { smsDuplicate }
