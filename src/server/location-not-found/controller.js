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
      return h.redirect(LOCATION_NOT_FOUND_ROUTE_CY)
    }
    const locationData = request.yar.get('locationDataNotFound') || []
    const { locationNameOrPostcode, lang } = locationData
    const {
      notFoundLocation,
      home,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      multipleLocations
    } = english
    return h.view(LOCATION_NOT_FOUND, {
      userLocation: locationNameOrPostcode,
      serviceName: notFoundLocation.heading,
      paragraph: notFoundLocation.paragraphs,
      pageTitle: `${notFoundLocation.paragraphs.a} ${locationNameOrPostcode} - ${home.pageTitle}`,
      description: multipleLocations.description,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      lang: query?.lang || lang
    })
  }
}

export { locationNotFoundController }
