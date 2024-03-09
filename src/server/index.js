import path from 'path'
import hapi from '@hapi/hapi'

import { config } from '~/src/config'
import { nunjucksConfig } from '~/src/config/nunjucks'
import { router } from './router'
import { requestLogger } from '~/src/server/common/helpers/logging/request-logger'
import { catchAll } from '~/src/server/common/helpers/errors'
import { secureContext } from '~/src/server/common/helpers/secure-context'
import hapiCookie from '@hapi/cookie'
import 'dotenv/config'
// eslint-disable-next-line no-console
console.log('PROCESS ENV ', process.env)
const isProduction = config.get('isProduction')

async function createServer() {
  const server = hapi.server({
    port: config.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      },
      files: {
        relativeTo: path.resolve(config.get('root'), '.public')
      },
      security: {
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false
        },
        xss: 'enabled',
        noSniff: true,
        xframe: true
      }
    },
    router: {
      stripTrailingSlash: true
    }
  })

  if (isProduction) {
    await server.register(secureContext)
  }

  await server.register(requestLogger)

  await server.register([hapiCookie])

  server.auth.strategy('login', 'cookie', {
    cookie: {
      name: 'airaqie-cookie',
      path: '/',
      password: 'super-secure-cookie-pass-at-least-32chars',
      isSecure: isProduction
    },
    redirectTo: '/aqie-front-end',
    keepAlive: true,
    validate: async (request, session) => {
      if (session.password === 'n1tr0g3n') {
        return { isValid: true }
      } else {
        return { isValid: true }
      }
    }
  })
  server.auth.default({ strategy: 'login', mode: 'required' })

  await server.register(router, {
    routes: { prefix: config.get('appPathPrefix') }
  })

  await server.register(nunjucksConfig)

  server.ext('onPreResponse', catchAll)

  return server
}

export { createServer }
