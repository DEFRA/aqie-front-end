import { accessibilityController } from './controller.js'

const routes = [
  {
    method: 'GET',
    path: '/hygyrchedd/cy',
    ...accessibilityController
  }
]

export { routes }
