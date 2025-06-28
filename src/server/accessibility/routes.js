import { accessibilityController } from './controller.js'

const routes = [
  {
    method: 'GET',
    path: '/accessibility',
    ...accessibilityController
  }
]

export { routes }
