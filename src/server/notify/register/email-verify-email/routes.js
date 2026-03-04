// Routes for email verify email page ''
import { handleEmailVerifyRequest } from './controller.js'

// '' Welsh placeholder path for email-verify-email
const EMAIL_VERIFY_EMAIL_PATH_CY = '/hysbysiad/cofrestru/ebost-dilysu'

const routes = [
  {
    method: 'GET',
    path: '/notify/register/email-verify-email',
    handler: handleEmailVerifyRequest,
    options: {
      description: 'Get email verify email page'
    }
  },
  {
    method: 'GET',
    path: EMAIL_VERIFY_EMAIL_PATH_CY,
    handler: handleEmailVerifyRequest,
    options: {
      description: 'Get email verify email page (Welsh)'
    }
  }
]

export { routes }
