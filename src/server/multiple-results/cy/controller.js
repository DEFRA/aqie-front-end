import { createLogger } from '~/src/server/common/helpers/logging/logger'
import { english } from '~/src/server/data/en/en.js'
import { handleRedirect } from '~/src/server/locations/helpers/location-type-util'
import { LANG_CY, LANG_EN } from '~/src/server/data/constants'

const logger = createLogger()

const getLocationDataController = {
  handler: async (request, h) => {
    const locationData = request.yar.get('locationData') || []
    const {
      results,
      monitoringSites,
      airQuality,
      airQualityData,
      backlink,
      cookieBanner,
      footerTxt,
      phaseBanner,
      multipleLocations,
      dailySummary,
      forecastSummary,
      calendarWelsh,
      englishDate,
      welshDate,
      siteTypeDescriptions,
      pollutantTypes,
      getMonth,
      summaryDate,
      lang,
      userLocation
    } = locationData
    const { query } = request
    if (lang === LANG_EN) {
      const redirectResponse = handleRedirect(query, h)
      if (redirectResponse) {
        return redirectResponse
      }
    }

    try {
      return h.view('multiple-results/multiple-locations', {
        results,
        title: multipleLocations.title,
        paragraphs: multipleLocations.paragraphs,
        userLocation,
        airQuality,
        airQualityData: airQualityData.commonMessages,
        monitoringSites,
        siteTypeDescriptions,
        pollutantTypes,
        pageTitle: `${multipleLocations.title} ${userLocation} -  ${multipleLocations.pageTitle}`,
        serviceName: multipleLocations.serviceName,
        forecastSummary,
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
