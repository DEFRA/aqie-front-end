import path from 'path'
import hapi from '@hapi/hapi'

import { config } from '../config/index.js'
import { nunjucksConfig } from '../config/nunjucks/index.js'
import { router } from './router.js'
import { requestLogger } from './common/helpers/logging/request-logger.js'
import { catchAll } from './common/helpers/errors.js'
import { secureContext } from './common/helpers/secure-context/index.js'
import hapiCookie from '@hapi/cookie'
import { getCacheEngine } from './common/helpers/session-cache/cache-engine.js'
import { setupProxy } from './common/helpers/proxy/setup-proxy.js'
import { pulse } from './common/helpers/pulse.js'
import { requestTracing } from './common/helpers/request-tracing.js'
import { createLogger } from './common/helpers/logging/logger.js'

async function createServer() {
  const logger = createLogger()
  logger.info('Initializing server setup')

  try {
    setupProxy()
    logger.info('Proxy setup completed')
    logger.info(
      `Cache engine initialized: ${config.get('session.cache.engine')}`
    )

    const server = hapi.server({
      host: config.get('host'),
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
          name: config.get('session.cache.name'),
          engine: getCacheEngine(config.get('session.cache.engine'))
        }
      ],
      state: {
        strictHeader: false
      }
    })

    logger.info('Server instance created')

    const plugins = [
      requestLogger,
      hapiCookie,
      requestTracing,
      secureContext,
      pulse,
      nunjucksConfig,
      router
    ]

    for (const plugin of plugins) {
      logger.info(`Registering plugin: ${plugin.name || 'unknown'}`)
      await server.register(plugin)
    }

    logger.info('Plugins registered successfully')

    server.ext('onPreResponse', catchAll)

    logger.info('Extensions added successfully')

    return server
  } catch (error) {
    logger.error('Error during server setup', error)
    throw error
  }
}

export { createServer }
