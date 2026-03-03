import { english } from '../data/en/en.js'
import {
  LANG_CY,
  SEARCH_LOCATION_PATH_CY,
  SEARCH_LOCATION_PATH_EN
} from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import {
  buildPreloaderViewModel,
  resolvePreloaderLanguage
} from '../common/helpers/preloader.js'

// ''

const LOADING_PATH = '/loading'
const WELSH_SEARCH_PATH = '/chwilio-lleoliad/cy'

const buildLoadingCopy = (lang) => {
  if (lang === 'cy') {
    return {
      heading: 'Yn llwytho data ansawdd aer',
      body: 'Rydym yn casglu gwybodaeth am ansawdd aer yn eich ardal.',
      statusText: 'Yn llwytho…'
    }
  }

  return {
    heading: 'Loading air quality data',
    body: 'We are gathering air quality information for your area.',
    statusText: 'Loading…'
  }
}

const loadingController = {
  handler: (request, h) => {
    const metaSiteUrl = getAirQualitySiteUrl(request)
    const lang = resolvePreloaderLanguage(request, {
      welshSearchPath: WELSH_SEARCH_PATH
    })
    const postcode = request.query?.postcode || ''

    // '' Check if NI processing is active in session
    const niProcessing = request.yar?.get('niProcessing')

    if (!niProcessing) {
      // '' No active processing, redirect to search
      const searchPath =
        lang === LANG_CY ? SEARCH_LOCATION_PATH_CY : SEARCH_LOCATION_PATH_EN
      return h.redirect(searchPath)
    }

    const copy = buildLoadingCopy(lang)
    const retryUrl = `/retry?postcode=${encodeURIComponent(postcode)}&lang=${lang}`
    const viewModel = buildPreloaderViewModel({
      lang,
      metaSiteUrl,
      pageTitle: 'Loading air quality data',
      description: 'Loading air quality data for your location.',
      page: english.searchLocation.page,
      serviceName: english.searchLocation.serviceName,
      phaseBanner: english.phaseBanner,
      footerTxt: english.footerTxt,
      cookieBanner: english.cookieBanner,
      currentPath: LOADING_PATH,
      heading: copy.heading,
      body: copy.body,
      statusText: copy.statusText,
      retryUrl,
      preloaderConfig: {
        statusUrl: '/loading-status'
      }
    })

    return h.view('loading/index', viewModel)
  }
}

export { loadingController }
