// Routes for email confirm link callback page ''
import {
  handleEmailConfirmLinkRequest,
  handleEmailConfirmTokenRequest,
  handleEmailConfirmTokenPost
} from './controller.js'

const EMAIL_CONFIRM_TOKEN_PATH = '/notify/register/email-confirm-token'

const routes = [
  // Step 1: link from email — redirects to confirmation page without consuming token
  {
    method: 'GET',
    path: '/notify/register/email-confirm-link',
    handler: handleEmailConfirmLinkRequest,
    options: {
      description: 'Email activation link - redirects to confirmation page'
    }
  },
  // Step 2: confirmation page — user clicks button to consume token
  {
    method: 'GET',
    path: EMAIL_CONFIRM_TOKEN_PATH,
    handler: handleEmailConfirmTokenRequest,
    options: {
      description: 'Email confirmation page - renders confirm button'
    }
  },
  {
    method: 'POST',
    path: EMAIL_CONFIRM_TOKEN_PATH,
    handler: handleEmailConfirmTokenPost,
    options: {
      description: 'Email confirmation POST - validates and consumes token'
    }
  }
]

export { routes }
