import { homeController } from '~/src/server/home/cy/controller'

const homeCy = {
  plugin: {
    name: 'Gwirio ansawdd aer',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/cy',
          ...homeController
        }
      ])
    }
  }
}

export { homeCy }
