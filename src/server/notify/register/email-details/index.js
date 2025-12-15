import {
  handleEmailDetailsRequest,
  handleEmailDetailsPost
} from './controller.js'

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
        }
      ])
    }
  }
}

export { emailDetails }
