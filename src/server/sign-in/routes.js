import { handleSignInGet, handleSignInPost } from './controller.js'

const routes = [
  {
    method: 'GET',
    path: '/sign-in',
    handler: handleSignInGet
  },
  {
    method: 'POST',
    path: '/sign-in',
    handler: handleSignInPost
  }
]

export { routes }
