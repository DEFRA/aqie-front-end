import { airPollutionBreachesCyController } from '../controller.js'

const airPollutionBreachesCy = {
  plugin: {
    name: 'airPollutionBreachesCy',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/torriadau-llygredd-aer/cy',
          ...airPollutionBreachesCyController
        }
      ])
    }
  }
}

export { airPollutionBreachesCy }
