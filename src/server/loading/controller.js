import { english } from '../data/en/en.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { LANG_CY } from '../data/constants.js'

// ''

const LOADING_PATH = '/loading'
const WELSH_SEARCH_PATH = '/chwilio-lleoliad/cy'

const determineLanguage = (request) => {
  const lang = request.payload?.lang || request.query?.lang
  if (lang === LANG_CY) {
    return LANG_CY
  }

  const referer = request.headers?.referer || ''
  if (referer.includes(WELSH_SEARCH_PATH)) {
    return LANG_CY
  }

  return 'en'
}

const buildViewModel = ({ metaSiteUrl, lang, payload }) => {
  return {
    pageTitle: 'Loading air quality data',
    description:
      'Loading air quality data while we look up the location you requested.',
    metaSiteUrl,
    page: english.searchLocation.page,
    serviceName: english.searchLocation.serviceName,
    phaseBanner: english.phaseBanner,
    footerTxt: english.footerTxt,
    cookieBanner: english.cookieBanner,
    currentPath: LOADING_PATH,
    lang,
    payload
  }
}

const loadingController = {
  handler: (request, h) => {
    const metaSiteUrl = getAirQualitySiteUrl(request)
    const lang = determineLanguage(request)

    const payload = request.payload || {}

    const viewModel = buildViewModel({ metaSiteUrl, lang, payload })

    return h.view('loading/index', viewModel)
  }
}

export { loadingController, determineLanguage, buildViewModel }
