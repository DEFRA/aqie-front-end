import {
  handleAlertsSuccessRequest,
  handleAlertsSuccessPost
} from './controller.js'

const alertsSuccess = {
  plugin: {
    name: 'notify-sms-success',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/notify/register/sms-success',
          handler: handleAlertsSuccessRequest
        },
        {
          method: 'POST',
          path: '/notify/register/sms-success',
          handler: handleAlertsSuccessPost
        }
      ])
    }
  }
}

export { alertsSuccess }
