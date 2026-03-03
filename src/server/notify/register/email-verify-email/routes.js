// Routes for email verify email page ''
import { handleEmailVerifyRequest } from './controller.js'

const routes = [
  {
    method: 'GET',
    path: '/notify/register/email-verify-email',
    handler: handleEmailVerifyRequest,
    options: {
      description: 'Get email verify email page'
    }
  }
]

export { routes }
