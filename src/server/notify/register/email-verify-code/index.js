import {
  handleEmailVerifyCodeRequest,
  handleEmailVerifyCodePost
} from './controller.js'

const emailVerifyCode = {
  plugin: {
    name: 'notify-email-verify-code',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/notify/register/email-verify-code',
          handler: handleEmailVerifyCodeRequest
        },
        {
          method: 'POST',
          path: '/notify/register/email-verify-code',
          handler: handleEmailVerifyCodePost
        }
      ])
    }
  }
}

export { emailVerifyCode }
