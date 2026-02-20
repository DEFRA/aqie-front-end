// Routes for email confirm link callback page ''
import { handleEmailConfirmLinkRequest } from './controller.js'

const routes = [
  {
    method: 'GET',
    path: '/notify/register/email-confirm-link',
    handler: handleEmailConfirmLinkRequest,
    options: {
      description:
        'Email activation link callback - validates token and redirects to success'
    }
  }
]

export { routes }
