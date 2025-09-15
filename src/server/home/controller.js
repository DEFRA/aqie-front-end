import { english } from '../data/en/en.js'
import { LANG_CY, LANG_EN, REDIRECT_STATUS_CODE } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { createLogger } from '../common/helpers/logging/logger.js'

// Create a logger instance
const logger = createLogger()

const handleHomeRequest = (request, h, content = english) => {
  const { query } = request
  const { home, footerTxt, phaseBanner, backlink, cookieBanner } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)

  // DEBUG: Check if middleware executed
  logger.info(
    `🎯 CONTROLLER ENTRY: Middleware executed = ${request.middlewareExecuted}, timestamp = ${request.middlewareTimestamp}`
  )
  logger.info(
    `🎯 CONTROLLER ENTRY: request.jsEnabled = ${request.jsEnabled} (type: ${typeof request.jsEnabled})`
  )

  // Simple JavaScript Detection - Just use the flag!
  logger.info(
    `🔍 DEBUG: request.jsEnabled = ${request.jsEnabled} (type: ${typeof request.jsEnabled})`
  )

  // Add explicit boolean conversion for debugging
  const jsEnabledBoolean = Boolean(request.jsEnabled)
  logger.info(
    `🔍 EXPLICIT BOOLEAN: Boolean(request.jsEnabled) = ${jsEnabledBoolean}`
  )
  logger.info(
    `🔍 STRICT EQUALITY: request.jsEnabled === true is ${request.jsEnabled === true}`
  )
  logger.info(
    `🔍 LOOSE EQUALITY: request.jsEnabled === true is ${request.jsEnabled === true}`
  )

  // Use explicit true comparison instead of truthy check
  if (request.jsEnabled === true) {
    logger.info('🚀 HOME: User has JavaScript enabled - enhanced experience')
    // Set up enhanced features
    request.homePageMode = 'enhanced'
    request.enableAdvancedSearch = true
    request.enableInteractiveMap = true
  } else {
    logger.info('📱 HOME: User has JavaScript disabled - basic experience')
    logger.info(
      `🔍 ELSE BLOCK: request.jsEnabled = ${request.jsEnabled}, type = ${typeof request.jsEnabled}`
    )
    // Set up basic features
    request.homePageMode = 'basic'
    request.enableAdvancedSearch = false
    request.enableInteractiveMap = false
  }

  // Check if request.yar and its set method exist before calling it ''
  if (request.yar && typeof request.yar.set === 'function') {
    request.yar.set('locationType', '') // ''
  } else {
    // Optionally log a warning or handle the missing session gracefully ''
    logger.warn('Session (yar) is not available on the request object') // ''
  }
  if (query.lang === LANG_CY) {
    return h.redirect(LANG_CY).code(REDIRECT_STATUS_CODE)
  }

  return h.view('home/index', {
    pageTitle: home.pageTitle,
    description: home.description,
    metaSiteUrl,
    heading: home.heading,
    page: home.page,
    paragraphs: home.paragraphs,
    label: home.button,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    serviceName: '',
    lang: LANG_EN,
    // Simple JavaScript flag
    jsEnabled: request.jsEnabled,
    // Custom properties based on JS detection
    homePageMode: request.homePageMode,
    enableAdvancedSearch: request.enableAdvancedSearch,
    enableInteractiveMap: request.enableInteractiveMap
  })
}

const homeController = {
  handler: handleHomeRequest
}

export { homeController, handleHomeRequest }
