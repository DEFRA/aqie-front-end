import { english } from '../data/en/en.js'
import { LANG_CY, LANG_EN } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { createLogger } from '../common/helpers/logging/logger.js'

// Create a logger instance
const logger = createLogger()

const handleHomeRequest = (request, h, content = english) => {
  const { query } = request
  const { home, footerTxt, phaseBanner, backlink, cookieBanner } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)
  // Check if request.yar and its set method exist before calling it ''
  if (request.yar && typeof request.yar.set === 'function') {
    request.yar.set('locationType', '') // ''
  } else {
    // Optionally log a warning or handle the missing session gracefully ''
    logger.warn('Session (yar) is not available on the request object') // ''
  }
  if (query.lang === LANG_CY) {
    return h.redirect(LANG_CY)
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
    lang: LANG_EN
  })
}

const homeController = {
  handler: handleHomeRequest
}

export { homeController, handleHomeRequest }
