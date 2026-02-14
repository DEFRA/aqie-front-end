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

const buildViewModel = ({ metaSiteUrl, lang, postcode }) => {
  return {
    pageTitle: 'Loading air quality data',
    description: 'Loading air quality data for your location.',
    metaSiteUrl,
    page: english.searchLocation.page,
    serviceName: english.searchLocation.serviceName,
    phaseBanner: english.phaseBanner,
    footerTxt: english.footerTxt,
    cookieBanner: english.cookieBanner,
    currentPath: LOADING_PATH,
    lang,
    postcode
  }
}

const loadingController = {
  handler: (request, h) => {
    const metaSiteUrl = getAirQualitySiteUrl(request)
    const lang = determineLanguage(request)
    const postcode = request.query?.postcode || ''

    // '' Check if NI processing is active in session
    const niProcessing = request.yar?.get('niProcessing')

    if (!niProcessing) {
      // '' No active processing, redirect to search
      const searchPath =
        lang === LANG_CY ? '/chwilio-lleoliad/cy' : '/search-location'
      return h.redirect(searchPath)
    }

    const viewModel = buildViewModel({ metaSiteUrl, lang, postcode })

    return h.view('loading/index', viewModel)
  }
}

export { loadingController }
