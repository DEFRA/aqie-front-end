import { fetchData } from './helpers/fetch-data.js'
import { english, calendarEnglish } from '../data/en/en.js'
import { calendarWelsh } from '../data/cy/cy.js'
import { transformKeys } from './helpers/transform-summary-keys.js'
import {
  getFormattedDateSummary,
  getLanguageDates,
  getIssueTime,
  isSummaryDateToday
} from './helpers/middleware-helpers.js'
import {
  LANG_EN,
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI,
  LOCATION_NOT_FOUND_URL,
  WRONG_POSTCODE,
  STATUS_NOT_FOUND,
  STATUS_INTERNAL_SERVER_ERROR,
  REDIRECT_STATUS_CODE,
  SERVICE_UNAVAILABLE
} from '../data/constants.js'
import { handleUKLocationType } from './helpers/extra-middleware-helpers.js'
import { handleErrorInputAndRedirect } from './helpers/error-input-and-redirect.js'
import { getMonth } from './helpers/location-type-util.js'
import * as airQualityData from '../data/en/air-quality.js'
import {
  isValidPartialPostcodeNI,
  isValidPartialPostcodeUK
} from './helpers/convert-string.js'
import { sentenceCase } from '../common/helpers/sentence-case.js'
import { convertFirstLetterIntoUppercase } from './helpers/convert-first-letter-into-upper-case.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { config } from '../../config/index.js'

const logger = createLogger()

const SESSION_CACHE_SEGMENT = 'session'
let sessionCachePolicy

// '' Helper to lazily create a session cache policy for async updates
const getSessionCachePolicy = (server) => {
  if (sessionCachePolicy) {
    return sessionCachePolicy
  }

  const sessionCacheName = config.get('session.cache.name')
  sessionCachePolicy = server.cache({
    cache: sessionCacheName,
    segment: SESSION_CACHE_SEGMENT,
    expiresIn: config.get('session.cache.ttl')
  })

  return sessionCachePolicy
}

// '' Helper to update session via cache directly (bypasses yar for async contexts)
const updateSessionInCache = async (server, sessionId, updates) => {
  try {
    const sessionCacheName = config.get('session.cache.name')
    const sessionCacheKey = { id: sessionId, segment: SESSION_CACHE_SEGMENT }
    let cachePolicy

    try {
      cachePolicy = getSessionCachePolicy(server)
    } catch (error) {
      logger.warn(`[CACHE] Failed to create cache policy: ${error.message}`)
    }

    if (cachePolicy) {
      logger.info(`[CACHE] Accessing cache policy for session ${sessionId}`)

      // '' Read current session data with small retry/backoff to avoid transient cache misses
      const maxAttempts = 3
      const baseDelayMs = 50
      let currentSession
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        currentSession = await cachePolicy.get(sessionId)
        if (currentSession) {
          break
        }
        if (attempt < maxAttempts) {
          const delayMs = baseDelayMs * attempt
          logger.warn(
            `[CACHE] Session ${sessionId} not found (attempt ${attempt}); retrying in ${delayMs}ms`
          )
          await new Promise((resolve) => setTimeout(resolve, delayMs))
        }
      }
      if (!currentSession) {
        logger.error(`[CACHE] Session ${sessionId} not found after retries`)
        return false
      }

      // '' Merge updates into session
      const updatedSession = { ...currentSession, ...updates }

      // '' Write back to cache (using yar's format: cache.set(id, store, 0))
      await cachePolicy.set(sessionId, updatedSession, 0)
      logger.info(
        `[CACHE] Successfully updated session ${sessionId} with keys: ${Object.keys(updates).join(', ')}`
      )
      return true
    }

    // '' Fallback: use cache client directly (requires full cache key)
    const caches = server._core?.caches
    if (!caches) {
      logger.error('[CACHE] server._core.caches not available')
      return false
    }

    const cacheEntry = caches.get(sessionCacheName)
    if (!cacheEntry) {
      logger.error(`[CACHE] Cache '${sessionCacheName}' not found`)
      return false
    }

    const cacheClient = cacheEntry.client
    logger.info(`[CACHE] Accessing cache client for session ${sessionId}`)

    // '' Read current session data with small retry/backoff to avoid transient cache misses
    const maxAttempts = 3
    const baseDelayMs = 50
    let currentSession
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      currentSession = await cacheClient.get(sessionCacheKey)
      if (currentSession) {
        break
      }
      if (attempt < maxAttempts) {
        const delayMs = baseDelayMs * attempt
        logger.warn(
          `[CACHE] Session ${sessionId} not found (attempt ${attempt}); retrying in ${delayMs}ms`
        )
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
    if (!currentSession) {
      logger.error(`[CACHE] Session ${sessionId} not found after retries`)
      return false
    }

    // '' Merge updates into session
    const updatedSession = { ...currentSession, ...updates }

    // '' Write back to cache (using yar's format: cache.set(key, store, 0))
    await cacheClient.set(sessionCacheKey, updatedSession, 0)
    logger.info(
      `[CACHE] Successfully updated session ${sessionId} with keys: ${Object.keys(updates).join(', ')}`
    )
    return true
  } catch (error) {
    // '' Diagnostic key/segment log for cache update failures
    logger.error(
      `[CACHE] Failed to update session ${sessionId}: ${error.message}`,
      {
        cacheName: config.get('session.cache.name'),
        cacheKey: { id: sessionId, segment: SESSION_CACHE_SEGMENT }
      }
    )
    return false
  }
}

