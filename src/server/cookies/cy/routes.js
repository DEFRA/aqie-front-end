import { cookiesController } from '~/src/server/cookies/cy/controller'

const routes = [
  {
    method: 'GET',
    path: '/briwsion/cy',
    ...cookiesController
  }
]

export { routes }
