import path from 'node:path'
import hapi from '@hapi/hapi'

import { config } from '../config/index.js'
import { nunjucksConfig } from '../config/nunjucks/index.js'
import { router } from './router.js'
import { requestLogger } from './common/helpers/logging/request-logger.js'
import { catchAll } from './common/helpers/errors.js'
// JavaScript detection middleware is now handled by the plugin
import { secureContext } from './common/helpers/secure-context/index.js'
import hapiCookie from '@hapi/cookie'
import { getCacheEngine } from './common/helpers/session-cache/cache-engine.js'
import { sessionCache } from './common/helpers/session-cache/session-cache.js'
import { setupProxy } from './common/helpers/proxy/setup-proxy.js'
import { pulse } from './common/helpers/pulse.js'
import { requestTracing } from './common/helpers/request-tracing.js'
import { createLogger } from './common/helpers/logging/logger.js'
import { locationNotFoundCy } from './location-not-found/cy/index.js'

async function createServer() {
  const logger = createLogger()
  logger.info('Initializing server setup')

  try {
    setupProxy()
    logger.info('Proxy setup completed')
    const server = hapi.server({
      port: config.get('port'),
      host: config.get('host'),
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
      requestTracing,
      secureContext,
      pulse,
      sessionCache,
      hapiCookie,
      nunjucksConfig,
      router,
      locationNotFoundCy
    ]

    for (const plugin of plugins) {
      const pluginName =
        plugin.name ||
        plugin.plugin?.name ||
        plugin.plugin?.plugin?.pkg?.name ||
        'CustomPluginName'
      logger.info(`Registering plugin 1: ${pluginName}`)
      await server.register(plugin)
    }

    logger.info('Plugins registered successfully')

    // Register global middleware (jsDetectionMiddleware is now handled by the plugin)
    server.ext('onPreResponse', catchAll)

    logger.info('Extensions added successfully')

    return server
  } catch (error) {
    logger.error('Error during server setup', error)
    throw error
  }
}

export { createServer }
