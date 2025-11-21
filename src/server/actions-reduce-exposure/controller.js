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
    const { query } = request
    const lang = LANG_EN
    const metaSiteUrl = getAirQualitySiteUrl(request)

    // Get location name from query parameters
    const locationName = query?.locationName || query?.searchTerms || ''
    const hasLocationName = locationName.trim() !== ''

    if (query?.lang && query?.lang === LANG_CY) {
      const redirectUrl = hasLocationName
        ? `/camau-lleihau-amlygiad/cy?lang=cy&locationName=${encodeURIComponent(locationName)}`
        : `/camau-lleihau-amlygiad/cy?lang=cy`
      return h.redirect(redirectUrl).code(REDIRECT_STATUS_CODE)
    }

    // Create dynamic back link text and URL
    let backLinkText = backlink.text
    let backLinkUrl = '/search-location?lang=en'

    if (hasLocationName) {
      backLinkText = `Air pollution in ${locationName}`
      // Create direct link back to location page instead of history.back()
      const locationSlug = locationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
      backLinkUrl = `/location/${locationSlug}?lang=en`
    }

    return h.view('actions-reduce-exposure/index', {
      pageTitle: actionsReduceExposure.pageTitle,
      description: actionsReduceExposure.description,
      metaSiteUrl,
      actionsReduceExposure,
      page: 'Actions to reduce exposure',
      displayBacklink: hasLocationName,
      customBackLink: hasLocationName,
      backLinkText,
      backLinkUrl,
      locationName,
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
