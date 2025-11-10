import {
  LANG_CY,
  LANG_EN,
  LOCATION_NOT_FOUND,
  LOCATION_TYPE_NI,
  LOCATION_TYPE_UK,
  REDIRECT_STATUS_CODE
} from '../../data/constants.js'
import { getAirQualitySiteUrl } from './get-site-url.js'
import { english, calendarEnglish } from '../../data/en/en.js'
import { welsh, calendarWelsh } from '../../data/cy/cy.js'
import moment from 'moment-timezone'
import { convertFirstLetterIntoUppercase } from '../../locations/helpers/convert-first-letter-into-upper-case.js'
import { gazetteerEntryFilter } from '../../locations/helpers/gazetteer-util.js'
import { transformKeys } from '../../locations/helpers/transform-summary-keys.js'
import { airQualityValues } from '../../locations/helpers/air-quality-values.js'
import { getNearestLocation } from '../../locations/helpers/get-nearest-location.js'
import { getIdMatch } from '../../locations/helpers/get-id-match.js'
import { getNIData } from '../../locations/helpers/get-ni-single-data.js'
import { createLogger } from './logging/logger.js'
import sizeof from 'object-sizeof'

// Local helper function - duplicated to avoid circular imports
function getLocationType(locationData) {
  return locationData.locationType === LOCATION_TYPE_UK
    ? LOCATION_TYPE_UK
    : LOCATION_TYPE_NI
}

const logger = createLogger()

// Common UI component constants for both languages
const UI_COMPONENTS = {
  [LANG_EN]: {
    notFoundLocation: english.notFoundLocation,
    footerTxt: english.footerTxt,
    phaseBanner: english.phaseBanner,
    backlink: english.backlink,
    cookieBanner: english.cookieBanner,
    daqi: english.daqi,
    multipleLocations: english.multipleLocations,
    dailySummaryTexts: english.dailySummaryTexts,
    calendar: calendarEnglish
  },
  [LANG_CY]: {
    notFoundLocation: welsh.notFoundLocation,
    footerTxt: welsh.footerTxt,
    phaseBanner: welsh.phaseBanner,
    backlink: welsh.backlink,
    cookieBanner: welsh.cookieBanner,
    daqi: welsh.daqi,
    multipleLocations: welsh.multipleLocations,
    dailySummaryTexts: welsh.dailySummaryTexts,
    calendar: calendarWelsh
  }
}

/**
 * Initialize common variables for location controller
 */
export function initializeLocationVariables(request, lang) {
  request.yar.clear('searchTermsSaved')
  const formattedDate = moment().format('DD MMMM YYYY').split(' ')
  const getMonth = calendarEnglish.findIndex((item) =>
    item.includes(formattedDate[1])
  )
  const metaSiteUrl = getAirQualitySiteUrl(request)
  const components = UI_COMPONENTS[lang]

  return {
    lang,
    getMonth,
    metaSiteUrl,
    ...components
  }
}

/**
 * Process location data for both English and Welsh controllers
 */
export async function processLocationData(
  request,
  locationData,
  locationId,
  lang,
  useNewRicardoMeasurementsEnabled
) {
  const { getForecasts } = locationData
  const locationType = getLocationType(locationData)
  let distance
  let resultNI
  const indexNI = 0

  if (locationData.locationType === LOCATION_TYPE_NI) {
    distance = getNearestLocation(
      locationData?.results,
      getForecasts,
      locationType,
      0,
      lang,
      useNewRicardoMeasurementsEnabled,
      request
    )
    const niDataResult = getNIData(locationData, distance, locationType)
    resultNI = niDataResult.resultNI
  }

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
      useNewRicardoMeasurementsEnabled,
      request
    )

  return {
    locationDetails,
    forecastNum,
    nearestLocationsRange,
    nearestLocation
  }
}

/**
 * Build common view data for location display
 */
