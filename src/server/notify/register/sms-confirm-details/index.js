import {
  handleConfirmAlertDetailsRequest,
  handleConfirmAlertDetailsPost
} from './controller.js'

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
        }
      ])
    }
  }
}

export { confirmAlertDetails }
