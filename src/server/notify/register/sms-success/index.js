import {
  handleAlertsSuccessRequest,
  handleAlertsSuccessPost
} from './controller.js'

// '' Welsh placeholder path for sms-success
const SMS_SUCCESS_PATH_CY = '/hysbysiad/cofrestru/sms-llwyddiant'

const alertsSuccess = {
  plugin: {
    name: 'notify-sms-success',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/notify/register/sms-success',
          handler: handleAlertsSuccessRequest
        },
        {
          method: 'POST',
          path: '/notify/register/sms-success',
          handler: handleAlertsSuccessPost
        },
        {
          method: 'GET',
          path: SMS_SUCCESS_PATH_CY,
          handler: handleAlertsSuccessRequest
        },
        {
          method: 'POST',
          path: SMS_SUCCESS_PATH_CY,
          handler: handleAlertsSuccessPost
        }
      ])
    }
  }
}

export { alertsSuccess }
