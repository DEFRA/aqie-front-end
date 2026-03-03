// Plugin for email confirm link callback page ''
import { routes } from './routes.js'

const emailConfirmLink = {
  plugin: {
    name: 'notify-email-confirm-link',
    register: async (server) => {
      server.route(routes)
    }
  }
}

export { emailConfirmLink }
