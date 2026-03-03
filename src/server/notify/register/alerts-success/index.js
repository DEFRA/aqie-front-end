// Plugin index for alerts-success (email) ''
import { routes } from './routes.js'

const alertsSuccess = {
  name: 'alertsSuccessEmail',
  register: async (server) => {
    server.route(routes)
  }
}

export { alertsSuccess }
// ''
