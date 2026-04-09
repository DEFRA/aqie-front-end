import {
  handleEmailDetailsRequest,
  handleEmailDetailsPost
} from './controller.js'

// Welsh placeholder path for email-details
const EMAIL_DETAILS_PATH_CY = '/hysbysiad/cofrestru/ebost-manylion'

const emailDetails = {
  plugin: {
    name: 'notify-email-details',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/notify/register/email-details',
          handler: handleEmailDetailsRequest
        },
        {
          method: 'POST',
          path: '/notify/register/email-details',
          handler: handleEmailDetailsPost
        },
        {
          method: 'GET',
          path: EMAIL_DETAILS_PATH_CY,
          handler: handleEmailDetailsRequest
        },
        {
          method: 'POST',
          path: EMAIL_DETAILS_PATH_CY,
          handler: handleEmailDetailsPost
        }
      ])
    }
  }
}

export { emailDetails }
