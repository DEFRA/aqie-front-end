import { checkLocalAirController } from '~/src/server/check-local-air-quality/controller'

const checkLocalAirQuality = {
  plugin: {
    name: 'check local air quality',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/check-local-air-quality',
          ...checkLocalAirController
        }
      ])
    }
  }
}

export { checkLocalAirQuality }
