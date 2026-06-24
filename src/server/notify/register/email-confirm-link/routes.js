// Routes for email confirm link callback page ''
import {
  handleEmailConfirmLinkGet,
  handleEmailConfirmLinkPost
} from './controller.js'

// Welsh placeholder path for email-confirm-link
const EMAIL_CONFIRM_LINK_PATH_CY = '/hysbysiad/cofrestru/ebost-cadarnhau-dolen'

const routes = [
  {
    method: 'GET',
    path: '/notify/register/email-confirm-link',
    handler: handleEmailConfirmLinkGet,
    options: {
      description:
        'Email activation link landing page - shows confirmation button'
    }
  },
  {
    method: 'POST',
    path: '/notify/register/email-confirm-link',
    handler: handleEmailConfirmLinkPost,
    options: {
      description:
        'Email activation link confirmation - validates token and redirects to success'
    }
  },
  {
    method: 'GET',
    path: EMAIL_CONFIRM_LINK_PATH_CY,
    handler: handleEmailConfirmLinkGet,
    options: {
      description:
        'Email activation link landing page - shows confirmation button (Welsh)'
    }
  },
  {
    method: 'POST',
    path: EMAIL_CONFIRM_LINK_PATH_CY,
    handler: handleEmailConfirmLinkPost,
    options: {
      description:
        'Email activation link confirmation - validates token and redirects to success (Welsh)'
    }
  }
]

export { routes }
