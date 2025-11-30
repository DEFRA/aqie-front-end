import { createLogger } from '../common/helpers/logging/logger.js'
import { english } from '../data/en/en.js'
import {
  LANG_CY,
  MULTIPLE_LOCATIONS_ROUTE_CY,
  REDIRECT_STATUS_CODE,
  STATUS_UNAUTHORIZED,
  STATUS_INTERNAL_SERVER_ERROR
} from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

const logger = createLogger()

const buildMultipleLocationsViewModel = (
  locationData,
  languageData,
  metaSiteUrl
) => {
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
  } = languageData

  return {
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
    currentPath: '/multiple-results',
    lang: 'en'
  }
}

const buildErrorViewModel = (languageData, request, lang, statusCode) => {
  const {
    footerTxt,
    phaseBanner,
    cookieBanner,
    multipleLocations,
    notFoundUrl
  } = languageData
  return {
    pageTitle: notFoundUrl.serviceAPI.pageTitle,
    footerTxt,
    url: request.path,
    phaseBanner,
    displayBacklink: false,
    cookieBanner,
    serviceName: multipleLocations.serviceName,
    notFoundUrl,
    statusCode,
    lang
  }
}

const getLocationDataController = {
  handler: async (request, h) => {
    const locationData = request.yar.get('locationData') || []
    const { query } = request

    if (query?.lang === LANG_CY) {
      return h.redirect(MULTIPLE_LOCATIONS_ROUTE_CY).code(REDIRECT_STATUS_CODE)
    }

    const metaSiteUrl = getAirQualitySiteUrl(request)

    try {
      const viewModel = buildMultipleLocationsViewModel(
        locationData,
        english,
        metaSiteUrl
      )
      return h.view('multiple-results/multiple-locations', viewModel)
    } catch (error) {
      logger.error(
        `error from location refresh outside fetch APIs: ${error.message}`
      )
      const statusCode =
        error.message ===
        "Cannot read properties of undefined (reading 'access_token')"
          ? STATUS_UNAUTHORIZED
          : STATUS_INTERNAL_SERVER_ERROR
      const errorViewModel = buildErrorViewModel(
        english,
        request,
        locationData.lang,
        statusCode
      )
      return h.view('error/index', errorViewModel)
    }
  }
}

export { getLocationDataController }
