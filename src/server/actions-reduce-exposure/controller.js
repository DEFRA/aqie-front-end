import { english } from '../data/en/en.js'
import { LANG_CY, LANG_EN, REDIRECT_STATUS_CODE } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { formatUKPostcode } from '../locations/helpers/convert-string.js'

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

    // Restore original context-specific back link text logic
    let backLinkText = backlink.text
    let backLinkUrl = '/search-location?lang=en'

    if (locationId) {
      // Format postcode if provided
      const formattedPostcode = hasSearchTerms
        ? formatUKPostcode(searchTerms)
        : ''

      if (formattedPostcode && hasLocationName) {
        backLinkText = `Air pollution in ${formattedPostcode}, ${locationName}`
      } else if (formattedPostcode) {
        backLinkText = `Air pollution in ${formattedPostcode}`
      } else if (hasLocationName) {
        backLinkText = `Air pollution in ${locationName}`
      }
      backLinkUrl = `/location/${locationId}?lang=en`
    }

    // Replace {locationId} placeholder in healthConditionsLink
    const processedActionsReduceExposure = {
      ...actionsReduceExposure,
      healthConditionsLink: actionsReduceExposure.healthConditionsLink.replace(
        '{locationId}',
        locationId
      )
    }

    return h.view('actions-reduce-exposure/index', {
      pageTitle: actionsReduceExposure.pageTitle,
      description: actionsReduceExposure.description,
      metaSiteUrl,
      actionsReduceExposure: processedActionsReduceExposure,
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
