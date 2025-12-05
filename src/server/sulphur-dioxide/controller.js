import { english } from '../data/en/en.js'
import { LANG_CY, LANG_EN, REDIRECT_STATUS_CODE } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { createLocationBackLink } from '../common/helpers/back-link-helper.js'

const sulphurDioxideController = {
  handler: (request, h) => {
    const { sulphurDioxide } = english.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = english
    const { query } = request
    const metaSiteUrl = getAirQualitySiteUrl(request)

    const lang = LANG_EN
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
        .redirect(`/llygryddion/sylffwr-deuocsid/cy?${queryParams.toString()}`)
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

    return h.view('sulphur-dioxide/index', {
      pageTitle: sulphurDioxide.pageTitle,
      description: sulphurDioxide.description,
      metaSiteUrl,
      sulphurDioxide,
      page: 'sulphur dioxide',
      ...backLinkConfig,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      currentPath: '/pollutants/sulphur-dioxide',
      queryParams: query,
      locationId,
      locationName,
      searchTerms,
      lang: query.lang ?? lang
    })
  }
}

export { sulphurDioxideController }
