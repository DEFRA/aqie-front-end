// Route definition for SMS max alerts page ''
import { handleSmsMaxAlertsRequest } from './controller.js'
import { config } from '../../../../config/index.js'

const smsMaxEmails = {
  plugin: {
    name: 'notify-sms-max-emails',
    register: async (server) => {
      const smsMaxAlertsPath = config.get('notify.smsMaxAlertsPath')
      server.route([
        {
          method: 'GET',
          path: smsMaxAlertsPath,
          handler: handleSmsMaxAlertsRequest
        }
      ])
    }
  }
}

export { smsMaxEmails }
