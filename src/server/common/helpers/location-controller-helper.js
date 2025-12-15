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
import sizeof from 'object-sizeof'
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

  // '' Initialize mock parameters in session (for mock DAQI levels and days)
  initializeMockParameters(request)

  return {
    lang,
    getMonth,
    metaSiteUrl,
    ...components
  }
}

/**
 * Handle setting a mock parameter in session
 * @param {object} request - Hapi request object
 * @param {string} paramName - Name of the parameter (mockLevel or mockDay)
 * @param {*} paramValue - Value of the parameter
 * @param {string} displayName - Display name for logging
 */
function handleMockParameter(request, paramName, paramValue, displayName) {
  const isClearValue = paramValue === '' || paramValue === 'clear'

  if (isClearValue) {
    request.yar.set(paramName, null)
    logger.info(`🎨 ${displayName} explicitly cleared from session`)
    return
  }

  request.yar.set(paramName, paramValue)
  logger.info(`🎨 ${displayName} ${paramValue} stored in session`)
}

/**
 * Initialize mock parameters in session from query parameters
 * '' Store mockLevel and mockDay in session to preserve across redirects
 */
export function initializeMockParameters(request) {
  const { query } = request
  const mocksDisabled = config.get('disableTestMocks')

  // Handle mockLevel parameter
  if (query?.mockLevel !== undefined) {
    if (mocksDisabled) {
      logger.warn(
        `🚫 Attempted to set mock level when mocks disabled (disableTestMocks=true) - ignoring parameter`
      )
    } else {
      handleMockParameter(request, 'mockLevel', query.mockLevel, 'Mock level')
    }
  }

  // Handle mockDay parameter
  if (query?.mockDay !== undefined) {
    if (mocksDisabled) {
      logger.warn(
        `🚫 Attempted to set mock day when mocks disabled (disableTestMocks=true) - ignoring parameter`
      )
    } else {
      handleMockParameter(request, 'mockDay', query.mockDay, 'Mock day')
    }
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
 * Validate and parse mock level value
 * @returns {number|null} - Valid level (0-10) or null if invalid
 */
function parseAndValidateMockLevel(mockLevel) {
  if (mockLevel === undefined || mockLevel === null) {
    return null
  }

  const level = Number.parseInt(mockLevel, 10)
  logger.info(`🔍 Parsed level:`, level, `isNaN:`, Number.isNaN(level))

  if (Number.isNaN(level) || level < 0 || level > 10) {
    logger.warn(`Invalid mock level: ${mockLevel}. Must be 0-10.`)
    return null
  }

  return level
}

/**
 * Apply mock level to a specific day only
 */
function applyMockToSpecificDay(airQuality, mockDay, level, getDetailedInfo) {
  const mockDayData = getDetailedInfo(level)

  // Start with existing airQuality or generate default forecast
  const modifiedAirQuality =
    airQuality && typeof airQuality === 'object'
      ? {
          today: airQuality.today ? { ...airQuality.today } : null,
          day2: airQuality.day2 ? { ...airQuality.day2 } : null,
          day3: airQuality.day3 ? { ...airQuality.day3 } : null,
          day4: airQuality.day4 ? { ...airQuality.day4 } : null,
          day5: airQuality.day5 ? { ...airQuality.day5 } : null
        }
      : {
          today: getDetailedInfo(4),
          day2: getDetailedInfo(4),
          day3: getDetailedInfo(4),
          day4: getDetailedInfo(4),
          day5: getDetailedInfo(4)
        }

  // Override the specific day with the mock level
  modifiedAirQuality[mockDay] = mockDayData

  logger.info(
    `🎯 Applied mock level ${level} to ${mockDay} only (value: ${mockDayData.value}, band: ${mockDayData.band}, readableBand: ${mockDayData.readableBand})`
  )
  return modifiedAirQuality
}

/**
 * Apply mock level to all days
 */
function applyMockToAllDays(level, getDetailedInfo) {
  const mockData = {
    today: getDetailedInfo(level),
    day2: getDetailedInfo(level),
    day3: getDetailedInfo(level),
    day4: getDetailedInfo(level),
    day5: getDetailedInfo(level)
  }

  logger.info(
    `🎨 Applied mock level ${level} to all days (readableBand: ${mockData.today.readableBand})`
  )
  return mockData
}

/**
 * Check if mock level is requested and override air quality data
 * Non-intrusive: only applies mock if explicitly enabled, otherwise returns original data
 */
export function applyMockLevel(request, airQuality, lang = LANG_EN) {
  // '' Disable mock functionality when configured (production by default)
  const mocksDisabled = config.get('disableTestMocks')
  if (mocksDisabled) {
    logger.info(`🚫 Mock DAQI levels disabled (disableTestMocks=true)`)
    return airQuality
  }

  // Get the appropriate getDetailedInfo function for the language
  const getDetailedInfo =
    lang === LANG_CY ? getDetailedInfoCy : getDetailedInfoEn

  // Check session for mockLevel (preserved across redirects)
  const mockLevel = request.yar.get('mockLevel')
  const mockDay = request.yar.get('mockDay') // '' Optional: specific day to apply mock level

  logger.info(
    `🔍 applyMockLevel called - mockLevel from session:`,
    mockLevel,
    `(type: ${typeof mockLevel}), mockDay:`,
    mockDay,
    `lang:`,
    lang
  )

  const level = parseAndValidateMockLevel(mockLevel)
  if (level === null) {
    logger.info(`🔍 Returning original airQuality (no mock)`)
    return airQuality
  }

  logger.info(`🎨 Mock DAQI Level ${level} applied from session`)

  // If mockDay is specified, apply mock level only to that specific day
  const isValidMockDay =
    mockDay && ['today', 'day2', 'day3', 'day4', 'day5'].includes(mockDay)

  if (isValidMockDay) {
    return applyMockToSpecificDay(airQuality, mockDay, level, getDetailedInfo)
  }

  return applyMockToAllDays(level, getDetailedInfo)
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
  locationId
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

  // '' Get forecast warning for high/very high pollution levels
  const forecastWarning = getForecastWarning(airQuality, lang)

  const components = UI_COMPONENTS[lang]

  // '' Get searchTerms and locationName from request query for back link context
  const searchTerms = request?.query?.searchTerms || ''
  const locationNameFromQuery = request?.query?.locationName || ''

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
    locationName: locationNameFromQuery || headerTitle,
    locationId,
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
    latlon: locationData.latlon,
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
