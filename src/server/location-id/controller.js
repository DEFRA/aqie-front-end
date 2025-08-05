import {
  siteTypeDescriptions,
  pollutantTypes
} from '../data/en/monitoring-sites.js'
import * as airQualityData from '../data/en/air-quality.js'
import {
  LANG_CY,
  LANG_EN,
  LOCATION_NOT_FOUND,
  LOCATION_TYPE_NI,
  LOCATION_TYPE_UK,
  REDIRECT_STATUS_CODE,
  STATUS_INTERNAL_SERVER_ERROR
} from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { english, calendarEnglish } from '../data/en/en.js'
import { calendarWelsh } from '../data/cy/cy.js'
import moment from 'moment-timezone'
import { convertFirstLetterIntoUppercase } from '../locations/helpers/convert-first-letter-into-upper-case.js'
import { gazetteerEntryFilter } from '../locations/helpers/gazetteer-util.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getSearchTermsFromUrl } from '../locations/helpers/get-search-terms-from-url.js'
import { transformKeys } from '../locations/helpers/transform-summary-keys.js'
import { airQualityValues } from '../locations/helpers/air-quality-values.js'
import { getNearestLocation } from '../locations/helpers/get-nearest-location.js'
import { getIdMatch } from '../locations/helpers/get-id-match.js'
import { getNIData } from '../locations/helpers/get-ni-single-data.js'
import { compareLastElements } from '../locations/helpers/convert-string.js'
import sizeof from 'object-sizeof'
import { config } from '../../config/index.js'

const logger = createLogger()

// Helper to handle redirection for Welsh language
function handleWelshRedirect(query, locationId, h) {
  if (query?.lang && query?.lang === LANG_CY && !query?.searchTerms) {
    return h
      .redirect(`/lleoliad/${locationId}/?lang=cy`)
      .code(REDIRECT_STATUS_CODE)
  }
  return null
}

// Helper to handle redirection if search terms are missing
function handleSearchTermsRedirect(
  headers,
  searchTermsSaved,
  currentUrl,
  request,
  h
) {
  const previousUrl = headers.referer || headers.referrer
  const isPreviousAndCurrentUrlEqual = compareLastElements(
    previousUrl,
    currentUrl
  )
  if (
    (previousUrl === undefined && !searchTermsSaved) ||
    (isPreviousAndCurrentUrlEqual && !searchTermsSaved)
  ) {
    const { searchTerms, secondSearchTerm, searchTermsLocationType } =
      getSearchTermsFromUrl(currentUrl)
    request.yar.clear('locationData')
    logger.info('Redirecting to location search')
    return h
      .redirect(
        `/location?lang=en&searchTerms=${encodeURIComponent(searchTerms)}&secondSearchTerm=${encodeURIComponent(secondSearchTerm)}&searchTermsLocationType=${encodeURIComponent(searchTermsLocationType)}`
      )
      .code(REDIRECT_STATUS_CODE)
      .takeover()
  }
  return null
}

// Helper to build view data for found location
function buildLocationViewData({
  locationDetails,
  nearestLocationsRange,
  locationData,
  forecastNum,
  lang,
  getMonth,
  metaSiteUrl
}) {
  let { title, headerTitle } = gazetteerEntryFilter(locationDetails)
  title = convertFirstLetterIntoUppercase(title)
  headerTitle = convertFirstLetterIntoUppercase(headerTitle)
  const { transformedDailySummary } = transformKeys(
    locationData.dailySummary,
    lang
  )
  const { airQuality } = airQualityValues(forecastNum, lang)
  return {
    result: locationDetails,
    airQuality,
    airQualityData: airQualityData.commonMessages,
    monitoringSites: nearestLocationsRange,
    siteTypeDescriptions,
    pollutantTypes,
    pageTitle: `${english.multipleLocations.titlePrefix} ${title} - ${english.multipleLocations.pageTitle}`,
    metaSiteUrl,
    description: `${english.daqi.description.a} ${headerTitle}${english.daqi.description.b}`,
    title: `${english.multipleLocations.titlePrefix} ${headerTitle}`,
    displayBacklink: true,
    transformedDailySummary,
    footerTxt: english.footerTxt,
    phaseBanner: english.phaseBanner,
    backlink: english.backlink,
    cookieBanner: english.cookieBanner,
    daqi: english.daqi,
    welshMonth: calendarWelsh[getMonth],
    summaryDate:
      lang === LANG_CY ? locationData.welshDate : locationData.englishDate,
    dailySummaryTexts: english.dailySummaryTexts,
    serviceName: english.multipleLocations.serviceName,
    lang
  }
}

