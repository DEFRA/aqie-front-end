import { accessibilityController } from '~/src/server/accessibility/controller'

const routes = [
  {
    method: 'GET',
    path: '/accessibility',
    ...accessibilityController
  }
]

export { routes }
