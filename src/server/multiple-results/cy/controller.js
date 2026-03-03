import { createLogger } from '../../common/helpers/logging/logger.js'
import { english } from '../../data/en/en.js'
import { welsh } from '../../data/cy/cy.js'
import {
  LANG_CY,
  LANG_EN,
  MULTIPLE_LOCATIONS_ROUTE_EN,
  REDIRECT_STATUS_CODE
} from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

const logger = createLogger()

const handleError = (
  h,
  error,
  request,
  lang,
  footerTxt,
  phaseBanner,
  cookieBanner
) => {
  logger.error(
    `error from location refresh outside fetch APIs: ${error.message}`
  )
  let statusCode = 500
  if (
    error.message ===
    "Cannot read properties of undefined (reading 'access_token')"
  ) {
    const HTTP_UNAUTHORIZED = 401
    statusCode = HTTP_UNAUTHORIZED
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
      return h.redirect(MULTIPLE_LOCATIONS_ROUTE_EN).code(REDIRECT_STATUS_CODE)
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
            ? (welshDate ?? summaryDate)
            : (englishDate ?? summaryDate),
        currentPath: '/canlyniadau-lluosog/cy',
        lang: LANG_CY
      })
    } catch (error) {
      return handleError(
        h,
        error,
        request,
        lang,
        footerTxt,
        phaseBanner,
        cookieBanner
      )
    }
  }
}

export { getLocationDataController }