// '' Async NI location processing - runs in background with overall timeout
const processNILocationAsync = async (request, server, sessionId, options) => {
  const {
    redirectError,
    userLocation,
    searchTerms,
    secondSearchTerm,
    lang,
    month,
    home,
    multipleLocations
  } = options

  // '' Wrap entire async process with 35-second timeout (allows for 3 retries @ 10s each)
  const timeoutPromise = new Promise((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Overall async processing timeout after 35s'))
    }, 35000)
  })

  const processingPromise = (async () => {
    try {
      logger.info(
        `[ASYNC NI] Starting background processing for ${userLocation}`
      )

      // '' Fetch NI data with retries
      logger.info(`[ASYNC NI] Calling processLocationData...`)
      const { getDailySummary, getForecasts, getNIPlaces } =
        await processLocationData(
          request,
          redirectError,
          userLocation,
          searchTerms,
          secondSearchTerm
        )
      logger.info(
        `[ASYNC NI] processLocationData completed for ${userLocation}`
      )

      // '' Check if API failed
      if (getNIPlaces?.error === SERVICE_UNAVAILABLE) {
        logger.error(`[ASYNC NI] API failed for ${userLocation}`)
        const retryUrl = `/retry?postcode=${encodeURIComponent(userLocation)}&lang=${lang}`
        await updateSessionInCache(server, sessionId, {
          niProcessing: false,
          niError: SERVICE_UNAVAILABLE,
          niRedirectTo: retryUrl
        })
        logger.info(`[ASYNC NI] Session updated via cache after API failure`)
        return
      }

      // '' Check if no results found
      if (!getNIPlaces?.results || getNIPlaces?.results.length === 0) {
        logger.warn(`[ASYNC NI] No results found for ${userLocation}`)
        await updateSessionInCache(server, sessionId, {
          niProcessing: false,
          locationDataNotFound: {
            locationNameOrPostcode: userLocation,
            lang
          },
          niRedirectTo: `${LOCATION_NOT_FOUND_URL}?lang=${lang}`
        })
        logger.info(`[ASYNC NI] Session updated via cache after no results`)
        return
      }

      // '' Success - prepare location data
      logger.info(`[ASYNC NI] Preparing location data for ${userLocation}`)
      const { transformedDailySummary, englishDate, welshDate } =
        prepareDateFormatting(getDailySummary, lang)

      const postcode = getNIPlaces.results[0].postcode
      const town = sentenceCase(getNIPlaces.results[0].town)
      const locationTitle = `${postcode}, ${town}`
      const showSummaryDate = isSummaryDateToday(getDailySummary?.issue_date)
      const issueTime = getIssueTime(getDailySummary?.issue_date)

      logger.info(`[ASYNC NI] Success for ${userLocation} - ${locationTitle}`)

      const locationData = {
        results: getNIPlaces.results,
        urlRoute: `${getNIPlaces.results[0].postcode.toLowerCase()}`.replaceAll(
          /\s+/g,
          ''
        ),
        locationType: redirectError.locationType,
        transformedDailySummary,
        englishDate,
        dailySummary: getDailySummary,
        welshDate,
        showSummaryDate,
        issueTime,
        getMonth: month,
        title: `${multipleLocations.titlePrefix} ${convertFirstLetterIntoUppercase(locationTitle)}`,
        pageTitle: `${multipleLocations.titlePrefix} ${convertFirstLetterIntoUppercase(locationTitle)} - ${home.pageTitle}`,
        getForecasts: getForecasts?.forecasts,
        lang
      }

      const redirectUrl = `/location/${locationData.urlRoute}?lang=${lang}`

      // '' CRITICAL: Persist session changes via direct cache access
      logger.info(`[ASYNC NI] Writing to cache - session ${sessionId}`)
      const cacheUpdated = await updateSessionInCache(server, sessionId, {
        locationData,
        niProcessing: false,
        niRedirectTo: redirectUrl,
        niError: null,
        locationDataNotFound: null
      })

      logger.info(`[ASYNC NI] Completed processing for ${userLocation}`)
      logger.info(
        `[ASYNC NI] Set niProcessing=false, niRedirectTo=${redirectUrl}`
      )
      if (cacheUpdated) {
        logger.info(`[ASYNC NI] Cache write successful`)
      } else {
        // '' Diagnostic key/segment log for cache update failures
        logger.error(`[ASYNC NI] Cache write failed`, {
          cacheName: config.get('session.cache.name'),
          cacheKey: { id: sessionId, segment: SESSION_CACHE_SEGMENT }
        })
      }
    } catch (error) {
      logger.error(
        `[ASYNC NI] Error processing ${userLocation}: ${error.message}`
      )
      logger.error(`[ASYNC NI] Error stack: ${error.stack}`)
      const retryUrl = `/retry?postcode=${encodeURIComponent(userLocation)}&lang=${lang}`
      await updateSessionInCache(server, sessionId, {
        niProcessing: false,
        niError: SERVICE_UNAVAILABLE,
        niRedirectTo: retryUrl
      })
      logger.error(
        `[ASYNC NI] Set niProcessing=false, niError=service-unavailable, niRedirectTo=${retryUrl}`
      )
      logger.info(`[ASYNC NI] Session updated via cache after error`)
    }
  })()

  // '' Race between processing and timeout
  try {
    await Promise.race([processingPromise, timeoutPromise])
  } catch (timeoutError) {
    logger.error(
      `[ASYNC NI] Overall timeout for ${userLocation}: ${timeoutError.message}`
    )
    const retryUrl = `/retry?postcode=${encodeURIComponent(userLocation)}&lang=${lang}`
    await updateSessionInCache(server, sessionId, {
      niProcessing: false,
      niError: SERVICE_UNAVAILABLE,
      niRedirectTo: retryUrl
    })
    logger.error(`[ASYNC NI] Timeout - Session updated via cache`)
  }
} // '' Notification flow helpers
const getNotificationFlowFromFlags = (
  existingNotificationFlow = null,
  fromSmsFlow = false,
  fromEmailFlow = false
) => {
  if (existingNotificationFlow) {
    return null
  }

  if (fromSmsFlow) {
    return 'sms'
  }

  if (fromEmailFlow) {
    return 'email'
  }

  return null
}

