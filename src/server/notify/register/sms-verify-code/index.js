// Plugin for SMS verify code page ''
import { routes } from './routes.js'

const checkMessage = {
  plugin: {
    name: 'notify-sms-verify-code',
    register: async (server) => {
      server.route(routes)
    }
  }
}

export { checkMessage }
