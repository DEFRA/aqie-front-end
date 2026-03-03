// Plugin for SMS send new code page ''
import { routes } from './routes.js'

const sendNewCode = {
  plugin: {
    name: 'notify-sms-send-new-code',
    register: async (server) => {
      server.route(routes)
    }
  }
}

export { sendNewCode }
