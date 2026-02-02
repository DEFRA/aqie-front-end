import {
  siteTypeDescriptions,
  pollutantTypes
} from '../data/en/monitoring-sites.js'
import * as airQualityData from '../data/en/air-quality.js'
import {
  LANG_CY,
  LOCATION_NOT_FOUND,
  LOCATION_TYPE_NI,
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
import {
  compareLastElements,
  formatNorthernIrelandPostcode
} from '../locations/helpers/convert-string.js'
import sizeof from 'object-sizeof'
import { config } from '../../config/index.js'
import {
  processAirQualityMessages,
  buildMockQueryParams,
  initializeRequestData,
  validateAndProcessSessionData as validateSessionData,
  applyMockToDay,
  applyMockPollutants as applyMockPollutantsHelper
} from './controller-helpers.js'
import {
  applyTestModeChanges,
  calculateSummaryDate,
  determineLocationType
} from './controller-workflow.js'
import {
  mockPollutantBand as generateMockPollutantBand,
  applyMockPollutantsToSites
} from '../common/helpers/mock-pollutant-level.js'
import { getForecastWarning } from '../locations/helpers/forecast-warning.js'

const logger = createLogger()
const DATE_FORMAT = 'DD MMMM YYYY'
const DAILY_SUMMARY_KEY = 'dailySummary'

function applyMockLevel(request, airQuality) {
  const mocksDisabled = config.get('disableTestMocks')
  if (mocksDisabled) {
    return airQuality
  }
  const mockLevel = request.yar.get('mockLevel')
  const mockDay = request.yar.get('mockDay')
  if (mockLevel === undefined || mockLevel === null) {
    return airQuality
  }
  const level = Number.parseInt(mockLevel, 10)
  if (Number.isNaN(level) || level < 0 || level > 10) {
    logger.warn(`Invalid mock level: ${mockLevel}. Must be 0-10.`)
    return airQuality
  }
  return applyMockToDay(airQuality, level, mockDay)
}
function applyMockPollutants(request, monitoringSites) {
  return applyMockPollutantsHelper(
    request,
    monitoringSites,
    generateMockPollutantBand,
    applyMockPollutantsToSites
  )
}

function handleWelshRedirect(query, locationId, h) {
  if (query?.lang && query?.lang === LANG_CY && !query?.searchTerms) {
    const mockParams = buildMockQueryParams(
      { query },
      config.get('disableTestMocks')
    )
    return h
      .redirect(`/lleoliad/${locationId}/?lang=cy${mockParams}`)
      .code(REDIRECT_STATUS_CODE)
  }
  return null
}

function handleSearchTermsRedirect(
  headers,
  searchTermsSaved,
  currentUrl,
  request,
  h
) {
  logger.info(
    `[DEBUG controller] handleSearchTermsRedirect - searchTermsSaved from session: ${searchTermsSaved}`
  )
  const previousUrl = headers.referer || headers.referrer
  logger.info(`[DEBUG controller] previousUrl: ${previousUrl}`)
  logger.info(`[DEBUG controller] currentUrl: ${currentUrl}`)
  const isPreviousAndCurrentUrlEqual = compareLastElements(
    previousUrl,
    currentUrl
  )
  logger.info(
    `[DEBUG controller] isPreviousAndCurrentUrlEqual: ${isPreviousAndCurrentUrlEqual}`
  )
  if (
    (previousUrl === undefined && !searchTermsSaved) ||
    (isPreviousAndCurrentUrlEqual && !searchTermsSaved)
  ) {
    logger.info(
      `[DEBUG controller] REDIRECTING because searchTermsSaved is missing`
    )

    // '' Extract searchTerms from URL path (0.685.0 approach)
    let { searchTerms, secondSearchTerm, searchTermsLocationType } =
      getSearchTermsFromUrl(currentUrl)

    // '' Check if searchTerms is a normalized Northern Ireland postcode (e.g., bt938ad)
    // '' and convert it back to proper format (e.g., BT93 8AD)
    const normalizedNIPostcodeRegex = /^bt\d{1,2}\d[a-z]{2}$/i
    if (normalizedNIPostcodeRegex.test(searchTerms)) {
      logger.info(
        `[DEBUG controller] Detected normalized NI postcode: ${searchTerms}`
      )
      searchTerms = formatNorthernIrelandPostcode(searchTerms.toUpperCase())
      logger.info(
        `[DEBUG controller] Converted to formatted NI postcode: ${searchTerms}`
      )
    }

    request.yar.clear('locationData')
    logger.info('Redirecting to location search')

    // '' Disable mock functionality when configured (production by default)
    const mocksDisabled = config.get('disableTestMocks')

    // Preserve mock parameters in redirect if present (only when mocks enabled)
    const mockLevel = !mocksDisabled ? request.query?.mockLevel : undefined
    const mockLevelParam =
      mockLevel !== undefined
        ? `&mockLevel=${encodeURIComponent(mockLevel)}`
        : ''

    const mockDay = !mocksDisabled ? request.query?.mockDay : undefined
    const mockDayParam =
      mockDay !== undefined ? `&mockDay=${encodeURIComponent(mockDay)}` : ''

    const mockPollutantBand = !mocksDisabled
      ? request.query?.mockPollutantBand
      : undefined
    const mockPollutantParam =
      mockPollutantBand !== undefined
        ? `&mockPollutantBand=${encodeURIComponent(mockPollutantBand)}`
        : ''

    const testMode = !mocksDisabled ? request.query?.testMode : undefined
    const testModeParam =
      testMode !== undefined ? `&testMode=${encodeURIComponent(testMode)}` : ''

    return h
      .redirect(
        `/location?lang=en&searchTerms=${encodeURIComponent(searchTerms)}&secondSearchTerm=${encodeURIComponent(secondSearchTerm)}&searchTermsLocationType=${encodeURIComponent(searchTermsLocationType)}${mockLevelParam}${mockDayParam}${mockPollutantParam}${testModeParam}`
      )
      .code(REDIRECT_STATUS_CODE)
      .takeover()
  }
  logger.info(`[DEBUG controller] NOT redirecting - searchTermsSaved found`)
  return null
}

function prepareLocationTitles(locationDetails) {
  const { title, headerTitle } = gazetteerEntryFilter(locationDetails)
  return {
    title: convertFirstLetterIntoUppercase(title),
    headerTitle: convertFirstLetterIntoUppercase(headerTitle)
  }
}

function prepareAirQuality(
  forecastNum,
  lang,
  request,
  locationData,
  highestAQ
) {
  let { airQuality } = airQualityValues(forecastNum, lang)
  const { transformedDailySummary } = locationData[DAILY_SUMMARY_KEY]
    ? transformKeys(locationData[DAILY_SUMMARY_KEY], lang, highestAQ)
    : { transformedDailySummary: null }
  airQuality = applyMockLevel(request, airQuality)
  return { airQuality, transformedDailySummary }
}

function extractLocationContext(request, headerTitle) {
  const searchTerms = request?.query?.searchTerms || ''
  const locationNameForTemplate = request?.query?.locationName || headerTitle
  return { searchTerms, locationNameForTemplate }
}

// Helper to build view data for found location
function buildLocationViewData({
  locationDetails,
  nearestLocationsRange,
  locationData,
  forecastNum,
  lang,
  getMonth,
  metaSiteUrl,
  request,
  locationId
}) {
  const { title, headerTitle } = prepareLocationTitles(locationDetails)

  // '' Handle missing or empty forecastNum gracefully - ensure it's always an array
  const forecastNumSafe =
    Array.isArray(forecastNum) && forecastNum.length > 0 ? forecastNum : []
  const highestAQ =
    forecastNumSafe.length > 0 ? Math.max(...forecastNumSafe) : 0
  const { airQuality, transformedDailySummary } = prepareAirQuality(
    forecastNumSafe,
    lang,
    request,
    locationData,
    highestAQ
  )

  const modifiedMonitoringSites = applyMockPollutants(
    request,
    nearestLocationsRange
  )

  const forecastWarning = getForecastWarning(airQuality, lang)

  const { searchTerms, locationNameForTemplate } = extractLocationContext(
    request,
    headerTitle
  )
  const processedAirQualityData = processAirQualityMessages(
    airQualityData,
    locationId,
    lang,
    searchTerms,
    locationNameForTemplate
  )

  // Use calculated coordinates from geolib (from getNearestLocation) ''
  // Format coordinates to 4 decimal places for alert links ''
  const rawLatlon = locationData.latlon || {}
  const latlon = {
    lat: rawLatlon.lat ? Number(rawLatlon.lat.toFixed(4)) : undefined,
    lon: rawLatlon.lon ? Number(rawLatlon.lon.toFixed(4)) : undefined
  }

  // Log coordinate availability for alert links ''
  logger.info('🗺️ Building view data with coordinates')
  logger.info('🗺️ locationData keys:', Object.keys(locationData))
  logger.info('🗺️ locationData.latlon:', locationData.latlon)
  logger.info('🗺️ latlon variable:', latlon)
  logger.info('🗺️ latlon.lat:', latlon?.lat)
  logger.info('🗺️ latlon.lon:', latlon?.lon)
  logger.info('🗺️ locationId:', locationId)
  logger.info('🗺️ title:', title)

  return {
    result: locationDetails,
    airQuality,
    airQualityData: processedAirQualityData,
    monitoringSites: modifiedMonitoringSites,
    siteTypeDescriptions,
    pollutantTypes,
    pageTitle: `${english.multipleLocations.titlePrefix} ${title} - ${english.multipleLocations.pageTitle}`,
    metaSiteUrl,
    description: `${english.daqi.description.a} ${headerTitle}${english.daqi.description.b}`,
    title: `${english.multipleLocations.titlePrefix} ${headerTitle}`,
    headerTitle,
    locationName: locationNameForTemplate,
    locationId,
    latlon,
    searchTerms,
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
    showSummaryDate: locationData.showSummaryDate,
    issueTime: locationData.issueTime,
    dailySummaryTexts: english.dailySummaryTexts,
    serviceName: english.multipleLocations.serviceName,
    forecastWarning,
    lang
  }
}

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
  // '' Ensure we only assign valid arrays to prevent template errors
  const nearestLocationSafe = Array.isArray(nearestLocation)
    ? nearestLocation
    : []
  const nearestLocationsRangeSafe = Array.isArray(nearestLocationsRange)
    ? nearestLocationsRange
    : []

  // Replace the large getForecasts with a single-record version
  locationData.getForecasts = nearestLocationSafe
  // Replace the large getMeasurements with a filtered version
  locationData.getMeasurements = nearestLocationsRangeSafe
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
  request
) {
  let distance
  if (locationData.locationType === LOCATION_TYPE_NI) {
    distance = await getNearestLocation(
      locationData?.results,
      getForecasts,
      locationType,
      0,
      lang,
      request
    )
    // '' Ensure distance has valid latlon structure even when forecasts fail
    if (
      !distance ||
      !distance.latlon ||
      distance.latlon.lat === undefined ||
      distance.latlon.lon === undefined
    ) {
      // Fall back to using the first result's coordinates if available
      const firstResult = Array.isArray(locationData?.results)
        ? locationData.results[0]
        : null
      distance = distance || {}
      distance.latlon = {
        lat: firstResult?.latitude || 0,
        lon: firstResult?.longitude || 0
      }
    }
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
  const { forecastNum, nearestLocationsRange, nearestLocation, latlon } =
    await getNearestLocation(
      locationData?.results,
      getForecasts,
      locationType,
      locationIndex,
      lang,
      request
    )

  // Store calculated latlon from geolib in locationData ''
  locationData.latlon = latlon

  // '' Ensure nearestLocation is an array; fallback to empty array if forecasts are missing
  const nearestLocationSafe =
    Array.isArray(nearestLocation) && nearestLocation.length > 0
      ? nearestLocation
      : []

  return {
    locationDetails,
    forecastNum,
    nearestLocationsRange,
    nearestLocation: nearestLocationSafe,
    latlon
  }
}

// Helper to validate and process session data
function validateAndProcessSessionData(
  locationData,
  currentUrl,
  lang,
  h,
  request,
  locationId
) {
  return validateSessionData(
    locationData,
    currentUrl,
    lang,
    h,
    request,
    locationId
  )
}

// Helper to initialize request data
function handleRequestData(request) {
  return initializeRequestData(request)
}

// Helper to initialize common variables
function initializeCommonVariables(request) {
  // '' Clear searchTermsSaved after handleSearchTermsRedirect check (0.685.0 behavior)
  request.yar.clear('searchTermsSaved')
  const formattedDate = moment().format(DATE_FORMAT).split(' ')
  const getMonth = calendarEnglish.findIndex((item) =>
    item.includes(formattedDate[1])
  )
  const metaSiteUrl = getAirQualitySiteUrl(request)
  const locationData = request.yar.get('locationData') || {}

  logger.info(
    `[DEBUG initializeCommonVariables] locationData exists: ${!!locationData}`
  )
  logger.info(
    `[DEBUG initializeCommonVariables] locationData.results exists: ${!!locationData?.results}`
  )
  logger.info(
    `[DEBUG initializeCommonVariables] locationData.results is array: ${Array.isArray(locationData?.results)}`
  )
  logger.info(
    `[DEBUG initializeCommonVariables] locationData.getForecasts exists: ${!!locationData?.getForecasts}`
  )

  return {
    getMonth,
    metaSiteUrl,
    locationData
  }
}

// Helper to process successful location result
function processLocationResult(
  request,
  locationData,
  nearestLocation,
  nearestLocationsRange,
  h,
  viewData
) {
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
  return h.view('locations/location', viewData)
}

// Helper to handle all initialization and validation steps
async function initializeAndValidateRequest(request, h) {
  // Initialize request data
  const { query, headers, locationId, searchTermsSaved, currentUrl, lang } =
    handleRequestData(request)

  // Handle Welsh redirect
  const welshRedirect = handleWelshRedirect(query, locationId, h)
  if (welshRedirect) {
    return { redirect: welshRedirect }
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
    return { redirect: searchTermsRedirect }
  }

  // Initialize common variables
  const { getMonth, metaSiteUrl, locationData } =
    initializeCommonVariables(request)

  // Validate session data
  const sessionValidationResult = validateAndProcessSessionData(
    locationData,
    currentUrl,
    lang,
    h,
    request,
    locationId,
    getSearchTermsFromUrl
  )
  if (sessionValidationResult) {
    return { redirect: sessionValidationResult }
  }

  return {
    data: {
      locationData,
      locationId,
      lang,
      getMonth,
      metaSiteUrl
    }
  }
}

// Helper to apply test mode and log debug info
function applyTestModeAndLogDebug(request, locationData) {
  const testModeFromQuery = request.query?.testMode
  const testModeFromSession = request.yar.get('testMode')
  const testMode = testModeFromQuery || testModeFromSession

  logger.info(`🔍 request.query.testMode:`, testModeFromQuery)
  logger.info(`🔍 session testMode:`, testModeFromSession)
  logger.info(`🔍 final testMode:`, testMode)

  if (testMode) {
    applyTestModeChanges(locationData, testMode, logger)
    request.yar.set('locationData', locationData)
  }
}

// Helper to log and calculate summary date
function logAndCalculateSummaryDate(locationData) {
  logger.info(`🔍 ========== SUMMARY DATE DEBUG ==========`)
  logger.info(
    `🔍 showSummaryDate (from session): ${locationData.showSummaryDate}`
  )
  logger.info(
    `🔍 dailySummary object exists: ${!!locationData[DAILY_SUMMARY_KEY]}`
  )
  logger.info(
    `🔍 dailySummary.issue_date (raw): ${locationData[DAILY_SUMMARY_KEY]?.issue_date}`
  )

  calculateSummaryDate(locationData, logger)

  logger.info(`🔍 FINAL showSummaryDate: ${locationData.showSummaryDate}`)
  logger.info(`🔍 FINAL issueTime: ${locationData.issueTime}`)
  logger.info(`🔍 ========================================`)
}

// Helper to process location data and return appropriate response
async function processLocationWorkflow({
  locationData,
  locationId,
  lang,
  getMonth,
  metaSiteUrl,
  request,
  h
}) {
  // '' Check if user is in notification registration flow (SMS or Email) from multiple-results page
  const notificationFlow = request.yar.get('notificationFlow')
  if (notificationFlow) {
    // '' Update session with location data for notification
    if (
      locationData &&
      locationData.results &&
      locationData.results.length > 0
    ) {
      // '' Find the result that matches the locationId (not just the first one)
      let result = locationData.results.find((r) => {
        const id = r.GAZETTEER_ENTRY?.ID || r.ID
        return id === locationId
      })

      // '' Fallback to first result if no match found (shouldn't happen)
      if (!result) {
        logger.warn(
          `No result found matching locationId: ${locationId}, using first result`
        )
        result = locationData.results[0]
      }

      const gazetteerEntry = result.GAZETTEER_ENTRY || result

      // '' Build proper location title from gazetteerEntry instead of using page title
      let locationTitle = locationData.headerTitle

      // '' If headerTitle is not set or is a generic page title, build from gazetteerEntry
      if (!locationTitle || locationTitle === 'Locations matching') {
        const name = gazetteerEntry.NAME2 || gazetteerEntry.NAME1 || ''
        const district =
          gazetteerEntry.DISTRICT_BOROUGH || gazetteerEntry.COUNTY_UNITARY || ''
        locationTitle = district ? `${name}, ${district}` : name
      }

      // '' Convert British National Grid coordinates (GEOMETRY_X/Y) to lat/long
      let lat, lon
      if (gazetteerEntry.GEOMETRY_X && gazetteerEntry.GEOMETRY_Y) {
        // '' Import OsGridRef for coordinate conversion
        const OsGridRef = (await import('mt-osgridref')).default
        const point = new OsGridRef(
          gazetteerEntry.GEOMETRY_X,
          gazetteerEntry.GEOMETRY_Y
        )
        const latlon = OsGridRef.osGridToLatLong(point)
        lat = latlon._lat
        lon = latlon._lon
      } else {
        // '' Fallback to direct latitude/longitude if available
        lat =
          gazetteerEntry.LATITUDE || gazetteerEntry.latitude || result.latitude
        lon =
          gazetteerEntry.LONGITUDE ||
          gazetteerEntry.longitude ||
          result.longitude
      }

      request.yar.set('location', locationTitle)
      request.yar.set('locationId', locationId)
      request.yar.set('latitude', lat)
      request.yar.set('longitude', lon)
      logger.info(
        `[DEBUG processLocationWorkflow] Updated session location data:`,
        {
          location: locationTitle,
          locationId,
          lat,
          lon,
          hasLat: !!lat,
          hasLon: !!lon,
          geometryX: gazetteerEntry.GEOMETRY_X,
          geometryY: gazetteerEntry.GEOMETRY_Y
        }
      )
    }

    // '' Clear the flow flag and redirect to appropriate confirm details page
    request.yar.clear('notificationFlow')
    logger.info(
      `[DEBUG processLocationWorkflow] Redirecting to ${notificationFlow} confirm details (notificationFlow=${notificationFlow})`
    )

    if (notificationFlow === 'sms') {
      return h
        .redirect(`/notify/register/sms-confirm-details?lang=${lang}`)
        .code(REDIRECT_STATUS_CODE)
    } else if (notificationFlow === 'email') {
      // '' Placeholder for email flow - will be implemented later
      return h
        .redirect(`/notify/register/email-confirm-details?lang=${lang}`)
        .code(REDIRECT_STATUS_CODE)
    }
  }

  const { getForecasts } = locationData
  const locationType = determineLocationType(locationData)

  // '' If user is viewing a location page (not in notification flow), clear any stale notification flags
  // '' This prevents the notification loop from persisting when user navigates away
  if (!notificationFlow) {
    request.yar.clear('notificationFlow')
  }

  applyTestModeAndLogDebug(request, locationData)

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
    request
  )

  logAndCalculateSummaryDate(locationData)

  if (locationData.issueTime && !request.yar.get('locationData')?.issueTime) {
    request.yar.set('locationData', locationData)
  }

  if (locationDetails) {
    const viewData = buildLocationViewData({
      locationDetails,
      nearestLocationsRange,
      locationData,
      forecastNum,
      lang,
      getMonth,
      metaSiteUrl,
      request,
      locationId
    })
    return processLocationResult(
      request,
      locationData,
      nearestLocation,
      nearestLocationsRange,
      h,
      viewData
    )
  } else {
    return h.view(LOCATION_NOT_FOUND, buildNotFoundViewData(lang))
  }
}

const getLocationDetailsController = {
  handler: async (request, h) => {
    logger.info(
      `[DEBUG TOP OF HANDLER] Request to /location/${request.params.id} - URL: ${request.url.pathname}`
    )

    try {
      // Handle initialization and validation
      const initResult = await initializeAndValidateRequest(request, h)
      if (initResult.redirect) {
        logger.info(`[DEBUG TOP OF HANDLER] Returning redirect from initResult`)
        return initResult.redirect
      }

      // Process location workflow
      return await processLocationWorkflow({
        ...initResult.data,
        request,
        h
      })
    } catch (error) {
      logger.error(`error on single location ${error.message}`)
      logger.error(`error stack: ${error.stack}`)
      return h
        .response('Internal Server Error')
        .code(STATUS_INTERNAL_SERVER_ERROR)
    }
  }
}

export { getLocationDetailsController }