const applyNotificationFlowFlags = (request, payload = {}, query = {}) => {
  const fromSmsFlow =
    payload?.fromSmsFlow === 'true' || query?.fromSmsFlow === 'true'
  const fromEmailFlow =
    payload?.fromEmailFlow === 'true' || query?.fromEmailFlow === 'true'
  const existingNotificationFlow = request.yar.get('notificationFlow')
  const notificationFlow = getNotificationFlowFromFlags(
    existingNotificationFlow,
    fromSmsFlow,
    fromEmailFlow
  )

  if (notificationFlow) {
    request.yar.set('notificationFlow', notificationFlow)
  }
}

const persistSearchTerms = (request, searchTerms = '') => {
  if (searchTerms) {
    request.yar.set('searchTermsSaved', searchTerms)
  }
}

const getServiceUnavailableResponse = (
  request,
  h,
  locationType,
  getNIPlaces,
  userLocation = '',
  lang = LANG_EN
) => {
  if (
    locationType === LOCATION_TYPE_NI &&
    getNIPlaces?.error === SERVICE_UNAVAILABLE
  ) {
    logger.error(
      '[NI API UNAVAILABLE] Upstream NI API failed - showing service error'
    )
    logger.error(
      `[NI API UNAVAILABLE] This is NOT a wrong postcode - API connectivity issue for: ${userLocation}`
    )
    return handleServiceUnavailable(request, h, lang, {
      breakerOpen: !!getNIPlaces?.breakerOpen
    })
  }

  return null
}

