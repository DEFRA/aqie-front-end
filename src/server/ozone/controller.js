import { english } from '../data/en/en.js'
import { LANG_CY, LANG_EN, REDIRECT_STATUS_CODE } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { createLocationBackLink } from '../common/helpers/back-link-helper.js'

const ozoneController = {
  handler: (request, h) => {
    const { ozone } = english.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = english
    const { query } = request
    const lang = LANG_EN
    const metaSiteUrl = getAirQualitySiteUrl(request)

    if (query?.lang && query?.lang === LANG_CY) {
      const queryParams = new URLSearchParams({ lang: LANG_CY })
      if (query.locationId) {
        queryParams.append('locationId', query.locationId)
      }
      if (query.locationName) {
        queryParams.append('locationName', query.locationName)
      }
      if (query.searchTerms) {
        queryParams.append('searchTerms', query.searchTerms)
      }
      return h
        .redirect(`/llygryddion/oson/cy?${queryParams.toString()}`)
        .code(REDIRECT_STATUS_CODE)
    }

    // Redirect to search location if no locationId (user needs to search for location)
    const { locationId, locationName, searchTerms } = query || {}
    if (!locationId) {
      return h
        .redirect(`/search-location?lang=${lang}`)
        .code(REDIRECT_STATUS_CODE)
    }

    // Create context-aware back link based on query params
    const backLinkConfig = createLocationBackLink({
      locationId,
      locationName,
      searchTerms,
      lang
    })

    return h.view('ozone/index', {
      pageTitle: ozone.pageTitle,
      description: ozone.description,
      metaSiteUrl,
      ozone,
      page: 'ozone',
      ...backLinkConfig,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      currentPath: '/pollutants/ozone',
      queryParams: query,
      locationId,
      locationName,
      searchTerms,
      lang: query.lang ?? lang
    })
  }
}

export { ozoneController }
