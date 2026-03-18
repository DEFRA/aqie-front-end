import { english } from '../data/en/en.js'
import { LANG_CY, LANG_EN, REDIRECT_STATUS_CODE } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { formatUKPostcode } from '../locations/helpers/convert-string.js'

function buildWelshRedirectUrl(
  locationId,
  searchTerms,
  locationName,
  hasSearchTerms,
  hasLocationName
) {
  let redirectUrl = `/lleoliad/${locationId}/camau-lleihau-amlygiad/cy?lang=cy`
  if (hasSearchTerms) {
    redirectUrl += `&searchTerms=${encodeURIComponent(searchTerms)}`
  }
  if (hasLocationName) {
    redirectUrl += `&locationName=${encodeURIComponent(locationName)}`
  }
  return redirectUrl
}

function buildBackLinkText(
  formattedPostcode,
  locationName,
  hasLocationName,
  defaultText
) {
  if (formattedPostcode && hasLocationName) {
    return `Air pollution in ${formattedPostcode}, ${locationName}`
  }
  if (formattedPostcode) {
    return `Air pollution in ${formattedPostcode}`
  }
  if (hasLocationName) {
    return `Air pollution in ${locationName}`
  }
  return defaultText
}

function getLocationName(query) {
  if (Array.isArray(query?.locationName)) {
    return query.locationName[0] || ''
  }

  return query?.locationName || ''
}

function getLocationContext(query = {}) {
  const searchTerms = query?.searchTerms || ''
  const locationName = getLocationName(query)

  return {
    searchTerms,
    locationName,
    hasSearchTerms: searchTerms.trim() !== '',
    hasLocationName: locationName.trim() !== ''
  }
}

function buildBackLinkData({ locationId, searchTerms, locationName, backlink }) {
  if (!locationId) {
    return {
      backLinkText: backlink.text,
      backLinkUrl: '/search-location?lang=en'
    }
  }

  const formattedPostcode = searchTerms.trim() !== '' ? formatUKPostcode(searchTerms) : ''

  return {
    backLinkText: buildBackLinkText(
      formattedPostcode,
      locationName,
      locationName.trim() !== '',
      backlink.text
    ),
    backLinkUrl: `/location/${locationId}?lang=en`
  }
}

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
    const { searchTerms, locationName, hasSearchTerms, hasLocationName } =
      getLocationContext(query)

    if (query?.lang && query?.lang === LANG_CY) {
      const redirectUrl = buildWelshRedirectUrl(
        locationId,
        searchTerms,
        locationName,
        hasSearchTerms,
        hasLocationName
      )
      return h.redirect(redirectUrl).code(REDIRECT_STATUS_CODE)
    }

    const { backLinkText, backLinkUrl } = buildBackLinkData({
      locationId,
      searchTerms,
      locationName,
      backlink
    })

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
