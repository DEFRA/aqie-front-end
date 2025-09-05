import {
  LANG_EN,
  LOCATION_NOT_FOUND,
  LOCATION_NOT_FOUND_ROUTE_EN
} from '../../data/constants.js'
import { welsh } from '../../data/cy/cy.js'

const locationNotFoundController = {
  handler: (request, h) => {
    const { query } = request
    if (query?.lang === LANG_EN) {
      return h.redirect(LOCATION_NOT_FOUND_ROUTE_EN).takeover()
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
    } = welsh
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
