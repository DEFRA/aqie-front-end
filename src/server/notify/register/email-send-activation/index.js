import {
  handleEmailSendActivationRequest,
  handleEmailSendActivationPost
} from './controller.js'

// Welsh placeholder path for email-send-activation
const EMAIL_SEND_ACTIVATION_PATH_CY =
  '/hysbysiad/cofrestru/ebost-anfon-actifadu'

const emailSendActivation = {
  plugin: {
    name: 'notify-email-send-activation',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/notify/register/email-send-activation',
          handler: handleEmailSendActivationRequest
        },
        {
          method: 'POST',
          path: '/notify/register/email-send-activation',
          handler: handleEmailSendActivationPost
        },
        {
          method: 'GET',
          path: EMAIL_SEND_ACTIVATION_PATH_CY,
          handler: handleEmailSendActivationRequest
        },
        {
          method: 'POST',
          path: EMAIL_SEND_ACTIVATION_PATH_CY,
          handler: handleEmailSendActivationPost
        }
      ])
    }
  }
}

export { emailSendActivation }