const getNotFoundResponse = ({
  request,
  h,
  redirectError,
  getNIPlaces,
  userLocation,
  getOSPlaces,
  getDailySummary,
  locationNameOrPostcode,
  lang = LANG_EN,
  searchTerms = ''
}) => {
  const shouldRedirect =
    shouldReturnNotFound(
      redirectError,
      getNIPlaces,
      userLocation,
      getOSPlaces
    ) || isInvalidDailySummary(getDailySummary, redirectError.locationType)

  if (!shouldRedirect) {
    return null
  }

  logger.info(
    `[DEBUG] Redirecting to location-not-found. shouldReturnNotFound: ${shouldReturnNotFound(redirectError, getNIPlaces, userLocation, getOSPlaces)}, isInvalidDailySummary: ${isInvalidDailySummary(getDailySummary, redirectError.locationType)}`
  )
  logger.info(`[DEBUG] getDailySummary: ${JSON.stringify(getDailySummary)}`)

  return handleLocationDataNotFound(
    request,
    h,
    locationNameOrPostcode,
    lang,
    searchTerms
  )
}

const handleLocationDataNotFound = (
  request,
  h,
  locationNameOrPostcode,
  lang,
  searchTerms
) => {
  request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })

  // '' Check if user is in notification flow
  const notificationFlow = request.yar.get('notificationFlow')

  if (searchTerms) {
    request.yar.clear('searchTermsSaved')

    // '' Preserve notification flow if active
    const backlinkUrl = notificationFlow
      ? `/search-location?from${notificationFlow === 'sms' ? 'Sms' : 'Email'}Flow=true`
      : undefined

    // '' Render error view directly to avoid redirect
    return h
      .view('error/index', {
        pageTitle: english.notFoundUrl.nonService.pageTitle,
        heading: 'Page not found',
        statusCode: STATUS_NOT_FOUND,
        message: 'Page not found',
        url: request.path,
        notFoundUrl: english.notFoundUrl,
        displayBacklink: !!backlinkUrl,
        customBackLink: !!backlinkUrl,
        backLinkUrl: backlinkUrl,
        backLinkText: 'Go back to search',
        phaseBanner: english.phaseBanner,
        footerTxt: english.footerTxt,
        cookieBanner: english.cookieBanner,
        serviceName: english.multipleLocations.serviceName,
        lang,
        notificationFlow
      })
      .code(STATUS_NOT_FOUND)
      .takeover()
  }
  return h.redirect('location-not-found').takeover()
}

