import path from 'node:path'
import hapi from '@hapi/hapi'
import { config } from '../config/index.js'
import { nunjucksConfig } from '../config/nunjucks/index.js'
import { router } from './router.js'
import { kpiTracker } from './common/helpers/kpi-tracker.js'
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
import { registerServerCachePolicies } from './common/helpers/server-cache-policies.js'
import { locationNotFoundCy } from './location-not-found/cy/index.js'

function signInGateHandler(excludedPaths) {
  return function handleSignInGate(request, h) {
    const isExcluded = excludedPaths.some((p) => request.path.startsWith(p))
    if (!isExcluded && !request.yar.get('authenticated')) {
      const destination = request.path + (request.url.search || '')
      request.yar.set('signInRedirectTo', destination)
      return h.redirect('/sign-in').takeover()
    }
    return h.continue
  }
}

function buildCacheProviders(cacheEngine, sessionCacheName) {
  const cacheProviders = [{ name: sessionCacheName, engine: cacheEngine }]
  if (sessionCacheName !== 'serverCache') {
    cacheProviders.push({ name: 'serverCache', engine: cacheEngine })
  }
  return cacheProviders
}

function buildServerOptions(cacheProviders) {
  return {
    port: config.get('port'),
    host: config.get('host'),
    routes: {
      validate: { options: { abortEarly: false } },
      files: { relativeTo: path.resolve(config.get('root'), '.public') },
      security: {
        hsts: { maxAge: 31536000, includeSubDomains: true, preload: false },
        xss: 'enabled',
        noSniff: true,
        xframe: true
      }
    },
    router: { stripTrailingSlash: true },
    cache: cacheProviders,
    state: { strictHeader: false }
  }
}

async function registerPlugins(server) {
  const plugins = [
    kpiTracker,
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
    await server.register(plugin)
  }
}

function registerSignInGate(server) {
  if (config.get('env') === 'test') return
  const SIGN_IN_EXCLUDED = ['/sign-in', '/health', '/public/', '/.well-known/']
  server.ext('onPreHandler', signInGateHandler(SIGN_IN_EXCLUDED))
}

async function createServer() {
  const logger = createLogger()
  try {
    setupProxy()
    const cacheEngine = getCacheEngine(config.get('session.cache.engine'))
    const sessionCacheName = config.get('session.cache.name')
    const cacheProviders = buildCacheProviders(cacheEngine, sessionCacheName)
    const server = hapi.server(buildServerOptions(cacheProviders))
    registerServerCachePolicies(server)
    await registerPlugins(server)
    registerSignInGate(server)
    server.ext('onPreResponse', catchAll)
    return server
  } catch (error) {
    logger.error('Error during server setup', error)
    throw error
  }
}

export { createServer, signInGateHandler }
