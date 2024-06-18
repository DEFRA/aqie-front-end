import { checkLocalAirController } from '~/src/server/check-local-air-quality/cy/controller'

const checkLocalAirQualityCy = {
  plugin: {
    name: 'check local air quality cy',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/check-local-air-quality/cy',
          ...checkLocalAirController
        }
      ])
    }
  }
}

export { checkLocalAirQualityCy }