// '' Helper: Render service unavailable page for upstream failures
const handleServiceUnavailable = (request, h, lang, options = {}) => {
  const { breakerOpen = false } = options
  // '' Check if user is in notification flow (SMS or Email)
  const notificationFlow = request.yar.get('notificationFlow')
  const mobileNumber = request.yar.get('mobileNumber')
  const email = request.yar.get('email')

  if (notificationFlow && (mobileNumber || email)) {
    logger.warn(
      `[SERVICE UNAVAILABLE] User in ${notificationFlow} notification flow - preserving session and allowing retry`,
      {
        flow: notificationFlow,
        hasMobileNumber: !!mobileNumber,
        hasEmail: !!email
      }
    )

    // '' Preserve notification flow state and allow retry
    const backlinkUrl =
      notificationFlow === 'sms'
        ? '/search-location?fromSmsFlow=true'
        : '/search-location?fromEmailFlow=true'

    return h
      .view('error/index', {
        pageTitle: english.notFoundUrl.serviceAPI.pageTitle,
        heading: english.notFoundUrl.serviceAPI.heading,
        statusCode: STATUS_INTERNAL_SERVER_ERROR,
        message: english.notFoundUrl.serviceAPI.heading,
        url: request.path,
        notFoundUrl: english.notFoundUrl,
        breakerOpen,
        displayBacklink: true,
        customBackLink: true,
        backLinkUrl: backlinkUrl,
        backLinkText: 'Go back to search',
        phaseBanner: english.phaseBanner,
        footerTxt: english.footerTxt,
        cookieBanner: english.cookieBanner,
        serviceName: english.multipleLocations.serviceName,
        lang,
        notificationFlow
      })
      .code(STATUS_INTERNAL_SERVER_ERROR)
      .takeover()
  }

  // '' Normal error handling - no notification flow
  return h
    .view('error/index', {
      pageTitle: english.notFoundUrl.serviceAPI.pageTitle,
      heading: english.notFoundUrl.serviceAPI.heading,
      statusCode: STATUS_INTERNAL_SERVER_ERROR,
      message: english.notFoundUrl.serviceAPI.heading,
      url: request.path,
      notFoundUrl: english.notFoundUrl,
      breakerOpen,
      displayBacklink: false,
      phaseBanner: english.phaseBanner,
      footerTxt: english.footerTxt,
      cookieBanner: english.cookieBanner,
      serviceName: english.multipleLocations.serviceName,
      lang
    })
    .code(STATUS_INTERNAL_SERVER_ERROR)
    .takeover()
}

const processUKLocationType = (request, h, redirectError, options = {}) => {
  const {
    userLocation,
    locationNameOrPostcode,
    lang,
    searchTerms,
    secondSearchTerm,
    getOSPlaces,
    getDailySummary,
    getForecasts,
    transformedDailySummary,
    englishDate,
    welshDate,
    month
  } = options

  const locationType = redirectError.locationType
  return handleUKLocationType(request, h, {
    locationType,
    userLocation,
    locationNameOrPostcode,
    lang,
    searchTerms,
    secondSearchTerm,
    getOSPlaces,
    airQualityData,
    getDailySummary,
    getForecasts,
    transformedDailySummary,
    calendarWelsh,
    englishDate,
    welshDate,
    month,
    english
  })
}

