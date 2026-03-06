import {
  handleConfirmAlertDetailsRequest,
  handleConfirmAlertDetailsPost
} from './controller.js'

// '' Welsh placeholder path for sms-confirm-details
const SMS_CONFIRM_DETAILS_PATH_CY =
  '/hysbysiad/cofrestru/sms-cadarnhau-manylion'

const confirmAlertDetails = {
  plugin: {
    name: 'notify-sms-confirm-details',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/notify/register/sms-confirm-details',
          handler: handleConfirmAlertDetailsRequest
        },
        {
          method: 'POST',
          path: '/notify/register/sms-confirm-details',
          handler: handleConfirmAlertDetailsPost
        },
        {
          method: 'GET',
          path: SMS_CONFIRM_DETAILS_PATH_CY,
          handler: handleConfirmAlertDetailsRequest
        },
        {
          method: 'POST',
          path: SMS_CONFIRM_DETAILS_PATH_CY,
          handler: handleConfirmAlertDetailsPost
        }
      ])
    }
  }
}

export { confirmAlertDetails }
