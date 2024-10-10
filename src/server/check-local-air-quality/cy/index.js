import { checkLocalAirController } from '~/src/server/check-local-air-quality/cy/controller'

const checkLocalAirQualityCy = {
  plugin: {
    name: 'Gwirio ansawdd aer lleol',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/cy',
          ...checkLocalAirController
        }
      ])
    }
  }
}

export { checkLocalAirQualityCy }
