import { PAGE_NOT_FOUND_CY } from '../../data/cy/cy.js'
import { english } from '../../data/en/en.js'
import { welsh } from '../../data/cy/cy.js'
import { createLogger } from './logging/logger.js'
import { LANG_CY, LANG_EN, STATUS_NOT_FOUND } from '../../data/constants.js'

const logger = createLogger()

function statusCodeMessage(statusCode, lang) {
  switch (true) {
    case statusCode === STATUS_NOT_FOUND:
      if (lang.slice(0, 2) === LANG_CY) {
        return PAGE_NOT_FOUND_CY
      }
      return 'Page not found'
    case statusCode === 403:
      return 'Forbidden'
    case statusCode === 401:
      return 'Unauthorized'
    case statusCode === 400:
      return 'Bad Request'
    case statusCode === 500:
      return 'Sorry, there is a problem with the service'
    default:
      return 'Sorry, there is a problem with the service'
  }
}

function catchAll(request, h) {
  const { query, response, path, headers } = request
  const referer = headers?.referer
  let lang = path?.split('/').pop()?.slice(0, 2)
  if (lang === LANG_CY) {
    lang = LANG_CY
  } else {
    lang = LANG_EN
  }
  lang = query?.lang ?? lang
  if (lang !== LANG_CY && lang !== LANG_EN && path === '/search-location') {
    lang = LANG_EN
  }
  if (lang !== LANG_CY && lang !== LANG_EN && path === '/chwilio-lleoliad/cy') {
    lang = LANG_CY
  }

  if (!response?.isBoom) {
    return h.continue
  }

  request.logger.error(response?.stack)

  const statusCode = response?.output?.statusCode
  const errorMessage = statusCodeMessage(statusCode, lang)
  const {
    footerTxt,
    notFoundUrl,
    cookieBanner,
    multipleLocations,
    phaseBanner
  } = english

  logger.info(
    `Error: ${errorMessage} statusCode- ${statusCode} -path ${request.path}`
  )
  if (lang === LANG_CY) {
    return h
      .view('error/index', {
        pageTitle: welsh.notFoundUrl.nonService.pageTitle,
        heading: errorMessage,
        statusCode,
        message: errorMessage,
        url: request.path,
        notFoundUrl: welsh.notFoundUrl,
        displayBacklink: false,
        phaseBanner: welsh.phaseBanner,
        footerTxt: welsh.footerTxt,
        cookieBanner: welsh.cookieBanner,
        serviceName: welsh.multipleLocations.serviceName,
        lang
      })
      .code(statusCode)
  }
  return h
    .view('error/index', {
      pageTitle: notFoundUrl.nonService.pageTitle,
      heading: errorMessage,
      statusCode,
      message: errorMessage,
      url: request.path,
      notFoundUrl,
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      lang
    })
    .code(statusCode)
}

export { catchAll }
