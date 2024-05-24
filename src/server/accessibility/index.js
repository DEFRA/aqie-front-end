import { accessibilityController } from '~/src/server/accessibility/controller'

const accessibility = {
  plugin: {
    name: 'accessibility',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/accessibility',
          ...accessibilityController
        }
      ])
    }
  }
}

export { accessibility }
