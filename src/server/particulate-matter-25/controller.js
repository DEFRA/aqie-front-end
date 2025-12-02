import { english } from '../data/en/en.js'
import { LANG_CY, LANG_EN, REDIRECT_STATUS_CODE } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { createLocationBackLink } from '../common/helpers/back-link-helper.js'

const particulateMatter25Controller = {
  handler: (request, h) => {
    const { particulateMatter25 } = english.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = english
    const { query } = request
    const lang = LANG_EN
    const metaSiteUrl = getAirQualitySiteUrl(request)

    if (query?.lang && query?.lang === LANG_CY) {
      return h
        .redirect(`/llygryddion/mater-gronynnol-25/cy?lang=cy`)
        .code(REDIRECT_STATUS_CODE)
    }

    // '' Redirect to search location if no locationId (user needs to search for location)
    const { locationId, locationName, searchTerms } = query || {}
    if (!locationId) {
      return h
        .redirect(`/search-location?lang=${lang}`)
        .code(REDIRECT_STATUS_CODE)
    }

    // '' Create context-aware back link based on query params
    const backLinkConfig = createLocationBackLink({
      locationId,
      locationName,
      searchTerms,
      lang
    })

    return h.view('particulate-matter-25/index', {
      pageTitle: particulateMatter25.pageTitle,
      description: particulateMatter25.description,
      metaSiteUrl,
      particulateMatter25,
      page: 'particulate matter 25',
      ...backLinkConfig,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      currentPath: '/pollutants/particulate-matter-25',
      lang: query.lang ?? lang
    })
  }
}

export { particulateMatter25Controller }