export function buildLocationViewData({
  locationDetails,
  nearestLocationsRange,
  locationData,
  forecastNum,
  lang,
  getMonth,
  metaSiteUrl,
  airQualityData,
  siteTypeDescriptions,
  pollutantTypes
}) {
  let { title, headerTitle } = gazetteerEntryFilter(locationDetails)
  title = convertFirstLetterIntoUppercase(title)
  headerTitle = convertFirstLetterIntoUppercase(headerTitle)

  const { transformedDailySummary } = transformKeys(
    locationData.dailySummary,
    lang
  )
  const { airQuality } = airQualityValues(forecastNum, lang)
  const components = UI_COMPONENTS[lang]

  return {
    result: locationDetails,
    airQuality,
    airQualityData: airQualityData.commonMessages,
    monitoringSites: nearestLocationsRange,
    siteTypeDescriptions,
    pollutantTypes,
    pageTitle: `${components.multipleLocations.titlePrefix} ${title} - ${components.multipleLocations.pageTitle}`,
    metaSiteUrl,
    description: `${components.daqi.description.a} ${headerTitle}${components.daqi.description.b}`,
    title: `${components.multipleLocations.titlePrefix} ${headerTitle}`,
    displayBacklink: true,
    transformedDailySummary,
    footerTxt: components.footerTxt,
    phaseBanner: components.phaseBanner,
    backlink: components.backlink,
    cookieBanner: components.cookieBanner,
    daqi: components.daqi,
    welshMonth: components.calendar[getMonth],
    summaryDate:
      lang === LANG_CY
        ? (locationData.welshDate ?? locationData.summaryDate)
        : (locationData.englishDate ?? locationData.summaryDate),
    dailySummaryTexts: components.dailySummaryTexts,
    serviceName: components.multipleLocations.serviceName,
    lang
  }
}

/**
 * Render location view with common patterns
 */
export function renderLocationView(h, viewData) {
  return h.view('locations/location', viewData)
}

/**
 * Build not found view data
 */
export function buildNotFoundViewData(lang) {
  const components = UI_COMPONENTS[lang]

  return {
    paragraph: components.notFoundLocation.paragraphs,
    serviceName: components.notFoundLocation.heading,
    footerTxt: components.footerTxt,
    phaseBanner: components.phaseBanner,
    backlink: components.backlink,
    cookieBanner: components.cookieBanner,
    lang
  }
}

/**
 * Render not found view with common patterns
 */
export function renderNotFoundView(h, lang) {
  return h.view(LOCATION_NOT_FOUND, buildNotFoundViewData(lang))
}

/**
 * Optimize location data in session to reduce memory usage
 */
export function optimizeLocationDataInSession(
  request,
  locationData,
  nearestLocation,
  nearestLocationsRange
) {
  logger.info(
    `Before Session (yar) size in MB for getForecasts: ${(sizeof(request.yar._store) / (1024 * 1024)).toFixed(2)} MB`
  )

  // Replace the large getForecasts with a single-record version
  locationData.getForecasts = nearestLocation
  // Replace the large getMeasurements with a filtered version
  locationData.getMeasurements = nearestLocationsRange
  // Save the updated locationData back into session
  request.yar.set('locationData', locationData)

  logger.info(
    `After Session (yar) size in MB for getForecasts: ${(sizeof(request.yar._store) / (1024 * 1024)).toFixed(2)} MB`
  )
}

/**
 * Check if should redirect to English version
 */
export function shouldRedirectToEnglish(query) {
  return query?.lang && query?.lang === LANG_EN && !query?.searchTerms
}

/**
 * Get previous URL from request headers
 */
export function getPreviousUrl(request) {
  return request.headers.referer || request.headers.referrer
}

/**
 * Build redirect URL for missing search terms
 */
export function buildRedirectUrl(currentUrl) {
  const url = new URL(currentUrl)
  const searchParams = url.searchParams
  const searchTerms = searchParams.get('searchTerms') || ''
  const secondSearchTerm = searchParams.get('secondSearchTerm') || ''
  const searchTermsLocationType =
    searchParams.get('searchTermsLocationType') || ''

  return `/location?lang=en&searchTerms=${encodeURIComponent(searchTerms)}&secondSearchTerm=${encodeURIComponent(secondSearchTerm)}&searchTermsLocationType=${encodeURIComponent(searchTermsLocationType)}`
}
