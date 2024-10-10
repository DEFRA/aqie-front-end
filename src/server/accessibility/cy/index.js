import { accessibilityController } from '~/src/server/accessibility/cy/controller'

const accessibilityCy = {
  plugin: {
    name: 'accessibilityCy',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/hygyrchedd/cy',
          ...accessibilityController
          // options: { auth: { mode: 'try' } }
        }
      ])
    }
  }
}

export { accessibilityCy }
