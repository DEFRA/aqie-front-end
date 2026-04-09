import { handleNotifyRequest, handleNotifyPost } from './controller.js'

// Welsh placeholder path for sms-mobile-number
const SMS_MOBILE_NUMBER_PATH_CY = '/hysbysiad/cofrestru/sms-rhif-ffon'

const notify = {
  plugin: {
    name: 'notify-sms-mobile-number',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/notify/register/sms-mobile-number',
          handler: handleNotifyRequest
        },
        {
          method: 'POST',
          path: '/notify/register/sms-mobile-number',
          handler: handleNotifyPost
        },
        {
          method: 'GET',
          path: SMS_MOBILE_NUMBER_PATH_CY,
          handler: handleNotifyRequest
        },
        {
          method: 'POST',
          path: SMS_MOBILE_NUMBER_PATH_CY,
          handler: handleNotifyPost
        }
      ])
    }
  }
}

export { notify }
