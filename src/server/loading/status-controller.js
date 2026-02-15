// ''
import { STATUS_OK } from '../data/constants.js'
import { config } from '../../config/index.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

const SESSION_CACHE_SEGMENT = '!@hapi/yar'
let sessionCachePolicy

const getSessionCachePolicy = (server) => {
  if (sessionCachePolicy) {
    return sessionCachePolicy
  }

  const sessionCacheName = config.get('session.cache.name')
  sessionCachePolicy = server.cache({
    cache: sessionCacheName,
    segment: SESSION_CACHE_SEGMENT,
    shared: true,
    expiresIn: config.get('session.cache.ttl')
  })

  return sessionCachePolicy
}

const getSessionStore = async (request) => {
  const sessionCacheName = config.get('session.cache.name')
  const sessionCookie = request.state?.[sessionCacheName]
  const sessionId = sessionCookie?.id

  if (!sessionId) {
    return null
  }

  try {
    const cachePolicy = getSessionCachePolicy(request.server)
    return await cachePolicy.get(sessionId)
  } catch (error) {
    logger.warn(`[LOADING STATUS] Cache read failed: ${error.message}`)
    return null
  }
}

const loadingStatusController = {
  handler: async (request, h) => {
    const sessionStore = await getSessionStore(request)

    const niProcessing =
      sessionStore?.niProcessing ?? request.yar?.get('niProcessing')
    const niError = sessionStore?.niError ?? request.yar?.get('niError')
    const redirectTo =
      sessionStore?.niRedirectTo ?? request.yar?.get('niRedirectTo')
    const lang = (sessionStore?.lang ?? request.yar?.get('lang')) || 'en'
    const postcode =
      (sessionStore?.niPostcode ?? request.yar?.get('niPostcode')) || ''

    logger.info(
      `[LOADING STATUS] Poll check: niProcessing=${niProcessing}, niError=${niError}, redirectTo=${redirectTo}, lang=${lang}, postcode=${postcode}`
    )

    // '' Check if processing is complete
    if (!niProcessing) {
      if (niError) {
        // '' Failed - redirect to retry page
        const postcode =
          (sessionStore?.niPostcode ?? request.yar?.get('niPostcode')) || ''
        const lang = (sessionStore?.lang ?? request.yar?.get('lang')) || 'en'
        logger.info(
          `[LOADING STATUS] Returning FAILED status with retry redirect`
        )
        return h
          .response({
            status: 'failed',
            redirectTo: `/retry?postcode=${encodeURIComponent(postcode)}&lang=${lang}`
          })
          .code(STATUS_OK)
      }

      if (redirectTo) {
        // '' Success - redirect to results
        logger.info(
          `[LOADING STATUS] Returning COMPLETE status with redirectTo=${redirectTo}`
        )
        return h
          .response({
            status: 'complete',
            redirectTo
          })
          .code(STATUS_OK)
      }

      // '' No active processing, redirect to search
      logger.warn(
        `[LOADING STATUS] No processing and no redirectTo - returning FAILED with search redirect`
      )
      return h
        .response({
          status: 'failed',
          redirectTo: '/search-location'
        })
        .code(STATUS_OK)
    }

    // '' Still processing
    logger.info(`[LOADING STATUS] Still processing...`)
    return h
      .response({
        status: 'processing'
      })
      .code(STATUS_OK)
  }
}

export { loadingStatusController }
