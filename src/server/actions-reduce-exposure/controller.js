import { english } from '../data/en/en.js'
import { LANG_CY, LANG_EN, REDIRECT_STATUS_CODE } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

const actionsReduceExposureController = {
  handler: (request, h) => {
    const { actionsReduceExposure } = english
    const {
      footerTxt,
      cookieBanner,
      phaseBanner,
      multipleLocations,
      backlink
    } = english
    const { query, params } = request
    const lang = LANG_EN
    const metaSiteUrl = getAirQualitySiteUrl(request)

    // Get location ID from path parameters and location name from session/query
    const locationId = params.locationId
    const searchTerms = query?.searchTerms || ''
    const locationName = query?.locationName || ''
    const hasSearchTerms = searchTerms.trim() !== ''
    const hasLocationName = locationName.trim() !== ''

    if (query?.lang && query?.lang === LANG_CY) {
      // Build redirect URL with query parameters to preserve context
      let redirectUrl = `/lleoliad/${locationId}/camau-lleihau-amlygiad/cy?lang=cy`
      if (hasSearchTerms) {
        redirectUrl += `&searchTerms=${encodeURIComponent(searchTerms)}`
      }
      if (hasLocationName) {
        redirectUrl += `&locationName=${encodeURIComponent(locationName)}`
      }
      return h.redirect(redirectUrl).code(REDIRECT_STATUS_CODE)
    }

    // Create dynamic back link - simple now with nested routes
    let backLinkText = backlink.text
    let backLinkUrl = '/search-location?lang=en'

    if (locationId) {
      // Build back link text: "Air pollution in {postcode}, {location}" or just one if only one available
      if (hasSearchTerms && hasLocationName) {
        backLinkText = `Air pollution in ${searchTerms}, ${locationName}`
      } else if (hasSearchTerms) {
        backLinkText = `Air pollution in ${searchTerms}`
      } else if (hasLocationName) {
        backLinkText = `Air pollution in ${locationName}`
      }
      // Back link is simply the parent location page
      backLinkUrl = `/location/${locationId}?lang=en`
    }

    return h.view('actions-reduce-exposure/index', {
      pageTitle: actionsReduceExposure.pageTitle,
      description: actionsReduceExposure.description,
      metaSiteUrl,
      actionsReduceExposure,
      page: 'Actions to reduce exposure',
      displayBacklink: !!locationId,
      customBackLink: !!locationId,
      backLinkText,
      backLinkUrl,
      locationName,
      locationId,
      phaseBanner,
      footerTxt,
      cookieBanner,
      backlink,
      serviceName: multipleLocations.serviceName,
      lang: query.lang ?? lang
    })
  }
}

export { actionsReduceExposureController }
