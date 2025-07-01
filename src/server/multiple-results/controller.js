import { createLogger } from '../common/helpers/logging/logger.js'
import { english } from '../data/en/en.js'
import { LANG_CY, MULTIPLE_LOCATIONS_ROUTE_CY } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

const logger = createLogger()

const getLocationDataController = {
  handler: async (request, h) => {
    const locationData = request.yar.get('locationData') || []
    const {
      results,
      monitoringSites,
      transformedDailySummary,
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
      return h.redirect(MULTIPLE_LOCATIONS_ROUTE_CY).code(301)
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
        description: multipleLocations.description,
        serviceName: multipleLocations.serviceName,
        transformedDailySummary,
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
