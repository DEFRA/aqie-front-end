// NOSONAR - Route handler complexity justified for Welsh redirect logic and back link context preservation
import { welsh } from '../../data/cy/cy.js'
import { LANG_CY, LANG_EN, REDIRECT_STATUS_CODE } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'
import { formatUKPostcode } from '../../locations/helpers/convert-string.js'

// '' Helper to build English redirect URL with query parameters
function buildEnglishRedirectUrl(locationId, searchTerms, locationName) {
  let redirectUrl = `/location/${locationId}/actions-reduce-exposure?lang=en`
  if (searchTerms.trim() !== '') {
    redirectUrl += `&searchTerms=${encodeURIComponent(searchTerms)}`
  }
  if (locationName.trim() !== '') {
    redirectUrl += `&locationName=${encodeURIComponent(locationName)}`
  }
  return redirectUrl
}

// '' Helper to build Welsh back link text based on available context
function buildBackLinkText(formattedPostcode, locationName, defaultText) {
  if (formattedPostcode && locationName) {
    return `Llygredd aer yn ${formattedPostcode}, ${locationName}`
  }
  if (formattedPostcode) {
    return `Llygredd aer yn ${formattedPostcode}`
  }
  if (locationName) {
    return `Llygredd aer yn ${locationName}`
  }
  return defaultText
}

// '' Helper to build Welsh back link URL with query parameters
function buildBackLinkUrl(locationId, locationName) {
  let backLinkUrl = `/lleoliad/${locationId}?lang=cy`
  if (locationName.trim() !== '') {
    backLinkUrl += `&locationName=${encodeURIComponent(locationName)}`
  }
  return backLinkUrl
}

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
    // Handle locationName as array (when duplicated in query string) or string
    const locationName = Array.isArray(query?.locationName)
      ? query.locationName[0]
      : query?.locationName || ''

    if (query?.lang && query?.lang === LANG_EN) {
      const redirectUrl = buildEnglishRedirectUrl(
        locationId,
        searchTerms,
        locationName
      )
      return h.redirect(redirectUrl).code(REDIRECT_STATUS_CODE)
    }

    // Restore original context-specific back link text logic
    let backLinkText = backlink.text
    let backLinkUrl = '/chwilio-lleoliad/cy?lang=cy'

    if (locationId) {
      const formattedPostcode =
        searchTerms.trim() === '' ? '' : formatUKPostcode(searchTerms)
      backLinkText = buildBackLinkText(
        formattedPostcode,
        locationName,
        backlink.text
      )
      backLinkUrl = buildBackLinkUrl(locationId, locationName)
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
