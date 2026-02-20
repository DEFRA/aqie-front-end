import { handleEmailDuplicateRequest } from './controller.js'
import { config } from '../../../../config/index.js'

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
        }
      ])
    }
  }
}

export { emailDuplicate }
