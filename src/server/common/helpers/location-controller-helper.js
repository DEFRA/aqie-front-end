import {
  LANG_CY,
  LANG_EN,
  LOCATION_NOT_FOUND,
  LOCATION_TYPE_NI,
  LOCATION_TYPE_UK
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
import { config } from '../../../config/index.js'
import { getForecastWarning } from '../../locations/helpers/forecast-warning.js'
import { getDetailedInfo as getDetailedInfoEn } from '../../data/en/air-quality.js'
import { getDetailedInfo as getDetailedInfoCy } from '../../data/cy/air-quality.js'

// Local helper function - duplicated to avoid circular imports
function getLocationType(locationData) {
  return locationData.locationType === LOCATION_TYPE_UK
    ? LOCATION_TYPE_UK
    : LOCATION_TYPE_NI
}

const logger = createLogger()

const MOCK_DAYS = ['today', 'day2', 'day3', 'day4', 'day5']

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

  // Initialize mock parameters in session (for mock DAQI levels and days)
  initializeMockParameters(request)

  return {
    lang,
    getMonth,
    metaSiteUrl,
    ...components
  }
}

/**
 * Store a single mock query parameter (mockLevel/mockDay) in session,
 * handling explicit clearing and the disabled-mocks warning.
 */
function storeMockQueryParam(request, paramName, value, mocksDisabled) {
  if (value === undefined) {
    return
  }

  if (mocksDisabled) {
    logger.warn(
      `Attempted to set ${paramName} when mocks disabled (disableTestMocks=true) - ignoring parameter`
    )
    return
  }

  if (value === '' || value === 'clear') {
    request.yar.set(paramName, null)
  } else {
    request.yar.set(paramName, value)
  }
}

/**
 * Initialize mock parameters in session from query parameters
 * '' Store mockLevel and mockDay in session to preserve across redirects
 */
export function initializeMockParameters(request) {
  const { query } = request
  const mocksDisabled = config.get('disableTestMocks')

  storeMockQueryParam(request, 'mockLevel', query?.mockLevel, mocksDisabled)
  storeMockQueryParam(request, 'mockDay', query?.mockDay, mocksDisabled)
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
  let resultNI
  const indexNI = 0

  if (locationData.locationType === LOCATION_TYPE_NI) {
    const distance = getNearestLocation(
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

  const { forecastNum, nearestLocationsRange, nearestLocation, latlon } =
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
    nearestLocation,
    latlon
  }
}

/**
 * Build a full 5-day mock forecast using the same level for every day.
 */
function buildFullMockForecast(getDetailedInfo, level) {
  return {
    today: getDetailedInfo(level),
    day2: getDetailedInfo(level),
    day3: getDetailedInfo(level),
    day4: getDetailedInfo(level),
    day5: getDetailedInfo(level)
  }
}

/**
 * Build a mock forecast where only a single day is overridden with the
 * mock level, keeping the other days from the existing airQuality (or a
 * default moderate level 4 forecast if none exists).
 */
function buildSingleDayMockForecast(
  getDetailedInfo,
  level,
  airQuality,
  mockDay
) {
  const modifiedAirQuality =
    airQuality && typeof airQuality === 'object'
      ? {
          today: airQuality.today ? { ...airQuality.today } : null,
          day2: airQuality.day2 ? { ...airQuality.day2 } : null,
          day3: airQuality.day3 ? { ...airQuality.day3 } : null,
          day4: airQuality.day4 ? { ...airQuality.day4 } : null,
          day5: airQuality.day5 ? { ...airQuality.day5 } : null
        }
      : buildFullMockForecast(getDetailedInfo, 4)

  modifiedAirQuality[mockDay] = getDetailedInfo(level)
  return modifiedAirQuality
}

/**
 * Check if mock level is requested and override air quality data
 * Non-intrusive: only applies mock if explicitly enabled, otherwise returns original data
 */
export function applyMockLevel(request, airQuality, lang = LANG_EN) {
  // Disable mock functionality when configured (production by default)
  if (config.get('disableTestMocks')) {
    return airQuality
  }

  const mockLevel = request.yar.get('mockLevel')
  if (mockLevel === undefined || mockLevel === null) {
    return airQuality
  }

  const level = parseInt(mockLevel, 10)
  if (isNaN(level) || level < 0 || level > 10) {
    logger.warn(`Invalid mock level: ${mockLevel}. Must be 0-10.`)
    return airQuality
  }

  const getDetailedInfo =
    lang === LANG_CY ? getDetailedInfoCy : getDetailedInfoEn
  const mockDay = request.yar.get('mockDay')

  if (mockDay && MOCK_DAYS.includes(mockDay)) {
    return buildSingleDayMockForecast(
      getDetailedInfo,
      level,
      airQuality,
      mockDay
    )
  }

  return buildFullMockForecast(getDetailedInfo, level)
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
  pollutantTypes,
  request,
  locationId,
  latlon: latlonParam = null,
  locationAlert = null,
  daqiAlert = null
}) {
  let { title, headerTitle } = gazetteerEntryFilter(locationDetails)
  title = convertFirstLetterIntoUppercase(title)
  headerTitle = convertFirstLetterIntoUppercase(headerTitle)

  const { transformedDailySummary } = transformKeys(
    locationData.dailySummary,
    lang
  )
  let { airQuality } = airQualityValues(forecastNum, lang)

  // Apply mock level if requested (pass lang for language-specific mock data)
  airQuality = applyMockLevel(request, airQuality, lang)

  // Get forecast warning for high/very high pollution levels
  const forecastWarning = getForecastWarning(airQuality, lang)

  const components = UI_COMPONENTS[lang]

  // Get searchTerms and locationName from request query for back link context
  const searchTerms = request?.query?.searchTerms || ''
  const locationNameFromQuery = request?.query?.locationName || ''

  const latlon = latlonParam ?? locationData?.latlon ?? null

  return {
    result: locationDetails,
    airQuality,
    forecastWarning,
    airQualityData: airQualityData.commonMessages,
    monitoringSites: nearestLocationsRange,
    siteTypeDescriptions,
    pollutantTypes,
    pageTitle: `${components.multipleLocations.titlePrefix} ${title} - ${components.multipleLocations.pageTitle}`,
    metaSiteUrl,
    description: `${components.daqi.description.a} ${headerTitle}${components.daqi.description.b}`,
    title: `${components.multipleLocations.titlePrefix} ${headerTitle}`,
    headerTitle,
    locationName: locationNameFromQuery || headerTitle,
    locationId,
    latlon,
    searchTerms,
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
    showSummaryDate: locationData.showSummaryDate,
    issueTime: locationData.issueTime,
    dailySummaryTexts: components.dailySummaryTexts,
    serviceName: components.multipleLocations.serviceName,
    locationAlert,
    daqiAlert,
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
  // Replace the large getForecasts with a single-record version
  locationData.getForecasts = nearestLocation
  // Replace the large getMeasurements with a filtered version
  locationData.getMeasurements = nearestLocationsRange
  // Save the updated locationData back into session
  request.yar.set('locationData', locationData)
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
