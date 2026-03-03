// Plugin index for confirm-alert-details (email + sms) ''
import { routes } from './routes.js'

const confirmAlertDetails = {
  name: 'confirmAlertDetailsGeneric',
  register: async (server) => {
    server.route(routes)
  }
}

export { confirmAlertDetails }
// ''
