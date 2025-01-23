import {
  LANG_CY,
  LOCATION_NOT_FOUND,
  LOCATION_NOT_FOUND_ROUTE_CY
} from '~/src/server/data/constants' //
import { english } from '~/src/server/data/en/en.js'
import { getAirQualitySiteUrl } from '~/src/server/common/helpers/get-site-url'

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
      cookieBanner
    } = english
    const metaSiteUrl = getAirQualitySiteUrl(request)
    return h.view(LOCATION_NOT_FOUND, {
      userLocation: locationNameOrPostcode,
      serviceName: notFoundLocation.heading,
      paragraph: notFoundLocation.paragraphs,
      pageTitle: `${notFoundLocation.paragraphs.a} ${locationNameOrPostcode} - ${home.pageTitle}`,
      metaSiteUrl,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      lang: query?.lang || lang
    })
  }
}

export { locationNotFoundController }
