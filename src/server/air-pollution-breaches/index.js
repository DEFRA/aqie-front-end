import { airPollutionBreachesController } from './controller.js'

const airPollutionBreaches = {
  plugin: {
    name: 'airPollutionBreaches',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/air-pollution-breaches',
          ...airPollutionBreachesController
        }
      ])
    }
  }
}

export { airPollutionBreaches }
