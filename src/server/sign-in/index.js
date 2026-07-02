import { routes } from './routes.js'

const signIn = {
  plugin: {
    name: 'sign-in',
    register: (server) => {
      server.route(routes)
    }
  }
}

export { signIn }
