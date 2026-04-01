// Plugin for Email send new link page ''
import { routes } from './routes.js'

const emailSendNewLink = {
  plugin: {
    name: 'notify-email-send-new-link',
    register: async (server) => {
      server.route(routes)
    }
  }
}

export { emailSendNewLink }