const processNILocationType = (request, h, redirectError, options = {}) => {
  const {
    locationNameOrPostcode,
    lang,
    getNIPlaces,
    transformedDailySummary,
    englishDate,
    welshDate,
    getDailySummary,
    month,
    multipleLocations,
    home,
    getForecasts
  } = options
  if (
    !getNIPlaces?.results ||
    getNIPlaces?.results.length === 0 ||
    getNIPlaces === WRONG_POSTCODE
  ) {
    request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
    request.yar.clear('searchTermsSaved')
    return h
      .redirect(`${LOCATION_NOT_FOUND_URL}?lang=en`)
      .code(REDIRECT_STATUS_CODE)
      .takeover()
  }

  const postcode = getNIPlaces?.results[0].postcode
  const town = sentenceCase(getNIPlaces?.results[0].town)
  const locationTitle = `${postcode}, ${town}`
  const showSummaryDate = isSummaryDateToday(getDailySummary?.issue_date)
  const issueTime = getIssueTime(getDailySummary?.issue_date)

  // '' Log issue_date when passing dailySummary into session location data
  logger.info(
    `[DEBUG issue_date] passing to session dailySummary (NI): ${getDailySummary?.issue_date ?? 'N/A'}`,
    {
      issueDate: getDailySummary?.issue_date,
      locationType: redirectError.locationType,
      locationTitle
    }
  )

  const locationData = {
    results: getNIPlaces?.results,
    urlRoute: `${getNIPlaces?.results[0].postcode.toLowerCase()}`.replaceAll(
      /\s+/g,
      ''
    ),
    locationType: redirectError.locationType,
    transformedDailySummary,
    englishDate,
    dailySummary: getDailySummary,
    welshDate,
    showSummaryDate,
    issueTime,
    getMonth: month,
    title: `${multipleLocations.titlePrefix} ${convertFirstLetterIntoUppercase(locationTitle)}`,
    pageTitle: `${multipleLocations.titlePrefix} ${convertFirstLetterIntoUppercase(locationTitle)} - ${home.pageTitle}`,
    getForecasts: getForecasts?.forecasts,
    lang
  }

  request.yar.clear('locationData')
  request.yar.set('locationData', locationData)
  return h
    .redirect(`/location/${locationData.urlRoute}?lang=en`)
    .code(REDIRECT_STATUS_CODE)
    .takeover()
}

const isLocationDataNotFound = (
  userLocation,
  redirectError,
  getOSPlaces,
  getNIPlaces
) => {
  const isPartialPostcode =
    isValidPartialPostcodeUK(userLocation) ||
    isValidPartialPostcodeNI(userLocation)

  const isUKTypeNoResults =
    !getOSPlaces?.results && redirectError.locationType === LOCATION_TYPE_UK

  const isNITypeNoResults =
    redirectError.locationType === LOCATION_TYPE_NI &&
    (!getNIPlaces?.results || getNIPlaces?.results.length === 0)

  return (
    isPartialPostcode ||
    getOSPlaces === WRONG_POSTCODE ||
    isUKTypeNoResults ||
    isNITypeNoResults
  )
}

const processLocationData = async (
  request,
  redirectError,
  userLocation,
  searchTerms,
  secondSearchTerm
) => {
  // '' Return the promise directly to avoid redundant await
  return fetchData(request, {
    locationType: redirectError.locationType,
    userLocation,
    searchTerms,
    secondSearchTerm
  })
}

function shouldReturnNotFound(
  redirectError,
  getNIPlaces,
  userLocation,
  getOSPlaces
) {
  logger.info(
    `[DEBUG shouldReturnNotFound] locationType: ${redirectError.locationType}`
  )
  logger.info(
    `[DEBUG shouldReturnNotFound] getNIPlaces?.results exists: ${!!getNIPlaces?.results}`
  )
  logger.info(
    `[DEBUG shouldReturnNotFound] getNIPlaces?.results length: ${getNIPlaces?.results?.length}`
  )
  logger.info(
    `[DEBUG shouldReturnNotFound] getNIPlaces structure: ${JSON.stringify(getNIPlaces)}`
  )

  if (
    redirectError.locationType === LOCATION_TYPE_NI &&
    (!getNIPlaces?.results || getNIPlaces?.results.length === 0)
  ) {
    logger.info(
      `[DEBUG shouldReturnNotFound] Returning true: NI with no results`
    )
    return true
  }
  if (
    isLocationDataNotFound(
      userLocation,
      redirectError,
      getOSPlaces,
      getNIPlaces
    )
  ) {
    logger.info(
      `[DEBUG shouldReturnNotFound] Returning true: isLocationDataNotFound`
    )
    return true
  }
  logger.info(`[DEBUG shouldReturnNotFound] Returning false: location found`)
  return false
}

