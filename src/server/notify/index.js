import { notifyController, notifyPostController } from './controller.js'
import { config } from '../../config/index.js'

const notify = {
  plugin: {
    name: 'notify-sms-subscription',
    register: async (server) => {
      const smsMobileNumberPath = config.get('notify.smsMobileNumberPath')
      server.route([
        {
          method: 'GET',
          path: smsMobileNumberPath,
          ...notifyController
        },
        {
          method: 'POST',
          path: smsMobileNumberPath,
          ...notifyPostController
        }
      ])
    }
  }
}

export { notify }
