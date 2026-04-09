// Route definition for SMS max alerts page ''
import { handleSmsMaxAlertsRequest } from './controller.js'
import { config } from '../../../../config/index.js'

// Welsh placeholder path for sms-max-emails
const SMS_MAX_EMAILS_PATH_CY = '/hysbysiad/cofrestru/sms-uchafswm'

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
        },
        {
          method: 'GET',
          path: SMS_MAX_EMAILS_PATH_CY,
          handler: handleSmsMaxAlertsRequest
        }
      ])
    }
  }
}

export { smsMaxEmails }
