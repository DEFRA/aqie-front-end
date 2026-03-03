import { STATUS_OK } from '../../data/constants.js'

// ''

const DEFAULT_PRELOADER_CONFIG = {
  statusUrl: '/loading-status',
  maxPolls: 15,
  pollIntervalMs: 2000,
  initialDelayMs: 1000
}

const resolvePreloaderLanguage = (
  request,
  { welshSearchPath = '/chwilio-lleoliad/cy', defaultLang = 'en' } = {}
) => {
  const lang = request.payload?.lang || request.query?.lang
  if (lang === 'cy') {
    return 'cy'
  }

  const referer = request.headers?.referer || ''
  if (referer.includes(welshSearchPath)) {
    return 'cy'
  }

  return defaultLang
}

const buildPreloaderViewModel = ({
  lang,
  metaSiteUrl,
  pageTitle,
  description,
  page,
  serviceName,
  phaseBanner,
  footerTxt,
  cookieBanner,
  currentPath,
  heading,
  body,
  statusText,
  retryUrl,
  preloaderConfig = {}
} = {}) => {
  return {
    pageTitle,
    description,
    metaSiteUrl,
    page,
    serviceName,
    phaseBanner,
    footerTxt,
    cookieBanner,
    currentPath,
    lang,
    preloader: {
      heading,
      body,
      statusText,
      retryUrl,
      ...DEFAULT_PRELOADER_CONFIG,
      ...preloaderConfig
    }
  }
}

const buildPreloaderStatusResponse = ({
  h,
  isProcessing,
  hasError,
  redirectTo,
  retryRedirect,
  defaultRedirect
} = {}) => {
  if (!isProcessing) {
    if (hasError) {
      return h
        .response({
          status: 'failed',
          redirectTo: retryRedirect || defaultRedirect
        })
        .code(STATUS_OK)
    }

    if (redirectTo) {
      return h
        .response({
          status: 'complete',
          redirectTo
        })
        .code(STATUS_OK)
    }

    return h
      .response({
        status: 'failed',
        redirectTo: defaultRedirect
      })
      .code(STATUS_OK)
  }

  return h
    .response({
      status: 'processing'
    })
    .code(STATUS_OK)
}

export {
  DEFAULT_PRELOADER_CONFIG,
  resolvePreloaderLanguage,
  buildPreloaderViewModel,
  buildPreloaderStatusResponse
}