function isInvalidDailySummary(getDailySummary, locationType) {
  const isMockEnabled = config.get('enabledMock')

  // '' When mock is enabled, allow null daily summary for NI testing
  if (isMockEnabled) {
    return false
  }

  // '' For NI locations, don't enforce daily summary check (matches production 0.685.0 behavior)
  if (locationType === LOCATION_TYPE_NI) {
    return false
  }

  return (
    !getDailySummary ||
    typeof getDailySummary !== 'object' ||
    !getDailySummary.today
  )
}

/**
 * '' Prepare formatted date information for display
 */
function prepareDateFormatting(getDailySummary, lang) {
  const { transformedDailySummary } = transformKeys(getDailySummary, lang)
  const { formattedDateSummary, getMonthSummary } = getFormattedDateSummary(
    getDailySummary?.issue_date,
    calendarEnglish,
    calendarWelsh,
    lang
  )
  const { englishDate, welshDate } = getLanguageDates(
    formattedDateSummary,
    getMonthSummary,
    calendarEnglish,
    calendarWelsh
  )

  return { transformedDailySummary, englishDate, welshDate }
}

/**
 * '' Route request to appropriate location type handler
 */
function routeToLocationTypeHandler(request, h, redirectError, context) {
  const { locationType } = redirectError

  if (locationType === LOCATION_TYPE_UK) {
    return processUKLocationType(request, h, redirectError, context.ukContext)
  }

  if (locationType === LOCATION_TYPE_NI) {
    return processNILocationType(request, h, redirectError, context.niContext)
  }

  request.yar.clear('searchTermsSaved')
  return h.redirect(`${LOCATION_NOT_FOUND_URL}?lang=en`).takeover()
}

/**
 * '' Build context objects for location type handlers
 */
function buildLocationContexts(params) {
  const {
    userLocation,
    locationNameOrPostcode,
    lang,
    searchTerms,
    secondSearchTerm,
    getOSPlaces,
    getDailySummary,
    getForecasts,
    getNIPlaces,
    transformedDailySummary,
    englishDate,
    welshDate,
    month,
    home,
    multipleLocations
  } = params

  const ukContext = {
    userLocation,
    locationNameOrPostcode,
    lang,
    searchTerms,
    secondSearchTerm,
    getOSPlaces,
    airQualityData,
    getDailySummary,
    getForecasts,
    transformedDailySummary,
    calendarWelsh,
    englishDate,
    welshDate,
    month,
    english
  }

  const niContext = {
    locationNameOrPostcode,
    lang,
    searchTerms,
    getNIPlaces,
    transformedDailySummary,
    englishDate,
    welshDate,
    getDailySummary,
    month,
    multipleLocations,
    home,
    getForecasts
  }

  return { ukContext, niContext }
}

