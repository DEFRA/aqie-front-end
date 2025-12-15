import {
  handleEmailSendActivationRequest,
  handleEmailSendActivationPost
} from './controller.js'

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
        }
      ])
    }
  }
}

export { emailSendActivation }
