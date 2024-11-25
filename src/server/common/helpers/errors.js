import { english } from '~/src/server/data/en/en.js'
import { welsh } from '~/src/server/data/cy/cy.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger'

const logger = createLogger()

function statusCodeMessage(statusCode, lang) {
  switch (true) {
    case statusCode === 404:
      if (lang.slice(0, 2) === 'cy') {
        return 'Tudalen heb ei chanfod'
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
  const { query, response, path } = request
  let lang = path?.split('/').pop()?.slice(0, 2)
  if (lang === 'cy') {
    lang = 'cy'
  } else {
    lang = 'en'
  }
  lang = query?.lang ?? lang
  if (lang !== 'cy' && lang !== 'en' && path === '/search-location') {
    lang = 'en'
  }
  if (lang !== 'cy' && lang !== 'en' && path === '/chwilio-lleoliad/cy') {
    lang = 'cy'
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
  if (lang === 'cy') {
    return h
      .view('error/index', {
        pageTitle: `${errorMessage}`,
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
      pageTitle: `${errorMessage}`,
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