const searchMiddleware = async (request, h) => {
  logger.info(
    `[DEBUG MIDDLEWARE TOP] Request to /location - query params: ${JSON.stringify(request.query)}`
  )

  const { query, payload } = request
  const lang = LANG_EN
  const month = getMonth(lang)
  const { home, multipleLocations } = english
  const searchTerms = query?.searchTerms?.toUpperCase()
  const secondSearchTerm = query?.secondSearchTerm?.toUpperCase()

  // '' Ensure notification flow is preserved when search form includes flow flags
  applyNotificationFlowFlags(request, payload, query)
  // '' Set searchTermsSaved early in UK location processing
  persistSearchTerms(request, searchTerms)

  const redirectError = handleErrorInputAndRedirect(
    request,
    h,
    lang,
    payload,
    searchTerms
  )
  if (!redirectError.locationType) {
    return redirectError
  }

  const { userLocation, locationNameOrPostcode } = redirectError

  logger.info(
    `[DEBUG LOCATION TYPE] userLocation=${userLocation}, locationType=${redirectError.locationType}, isNI=${redirectError.locationType === LOCATION_TYPE_NI}, LOCATION_TYPE_NI=${LOCATION_TYPE_NI}`
  )

  // '' Check if this is a NI postcode - trigger async processing
  if (redirectError.locationType === LOCATION_TYPE_NI) {
    logger.info(`[ASYNC NI] Detected NI postcode: ${userLocation}`)

    // '' Capture session ID and server before sending response
    const sessionId = request.yar.id
    const server = request.server

    // '' Set session state for async processing
    request.yar.set('niProcessing', true)
    request.yar.set('niPostcode', userLocation)
    request.yar.set('lang', lang)
    request.yar.clear('niError')
    request.yar.clear('niRedirectTo')

    logger.info(`[ASYNC NI] Session ID: ${sessionId}`)

    // '' Trigger background processing (non-blocking)
    processNILocationAsync(request, server, sessionId, {
      redirectError,
      userLocation,
      searchTerms,
      secondSearchTerm,
      lang,
      month,
      home,
      multipleLocations
    }).catch((error) => {
      logger.error(`[ASYNC NI] Background processing error: ${error.message}`)
    })

    // '' Immediately redirect to loading page
    return h
      .redirect(`/loading?postcode=${encodeURIComponent(userLocation)}`)
      .code(REDIRECT_STATUS_CODE)
      .takeover()
  }

  const { getDailySummary, getForecasts, getOSPlaces, getNIPlaces } =
    await processLocationData(
      request,
      redirectError,
      userLocation,
      searchTerms,
      secondSearchTerm
    )

  // '' Handle upstream NI API failure - show 500 service error (not 404 postcode error)
  const serviceUnavailableResponse = getServiceUnavailableResponse(
    request,
    h,
    redirectError.locationType,
    getNIPlaces,
    userLocation,
    lang
  )
  if (serviceUnavailableResponse) {
    return serviceUnavailableResponse
  }

  const notFoundResponse = getNotFoundResponse({
    request,
    h,
    redirectError,
    getNIPlaces,
    userLocation,
    getOSPlaces,
    getDailySummary,
    locationNameOrPostcode,
    lang,
    searchTerms
  })
  if (notFoundResponse) {
    return notFoundResponse
  }

  const { transformedDailySummary, englishDate, welshDate } =
    prepareDateFormatting(getDailySummary, lang)

  // '' Temporary debug log for summary date gating
  const issueTime = getIssueTime(getDailySummary?.issue_date)
  const showSummaryDate = isSummaryDateToday(getDailySummary?.issue_date)
  logger.info('[DEBUG summary-date] issueTime/showSummaryDate', {
    locationType: redirectError.locationType,
    issueDate: getDailySummary?.issue_date,
    issueTime,
    showSummaryDate
  })

  const contexts = buildLocationContexts({
    userLocation,
    locationNameOrPostcode,
    lang,
    searchTerms,
    secondSearchTerm,
    getOSPlaces,
    getDailySummary,
    getForecasts,
    getNIPlaces,
    transformedDailySummary,
    englishDate,
    welshDate,
    month,
    home,
    multipleLocations
  })

  // '' searchTermsSaved is set in processNILocationType/processUKLocationType before redirecting

  return routeToLocationTypeHandler(request, h, redirectError, contexts)
}

export { searchMiddleware, shouldReturnNotFound, isInvalidDailySummary }
