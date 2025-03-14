import { getAirQuality } from '~/src/server/data/en/air-quality.js'
import { english } from '~/src/server/data/en/en.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import {
  LANG_CY,
  LANG_EN,
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI
} from '~/src/server/data/constants'

const logger = createLogger()

const getLocationDataController = {
  handler: async (request, h) => {
    const { query, path } = request
    const tempString = request?.headers?.referer?.split('/')[3]
    const str = tempString?.split('?')[0]
    let lang = query?.lang?.slice(0, 2)
    if (lang !== LANG_CY && lang !== LANG_EN && path === '/location') {
      lang = LANG_EN
    }

    if (query?.lang && query?.lang === LANG_CY) {
      return h.redirect(`/lleoliad?lang=cy`)
    }
    const {
      searchLocation,
      notFoundLocation,
      footerTxt,
      phaseBanner,
      backlink,
      home,
      cookieBanner
    } = english
    let locationType = request?.payload?.locationType
    const airQuality = getAirQuality(request.payload?.aq, 2, 4, 5, 7)
    let locationNameOrPostcode = ''
    if (locationType === LOCATION_TYPE_UK) {
      locationNameOrPostcode = request.payload.engScoWal.trim()
    } else if (locationType === LOCATION_TYPE_NI) {
      locationNameOrPostcode = request.payload.ni
    }
    if (!locationType && str !== 'search-location') {
      locationType = request.yar.get('locationType')
      locationNameOrPostcode = request.yar.get('locationNameOrPostcode')
    } else {
      request.yar.set('locationType', locationType)
      request.yar.set('locationNameOrPostcode', locationNameOrPostcode)
      request.yar.set('airQuality', airQuality)
    }
    if (!locationNameOrPostcode && !locationType) {
      request.yar.set('locationType', '')
      if (str === 'search-location') {
        return h.redirect(`/search-location/?lang=en`)
      }
    }
    try {
      return h.view('location-not-found/index', {
        userLocation: locationNameOrPostcode,
        pageTitle: `${notFoundLocation.paragraphs.a} ${locationNameOrPostcode} - ${home.pageTitle}`,
        paragraph: notFoundLocation.paragraphs,
        footerTxt,
        serviceName: searchLocation.serviceName,
        phaseBanner,
        backlink,
        cookieBanner,
        lang: request.query?.lang ?? lang
      })
    } catch (error) {
      logger.error(`error from location refresh ${error.message}`)
      return h.view('error/index', {
        footerTxt,
        url: request.path,
        phaseBanner,
        displayBacklink: false,
        cookieBanner,
        serviceName: english.multipleLocations.serviceName,
        notFoundUrl: english.notFoundUrl,
        lang
      })
    }
  }
}

export { getLocationDataController }
