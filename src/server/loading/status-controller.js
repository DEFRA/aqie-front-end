// ''
import { config } from '../../config/index.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { buildPreloaderStatusResponse } from '../common/helpers/preloader.js'

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

const getYarValue = (request, key) => request.yar?.get(key)

const getSessionStoreValue = (sessionStore, key) =>
  sessionStore ? sessionStore[key] : undefined

const getStatusValue = (sessionStore, request, sessionKey, yarKey) => {
  const sessionValue = getSessionStoreValue(sessionStore, sessionKey)
  if (sessionValue !== undefined && sessionValue !== null) {
    return sessionValue
  }

  return getYarValue(request, yarKey)
}

const buildLoadingStatusContext = (request, sessionStore) => {
  const niProcessing = getStatusValue(
    sessionStore,
    request,
    'niProcessing',
    'niProcessing'
  )
  const niError = getStatusValue(sessionStore, request, 'niError', 'niError')
  const redirectTo = getStatusValue(
    sessionStore,
    request,
    'niRedirectTo',
    'niRedirectTo'
  )
  const lang = getStatusValue(sessionStore, request, 'lang', 'lang') || 'en'
  const postcode =
    getStatusValue(sessionStore, request, 'niPostcode', 'niPostcode') || ''

  return { niProcessing, niError, redirectTo, lang, postcode }
}

const buildCompletedStatusResponse = ({ h, niError, redirectTo, postcode, lang }) => {
  const retryRedirect = `/retry?postcode=${encodeURIComponent(postcode)}&lang=${lang}`
  const defaultRedirect = '/search-location'

  if (niError) {
    logger.info(`[LOADING STATUS] Returning FAILED status with retry redirect`)
  } else if (redirectTo) {
    logger.info(
      `[LOADING STATUS] Returning COMPLETE status with redirectTo=${redirectTo}`
    )
  } else {
    logger.warn(
      `[LOADING STATUS] No processing and no redirectTo - returning FAILED with search redirect`
    )
  }

  return buildPreloaderStatusResponse({
    h,
    isProcessing: false,
    hasError: Boolean(niError),
    redirectTo,
    retryRedirect,
    defaultRedirect
  })
}

const loadingStatusController = {
  handler: async (request, h) => {
    const sessionStore = await getSessionStore(request)
    const { niProcessing, niError, redirectTo, lang, postcode } =
      buildLoadingStatusContext(request, sessionStore)

    logger.info(
      `[LOADING STATUS] Poll check: niProcessing=${niProcessing}, niError=${niError}, redirectTo=${redirectTo}, lang=${lang}, postcode=${postcode}`
    )

    // '' Check if processing is complete
    if (!niProcessing) {
      return buildCompletedStatusResponse({
        h,
        niError,
        redirectTo,
        postcode,
        lang
      })
    }

    // '' Still processing
    logger.info(`[LOADING STATUS] Still processing...`)
    return buildPreloaderStatusResponse({
      h,
      isProcessing: true,
      hasError: false
    })
  }
}

export { loadingStatusController }
