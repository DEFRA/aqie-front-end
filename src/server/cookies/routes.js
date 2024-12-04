import { cookiesController } from '~/src/server/cookies/controller'

const routes = [
  {
    method: 'GET',
    path: '/cookies',
    ...cookiesController
  }
]

export { routes }
