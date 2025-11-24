import { healthEffectsController } from './controller.js'

const routes = [
  {
    method: 'GET',
    path: '/health-effects',
    // Spread to include handler (and any options) from the controller object
    ...healthEffectsController
  }
]

export { routes }