// Helper to build view data for not found location
function buildNotFoundViewData(lang) {
  return {
    paragraph: english.notFoundLocation.paragraphs,
    serviceName: english.notFoundLocation.heading,
    footerTxt: english.footerTxt,
    phaseBanner: english.phaseBanner,
    backlink: english.backlink,
    cookieBanner: english.cookieBanner,
    lang
  }
}

// Helper to update session with nearest location and measurements
function updateSessionWithNearest(
  request,
  locationData,
  nearestLocation,
  nearestLocationsRange
) {
  // Replace the large getForecasts with a single-record version
  locationData.getForecasts = nearestLocation
  // Replace the large getMeasurements with a filtered version
  locationData.getMeasurements = nearestLocationsRange
  // Save the updated locationData back into session
  request.yar.set('locationData', locationData)
}

// Helper to get nearest location and related data
async function getNearestLocationData(
  locationData,
  getForecasts,
  locationType,
  locationId,
  lang,
  useNewRicardoMeasurementsEnabled
) {
  let distance
  if (locationData.locationType === LOCATION_TYPE_NI) {
    distance = getNearestLocation(
      locationData?.results,
      getForecasts,
      locationType,
      0,
      lang,
      useNewRicardoMeasurementsEnabled
    )
  }
  const indexNI = 0
  const { resultNI } = getNIData(locationData, distance, locationType)
  const { locationIndex, locationDetails } = getIdMatch(
    locationId,
    locationData,
    resultNI,
    locationType,
    indexNI
  )
  const { forecastNum, nearestLocationsRange, nearestLocation } =
    await getNearestLocation(
      locationData?.results,
      getForecasts,
      locationType,
      locationIndex,
      lang,
      useNewRicardoMeasurementsEnabled
    )
  return {
    locationDetails,
    forecastNum,
    nearestLocationsRange,
    nearestLocation
  }
}

const getLocationDetailsController = {
  handler: async (request, h) => {
    try {
      const { query, headers } = request
      const locationId = request.params.id
      const searchTermsSaved = request.yar.get('searchTermsSaved')
      const useNewRicardoMeasurementsEnabled = config.get(
        'useNewRicardoMeasurementsEnabled'
      )
      const currentUrl = request.url.href

      // Handle Welsh redirect
      const welshRedirect = handleWelshRedirect(query, locationId, h)
      if (welshRedirect) {
        return welshRedirect
      }

      // Handle search terms redirect
      const searchTermsRedirect = handleSearchTermsRedirect(
        headers,
        searchTermsSaved,
        currentUrl,
        request,
        h
      )
      if (searchTermsRedirect) {
        return searchTermsRedirect
      }

      request.yar.clear('searchTermsSaved')

      const lang = query?.lang ?? LANG_EN
      const formattedDate = moment().format('DD MMMM YYYY').split(' ')
      const getMonth = calendarEnglish.findIndex(
        (item) => item.indexOf(formattedDate[1]) !== -1
      )
      const metaSiteUrl = getAirQualitySiteUrl(request)
      const locationData = request.yar.get('locationData') || []
      const { getForecasts } = locationData
      const locationType =
        locationData.locationType === LOCATION_TYPE_UK
          ? LOCATION_TYPE_UK
          : LOCATION_TYPE_NI

      // Get nearest location and related data
      const {
        locationDetails,
        forecastNum,
        nearestLocationsRange,
        nearestLocation
      } = await getNearestLocationData(
        locationData,
        getForecasts,
        locationType,
        locationId,
        lang,
        useNewRicardoMeasurementsEnabled
      )

      if (locationDetails) {
        logger.info(
          `Before Session (yar) size in MB for geForecasts: ${(sizeof(request.yar._store) / (1024 * 1024)).toFixed(2)} MB`
        )
        updateSessionWithNearest(
          request,
          locationData,
          nearestLocation,
          nearestLocationsRange
        )
        logger.info(
          `After Session (yar) size in MB for geForecasts: ${(sizeof(request.yar._store) / (1024 * 1024)).toFixed(2)} MB`
        )
        return h.view(
          'locations/location',
          buildLocationViewData({
            locationDetails,
            nearestLocationsRange,
            locationData,
            forecastNum,
            lang,
            getMonth,
            metaSiteUrl
          })
        )
      } else {
        return h.view(LOCATION_NOT_FOUND, buildNotFoundViewData(lang))
      }
    } catch (error) {
      logger.error(`error on single location ${error.message}`)
      return h
        .response('Internal Server Error')
        .code(STATUS_INTERNAL_SERVER_ERROR)
    }
  }
}

export { getLocationDetailsController }
