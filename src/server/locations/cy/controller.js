import { getAirQualityCy } from '../../data/cy/air-quality.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { welsh } from '../../data/cy/cy.js'
import {
  LANG_CY,
  LANG_EN,
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI,
  LOCATION_NOT_FOUND,
  REDIRECT_STATUS_CODE
} from '../../data/constants.js'

const logger = createLogger()

const getLocationDataController = {
  handler: async (request, h) => {
    const { query, path } = request
    const tempString = request?.headers?.referer?.split('/')[3]
    const str = tempString?.split('?')[0]
    let lang = query?.lang?.slice(0, 2)
    if (lang !== LANG_CY && lang !== LANG_EN && path === '/lleoliad') {
      lang = LANG_CY
    }
    if (query?.lang && query?.lang === LANG_EN) {
      return h.redirect(`/location?lang=en`).code(REDIRECT_STATUS_CODE)
    }
    const {
      searchLocation,
      notFoundLocation,
      footerTxt,
      phaseBanner,
      backlink,
      home,
      cookieBanner
    } = welsh
    let locationType = request?.payload?.locationType
    const airQuality = getAirQualityCy(request.payload?.aq, 2, 4, 5, 7)
    let locationNameOrPostcode = ''
    if (locationType === LOCATION_TYPE_UK) {
      locationNameOrPostcode = request.payload.engScoWal.trim()
    } else if (locationType === LOCATION_TYPE_NI) {
      locationNameOrPostcode = request.payload.ni
    }
    if (!locationType && str !== 'chwilio-lleoliad') {
      locationType = request.yar.get('locationType')
      locationNameOrPostcode = request.yar.get('locationNameOrPostcode')
    } else {
      request.yar.set('locationType', locationType)
      request.yar.set('locationNameOrPostcode', locationNameOrPostcode)
      request.yar.set('airQuality', airQuality)
    }
    if (!locationNameOrPostcode && !locationType) {
      request.yar.set('locationType', '')
      if (str === 'chwilio-lleoliad') {
        return h
          .redirect(`/chwilio-lleoliad/cy?lang=cy`)
          .code(REDIRECT_STATUS_CODE)
      }
    }
    try {
      return h.view(LOCATION_NOT_FOUND, {
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
        serviceName: welsh.multipleLocations.serviceName,
        notFoundUrl: welsh.notFoundUrl,
        lang
      })
    }
  }
}

export { getLocationDataController }
