import { english } from '../data/en/en.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { LANG_CY } from '../data/constants.js'

// ''

const RETRY_PATH = '/retry'
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
    pageTitle: 'Retrying air quality lookup',
    description:
      'Retrying the air quality lookup while we fetch the location you requested.',
    metaSiteUrl,
    page: english.searchLocation.page,
    serviceName: english.searchLocation.serviceName,
    phaseBanner: english.phaseBanner,
    footerTxt: english.footerTxt,
    cookieBanner: english.cookieBanner,
    currentPath: RETRY_PATH,
    lang,
    payload
  }
}

const retryController = {
  handler: (request, h) => {
    const metaSiteUrl = getAirQualitySiteUrl(request)
    const lang = determineLanguage(request)

    const payload = request.payload || {}

    const viewModel = buildViewModel({ metaSiteUrl, lang, payload })

    return h.view('retry/index', viewModel)
  }
}

export { retryController, determineLanguage, buildViewModel }
