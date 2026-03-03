import { checkMaxAlertsController } from './controller.js'

const checkMaxAlerts = {
  plugin: {
    name: 'check-max-alerts',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/notify/register/check-max-alerts',
          ...checkMaxAlertsController
        }
      ])
    }
  }
}

export { checkMaxAlerts }
