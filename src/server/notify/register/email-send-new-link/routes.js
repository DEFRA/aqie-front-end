// Routes for Email send new link page ''
import {
  handleEmailSendNewLinkRequest,
  handleEmailSendNewLinkPost
} from './controller.js'

// Welsh placeholder path for email-send-new-link
const EMAIL_SEND_NEW_LINK_PATH_CY =
  '/hysbysiad/cofrestru/ebost-anfon-dolen-newydd'

const routes = [
  {
    method: 'GET',
    path: '/notify/register/email-send-new-link',
    handler: handleEmailSendNewLinkRequest,
    options: {
      description: 'Get email send new link page'
    }
  },
  {
    method: 'POST',
    path: '/notify/register/email-send-new-link',
    handler: handleEmailSendNewLinkPost,
    options: {
      description: 'Post email send new link page'
    }
  },
  {
    method: 'GET',
    path: EMAIL_SEND_NEW_LINK_PATH_CY,
    handler: handleEmailSendNewLinkRequest,
    options: {
      description: 'Get email send new link page (Welsh)'
    }
  },
  {
    method: 'POST',
    path: EMAIL_SEND_NEW_LINK_PATH_CY,
    handler: handleEmailSendNewLinkPost,
    options: {
      description: 'Post email send new link page (Welsh)'
    }
  }
]

export { routes }
