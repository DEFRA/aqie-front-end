import { handleEmailDuplicateRequest } from './controller.js'
import { config } from '../../../../config/index.js'

// '' Welsh placeholder path for email-duplicate
const EMAIL_DUPLICATE_PATH_CY = '/hysbysiad/cofrestru/ebost-dyblyg'

const emailDuplicate = {
  plugin: {
    name: 'notify-email-duplicate',
    register: async (server) => {
      const emailDuplicatePath = config.get('notify.emailDuplicatePath')
      server.route([
        {
          method: 'GET',
          path: emailDuplicatePath,
          handler: handleEmailDuplicateRequest
        },
        {
          method: 'GET',
          path: EMAIL_DUPLICATE_PATH_CY,
          handler: handleEmailDuplicateRequest
        }
      ])
    }
  }
}

export { emailDuplicate }
