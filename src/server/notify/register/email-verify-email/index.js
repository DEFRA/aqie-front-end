// Plugin for email verify email page ''
import { routes } from './routes.js'

const emailVerifyEmail = {
  plugin: {
    name: 'notify-email-verify-email',
    register: async (server) => {
      server.route(routes)
    }
  }
}

export { emailVerifyEmail }
