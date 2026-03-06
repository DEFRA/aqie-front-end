import {
  handleSendActivationRequest,
  handleSendActivationPost
} from './controller.js'

// '' Welsh placeholder path for sms-send-activation
const SMS_SEND_ACTIVATION_PATH_CY =
  '/hysbysiad/cofrestru/sms-anfon-cod-actifadu'

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
        },
        {
          method: 'GET',
          path: SMS_SEND_ACTIVATION_PATH_CY,
          handler: handleSendActivationRequest
        },
        {
          method: 'POST',
          path: SMS_SEND_ACTIVATION_PATH_CY,
          handler: handleSendActivationPost
        }
      ])
    }
  }
}

export { sendActivation }
