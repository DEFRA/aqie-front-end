// Routes for email confirm link callback page ''
import { handleEmailConfirmLinkRequest } from './controller.js'

// Welsh placeholder path for email-confirm-link
const EMAIL_CONFIRM_LINK_PATH_CY = '/hysbysiad/cofrestru/ebost-cadarnhau-dolen'

const routes = [
  {
    method: 'GET',
    path: '/notify/register/email-confirm-link',
    handler: handleEmailConfirmLinkRequest,
    options: {
      description:
        'Email activation link callback - validates token and redirects to success'
    }
  },
  {
    method: 'GET',
    path: EMAIL_CONFIRM_LINK_PATH_CY,
    handler: handleEmailConfirmLinkRequest,
    options: {
      description: 'Email activation link callback - Welsh'
    }
  }
]

export { routes }
