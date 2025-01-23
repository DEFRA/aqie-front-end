import { createLogger } from '~/src/server/common/helpers/logging/logger'
import { english } from '~/src/server/data/en/en.js'
import {
  LANG_CY,
  MULTIPLE_LOCATIONS_ROUTE_CY
} from '~/src/server/data/constants'
import { getAirQualitySiteUrl } from '~/src/server/common/helpers/get-site-url'

const logger = createLogger()

const getLocationDataController = {
  handler: async (request, h) => {
    const locationData = request.yar.get('locationData') || []
    const {
      results,
      monitoringSites,
      forecastSummary,
      calendarWelsh,
      englishDate,
      welshDate,
      getMonth,
      lang,
      userLocation
    } = locationData
    const {
      backlink,
      cookieBanner,
      phaseBanner,
      footerTxt,
      multipleLocations,
      dailySummary,
      siteTypeDescriptions,
      pollutantTypes
    } = english
    const { query } = request

    if (query?.lang === LANG_CY) {
      return h.redirect(MULTIPLE_LOCATIONS_ROUTE_CY)
    }
    const metaSiteUrl = getAirQualitySiteUrl(request)

    try {
      return h.view('multiple-results/multiple-locations', {
        results,
        title: multipleLocations.title,
        paragraphs: multipleLocations.paragraphs,
        userLocation,
        monitoringSites,
        siteTypeDescriptions,
        pollutantTypes,
        pageTitle: `${multipleLocations.title} ${userLocation} -  ${multipleLocations.pageTitle}`,
        metaSiteUrl,
        serviceName: multipleLocations.serviceName,
        forecastSummary,
        dailySummary,
        footerTxt,
        phaseBanner,
        backlink,
        cookieBanner,
        welshMonth: calendarWelsh[getMonth],
        summaryDate: lang === LANG_CY ? welshDate : englishDate,
        lang: 'en'
      })
    } catch (error) {
      logger.error(
        `error from location refresh outside fetch APIs: ${error.message}`
      )
      let statusCode = 500
      if (
        error.message ===
        "Cannot read properties of undefined (reading 'access_token')"
      ) {
        statusCode = 401
      }
      return h.view('error/index', {
        pageTitle: english.notFoundUrl.serviceAPI.pageTitle,
        metaSiteUrl,
        footerTxt,
        url: request.path,
        phaseBanner,
        displayBacklink: false,
        cookieBanner,
        serviceName: english.multipleLocations.serviceName,
        notFoundUrl: english.notFoundUrl,
        statusCode,
        lang
      })
    }
  }
}

export { getLocationDataController }
