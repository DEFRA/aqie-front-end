import {
  handleUnsubscribeEmailLinkRequest,
  handleUnsubscribeEmailLinkPost
} from './controller.js'

const UNSUBSCRIBE_EMAIL_LINK_PATH = '/notify/unsubscribe-email-link'
const UNSUBSCRIBE_EMAIL_LINK_PATH_CY = '/hysbysiad/dad-danysgrifio-dolen-ebost'

const unsubscribeEmailLink = {
  plugin: {
    name: 'notify-unsubscribe-email-link',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: UNSUBSCRIBE_EMAIL_LINK_PATH,
          handler: handleUnsubscribeEmailLinkRequest
        },
        {
          method: 'POST',
          path: UNSUBSCRIBE_EMAIL_LINK_PATH,
          handler: handleUnsubscribeEmailLinkPost
        },
        {
          method: 'GET',
          path: UNSUBSCRIBE_EMAIL_LINK_PATH_CY,
          handler: handleUnsubscribeEmailLinkRequest
        },
        {
          method: 'POST',
          path: UNSUBSCRIBE_EMAIL_LINK_PATH_CY,
          handler: handleUnsubscribeEmailLinkPost
        }
      ])
    }
  }
}

export { unsubscribeEmailLink }
