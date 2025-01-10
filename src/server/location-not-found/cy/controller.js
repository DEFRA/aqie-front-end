import { LOCATION_NOT_FOUND } from '~/src/server/data/constants'
import { english } from '~/src/server/data/en/en.js'

const locationNotFoundController = {
  handler: (request, h) => {
    const locationData = request.yar.get('locationDataNotFound') || []
    const { locationNameOrPostcode, lang } = locationData
    const {
      notFoundLocation,
      home,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner
    } = english
    return h.view(LOCATION_NOT_FOUND, {
      userLocation: locationNameOrPostcode,
      serviceName: notFoundLocation.heading,
      paragraph: notFoundLocation.paragraphs,
      pageTitle: `${notFoundLocation.paragraphs.a} ${locationNameOrPostcode} - ${home.pageTitle}`,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      lang
    })
  }
}

export { locationNotFoundController }
