import { welsh } from '../../data/cy/cy.js'
import { LANG_CY, LANG_EN, REDIRECT_STATUS_CODE } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

const actionsReduceExposureCyController = {
  handler: (request, h) => {
    const { actionsReduceExposure } = welsh
    const {
      footerTxt,
      cookieBanner,
      phaseBanner,
      multipleLocations,
      backlink
    } = welsh
    const { query } = request
    const lang = LANG_CY
    const metaSiteUrl = getAirQualitySiteUrl(request)

    // Get location name from query parameters
    const locationName = query?.locationName || query?.searchTerms || ''
    const hasLocationName = locationName.trim() !== ''

    if (query?.lang && query?.lang === LANG_EN) {
      const redirectUrl = hasLocationName
        ? `/actions-reduce-exposure?lang=en&locationName=${encodeURIComponent(locationName)}`
        : `/actions-reduce-exposure?lang=en`
      return h.redirect(redirectUrl).code(REDIRECT_STATUS_CODE)
    }

    // Create dynamic back link text and URL
    let backLinkText = backlink.text
    let backLinkUrl = '/chwilio-lleoliad/cy?lang=cy'

    if (hasLocationName) {
      backLinkText = `Llygredd aer yn ${locationName}`
      // Create direct link back to location page instead of history.back()
      const locationSlug = locationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
      backLinkUrl = `/lleoliad/${locationSlug}?lang=cy`
    }

    return h.view('actions-reduce-exposure/index', {
      pageTitle: actionsReduceExposure.pageTitle,
      description: actionsReduceExposure.description,
      metaSiteUrl,
      actionsReduceExposure,
      page: 'Camau i leihau amlygiad',
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

export { actionsReduceExposureCyController }
