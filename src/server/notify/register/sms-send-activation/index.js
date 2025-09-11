import {
  handleSendActivationRequest,
  handleSendActivationPost
} from './controller.js'

const sendActivation = {
  plugin: {
    name: 'notify-sms-send-activation',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/notify/register/sms-send-activation',
          handler: handleSendActivationRequest
        },
        {
          method: 'POST',
          path: '/notify/register/sms-send-activation',
          handler: handleSendActivationPost
        }
      ])
    }
  }
}

export { sendActivation }
