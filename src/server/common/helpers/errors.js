import { english } from '~/src/server/data/en/en.js'
import { welsh } from '~/src/server/data/cy/cy.js'

function statusCodeMessage(statusCode) {
  switch (true) {
    case statusCode === 404:
      return 'Page not found'
    case statusCode === 403:
      return 'Forbidden'
    case statusCode === 401:
      return 'Unauthorized'
    case statusCode === 400:
      return 'Bad Request'
    default:
      return 'Something went wrong'
  }
}

function catchAll(request, h) {
  const { query, response, path } = request
  let lang = path?.split('/').pop().slice(0, 2)

  if (lang === 'cy') {
    lang = 'cy'
  } else {
    lang = 'en'
  }
  lang = query.lang ?? lang
  if (!response.isBoom) {
    return h.continue
  }

  request.logger.error(response?.stack)

  const statusCode = response.output.statusCode
  const errorMessage = statusCodeMessage(statusCode)
  const { footerTxt, notFoundUrl, cookieBanner, multipleLocations } = english
  if (lang === 'cy') {
    return h
      .view('error/index', {
        pageTitle: errorMessage,
        heading: statusCode,
        message: errorMessage,
        url: request.path,
        notFoundUrl: welsh.notFoundUrl,
        displayBacklink: false,
        footerTxt: welsh.footerTxt,
        cookieBanner: welsh.cookieBanner,
        serviceName: welsh.multipleLocations.serviceName,
        lang: request.query.lang ?? lang
      })
      .code(statusCode)
  }
  return h
    .view('error/index', {
      pageTitle: errorMessage,
      heading: statusCode,
      message: errorMessage,
      url: request.path,
      notFoundUrl,
      displayBacklink: false,
      phaseBanner: false,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      lang: request.query.lang ?? lang
    })
    .code(statusCode)
}

export { catchAll }
