import { cookiesController } from './controller.js'

const routes = [
  {
    method: 'GET',
    path: '/briwsion/cy',
    ...cookiesController
  }
]

export { routes }
