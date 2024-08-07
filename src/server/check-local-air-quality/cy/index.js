import { checkLocalAirController } from '~/src/server/check-local-air-quality/cy/controller'

const checkLocalAirQualityCy = {
  plugin: {
    name: 'Gwirio ansawdd aer lleol',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/check-lleol-ansawdd-aer/cy',
          ...checkLocalAirController
        }
      ])
    }
  }
}

export { checkLocalAirQualityCy }
