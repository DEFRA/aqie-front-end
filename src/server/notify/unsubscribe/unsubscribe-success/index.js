import { handleUnsubscribeSuccessRequest } from './controller.js'

const UNSUBSCRIBE_SUCCESS_PATH = '/notify/unsubscribe-success'
const UNSUBSCRIBE_SUCCESS_PATH_CY = '/hysbysiad/dad-danysgrifio-llwyddiant'

const unsubscribeSuccess = {
  plugin: {
    name: 'notify-unsubscribe-success',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: UNSUBSCRIBE_SUCCESS_PATH,
          handler: handleUnsubscribeSuccessRequest
        },
        {
          method: 'GET',
          path: UNSUBSCRIBE_SUCCESS_PATH_CY,
          handler: handleUnsubscribeSuccessRequest
        }
      ])
    }
  }
}

export { unsubscribeSuccess }
