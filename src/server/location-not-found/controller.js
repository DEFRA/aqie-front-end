import {
  LANG_CY,
  LOCATION_NOT_FOUND,
  LOCATION_NOT_FOUND_ROUTE_CY
} from '../data/constants.js' //
import { english } from '../data/en/en.js'

const locationNotFoundController = {
  handler: (request, h) => {
    const { query } = request
    if (query?.lang === LANG_CY) {
      return h.redirect(LOCATION_NOT_FOUND_ROUTE_CY).takeover()
    }
    const locationData = request.yar.get('locationDataNotFound') || {}
    const { locationNameOrPostcode = 'Unknown location', lang = 'en' } =
      locationData
    const {
      notFoundLocation = {},
      home = {},
      footerTxt = '',
      phaseBanner = {},
      backlink = {},
      cookieBanner = {},
      multipleLocations = {}
    } = english
    return h.view(LOCATION_NOT_FOUND, {
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
    })
  }
}

export { locationNotFoundController }
