import { welsh } from '../../data/cy/cy.js'
import { LANG_CY, LANG_EN, REDIRECT_STATUS_CODE } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'
import { formatUKPostcode } from '../../locations/helpers/convert-string.js'

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
    const { query, params } = request
    const lang = LANG_CY
    const metaSiteUrl = getAirQualitySiteUrl(request)

    // Get location ID from path parameters and location name from session/query
    const locationId = params.locationId
    const searchTerms = query?.searchTerms || ''
    const locationName = query?.locationName || ''
    const hasSearchTerms = searchTerms.trim() !== ''
    const hasLocationName = locationName.trim() !== ''

    if (query?.lang && query?.lang === LANG_EN) {
      // Build redirect URL with query parameters to preserve context
      let redirectUrl = `/location/${locationId}/actions-reduce-exposure?lang=en`
      if (hasSearchTerms) {
        redirectUrl += `&searchTerms=${encodeURIComponent(searchTerms)}`
      }
      if (hasLocationName) {
        redirectUrl += `&locationName=${encodeURIComponent(locationName)}`
      }
      return h.redirect(redirectUrl).code(REDIRECT_STATUS_CODE)
    }

    // Restore original context-specific back link text logic
    let backLinkText = backlink.text
    let backLinkUrl = '/chwilio-lleoliad/cy?lang=cy'

    if (locationId) {
      // Format postcode if provided
      const formattedPostcode = hasSearchTerms
        ? formatUKPostcode(searchTerms)
        : ''

      if (formattedPostcode && hasLocationName) {
        backLinkText = `Llygredd aer yn ${formattedPostcode}, ${locationName}`
      } else if (formattedPostcode) {
        backLinkText = `Llygredd aer yn ${formattedPostcode}`
      } else if (hasLocationName) {
        backLinkText = `Llygredd aer yn ${locationName}`
      }
      backLinkUrl = `/lleoliad/${locationId}?lang=cy`
    }

    return h.view('actions-reduce-exposure/index', {
      pageTitle: actionsReduceExposure.pageTitle,
      description: actionsReduceExposure.description,
      metaSiteUrl,
      actionsReduceExposure,
      page: 'Camau i leihau amlygiad',
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

export { actionsReduceExposureCyController }
