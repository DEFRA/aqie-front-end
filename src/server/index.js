import path from 'path'
import hapi from '@hapi/hapi'

import { config } from '~/src/config'
import { nunjucksConfig } from '~/src/config/nunjucks'
import { router } from './router'
import { requestLogger } from '~/src/server/common/helpers/logging/request-logger'
import { catchAll } from '~/src/server/common/helpers/errors'
import { secureContext } from '~/src/server/common/helpers/secure-context'
import hapiCookie from '@hapi/cookie'
import { buildRedisClient } from '~/src/common/helpers/redis-client'
import { Engine as CatboxRedis } from '@hapi/catbox-redis'
import { Engine as CatboxMemory } from '@hapi/catbox-memory'

const isProduction = config.get('isProduction')
const redisEnabled = config.get('redis.enabled')
const cookiePassword = config.get('cookiePassword')
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
    },
    cache: [
      {
        name: 'session',
        engine: redisEnabled
          ? new CatboxRedis({
              client: buildRedisClient()
            })
          : new CatboxMemory()
      }
    ]
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
      password: cookiePassword,
      isSecure: isProduction
    },
    redirectTo: '/',
    keepAlive: true,
    validate: async (request, session) => {
      if (session.password === config.get('daqiePassword')) {
        return { isValid: true }
      } else {
        return { isValid: true }
      }
    }
  })
  server.auth.default({ strategy: 'login', mode: 'required' })

  await server.register(router)

  await server.register(nunjucksConfig)

  server.ext('onPreResponse', catchAll)

  return server
}

export { createServer }
