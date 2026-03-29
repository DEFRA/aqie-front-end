import { handleUnsubscribeKeepAlertsRequest } from './controller.js'

const UNSUBSCRIBE_KEEP_ALERTS_PATH = '/notify/unsubscribe-keep-alerts'
const UNSUBSCRIBE_KEEP_ALERTS_PATH_CY = '/hysbysiad/cadw-hysbysiadau-ebost'

const unsubscribeKeepAlerts = {
  plugin: {
    name: 'notify-unsubscribe-keep-alerts',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: UNSUBSCRIBE_KEEP_ALERTS_PATH,
          handler: handleUnsubscribeKeepAlertsRequest
        },
        {
          method: 'GET',
          path: UNSUBSCRIBE_KEEP_ALERTS_PATH_CY,
          handler: handleUnsubscribeKeepAlertsRequest
        }
      ])
    }
  }
}

export { unsubscribeKeepAlerts }
