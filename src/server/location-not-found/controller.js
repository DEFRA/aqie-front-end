import {
  LANG_CY,
  LOCATION_NOT_FOUND,
  LOCATION_NOT_FOUND_ROUTE_CY,
  REDIRECT_STATUS_CODE
} from '../data/constants.js' //
import { english as englishData } from '../data/en/en.js'

// '' Helper to handle Welsh language redirect
function handleWelshRedirect(h) {
  return h
    .redirect(LOCATION_NOT_FOUND_ROUTE_CY)
    .code(REDIRECT_STATUS_CODE)
    .takeover()
}

// '' Helper to extract location data from session
function getLocationData(request) {
  const locationData = request.yar.get('locationDataNotFound') || {}
  return {
    locationNameOrPostcode: locationData.locationNameOrPostcode || '',
    lang: locationData.lang || 'en'
  }
}

// '' Helper to prepare English page content
function prepareEnglishContent(languageData) {
  const {
    notFoundLocation = {},
    home = {},
    footerTxt = '',
    phaseBanner = {},
    backlink = {},
    cookieBanner = {},
    multipleLocations = {}
  } = languageData

  return {
    notFoundLocation,
    home,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    multipleLocations
  }
}

// '' Helper to build view data object
function buildViewData(locationData, content, query) {
  const { locationNameOrPostcode, lang } = locationData
  const {
    notFoundLocation,
    home,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    multipleLocations
  } = content

  return {
    userLocation: locationNameOrPostcode,
    serviceName: notFoundLocation.heading || 'Service unavailable',
    paragraph: notFoundLocation.paragraphs || {},
    pageTitle: `${notFoundLocation.paragraphs?.a || 'Error'} ${locationNameOrPostcode} - ${home.pageTitle || 'Home'}`,
    description: multipleLocations.description || '',
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    lang: query?.lang || lang
  }
}

const locationNotFoundController = {
  handler: (request, h) => {
    const { query } = request

    if (query?.lang === LANG_CY) {
      return handleWelshRedirect(h)
    }

    const locationData = getLocationData(request)
    const content = prepareEnglishContent(englishData)
    const viewData = buildViewData(locationData, content, query)

    return h.view(LOCATION_NOT_FOUND, viewData)
  }
}

export { locationNotFoundController }
