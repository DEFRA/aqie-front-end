import { createLogger } from '~/src/server/common/helpers/logging/logger'
import { english } from '~/src/server/data/en/en.js'
import { welsh } from '~/src/server/data/cy/cy.js'
import {
  LANG_CY,
  LANG_EN,
  MULTIPLE_LOCATIONS_ROUTE_EN
} from '~/src/server/data/constants'
import { getAirQualitySiteUrl } from '~/src/server/common/helpers/get-site-url'

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
      summaryDate,
      lang,
      userLocation
    } = locationData
    const {
      backlink,
      cookieBanner,
      footerTxt,
      phaseBanner,
      multipleLocations,
      dailySummary,
      siteTypeDescriptions,
      pollutantTypes
    } = welsh

    const { query } = request
    if (query?.lang === LANG_EN) {
      return h.redirect(MULTIPLE_LOCATIONS_ROUTE_EN)
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
        summaryDate:
          lang === LANG_CY
            ? welshDate ?? summaryDate
            : englishDate ?? summaryDate,
        lang: LANG_CY
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
