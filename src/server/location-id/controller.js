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
import { mockLevelColor } from '../common/helpers/mock-daqi-level.js'
import {
  mockPollutantBand as generateMockPollutantBand,
  applyMockPollutantsToSites
} from '../common/helpers/mock-pollutant-level.js'
import { getForecastWarning } from '../locations/helpers/forecast-warning.js'
import { getIssueTime } from '../locations/helpers/middleware-helpers.js'

const logger = createLogger()

/**
 * Check if mock level is requested and override air quality data
 * Non-intrusive: only applies mock if explicitly enabled, otherwise returns original data
 */
function applyMockLevel(request, airQuality) {
  // '' Disable mock functionality when configured (production by default)
  const mocksDisabled = config.get('disableTestMocks')
  if (mocksDisabled) {
    logger.info(`🚫 Mock DAQI levels disabled (disableTestMocks=true)`)
    return airQuality
  }

  // Check session for mockLevel (preserved across redirects)
  const mockLevel = request.yar.get('mockLevel')
  const mockDay = request.yar.get('mockDay') // '' Optional: specific day to apply mock level

  logger.info(
    `🔍 applyMockLevel called - mockLevel from session:`,
    mockLevel,
    `(type: ${typeof mockLevel}), mockDay:`,
    mockDay
  )

  if (mockLevel !== undefined && mockLevel !== null) {
    const level = parseInt(mockLevel, 10)

    logger.info(`🔍 Parsed level:`, level, `isNaN:`, isNaN(level))

    // Validate level
    if (!isNaN(level) && level >= 0 && level <= 10) {
      logger.info(`🎨 Mock DAQI Level ${level} applied from session`)

      // If mockDay is specified, apply mock level only to that specific day
      if (
        mockDay &&
        ['today', 'day2', 'day3', 'day4', 'day5'].includes(mockDay)
      ) {
        // Generate mock data for the specific day only
        const mockDayData = mockLevelColor(level, {
          includeForecast: false,
          allSameLevel: false,
          logDetails: false
        })

        // Start with existing airQuality or generate full forecast with current values
        let modifiedAirQuality
        if (airQuality && typeof airQuality === 'object') {
          // Deep clone each day to avoid reference issues
          modifiedAirQuality = {
            today: airQuality.today ? { ...airQuality.today } : null,
            day2: airQuality.day2 ? { ...airQuality.day2 } : null,
            day3: airQuality.day3 ? { ...airQuality.day3 } : null,
            day4: airQuality.day4 ? { ...airQuality.day4 } : null,
            day5: airQuality.day5 ? { ...airQuality.day5 } : null
          }
        } else {
          // If no airQuality exists, generate default forecast (all moderate level 4)
          const defaultData = mockLevelColor(4, {
            includeForecast: true,
            allSameLevel: true,
            logDetails: false
          })
          modifiedAirQuality = defaultData
        }

        // Override the specific day with the mock level
        modifiedAirQuality[mockDay] = mockDayData.today

        logger.info(
          `🎯 Applied mock level ${level} to ${mockDay} only (value: ${mockDayData.today.value}, band: ${mockDayData.today.band})`
        )
        return modifiedAirQuality
      } else {
        // Generate mock data for all days (default behavior)
        const mockData = mockLevelColor(level, {
          includeForecast: true,
          allSameLevel: true,
          logDetails: false
        })

        return mockData
      }
    } else {
      logger.warn(`Invalid mock level: ${mockLevel}. Must be 0-10.`)
    }
  }

  // Return original data if no mock level (default behavior unchanged)
  logger.info(`🔍 Returning original airQuality (no mock)`)
  return airQuality
}

/**
 * Check if mock pollutant band is requested and override pollutant data in monitoring sites
 * '' - Non-intrusive: only applies mock if explicitly enabled
 */
function applyMockPollutants(request, monitoringSites) {
  // '' Disable mock functionality when configured (production by default)
  const mocksDisabled = config.get('disableTestMocks')
  if (mocksDisabled) {
    logger.info(`🚫 Mock pollutant bands disabled (disableTestMocks=true)`)
    return monitoringSites
  }

  // Check session for mockPollutantBand (preserved across redirects)
  const mockPollutantBandFromSession = request.yar.get('mockPollutantBand')

  logger.info(
    `🔍 applyMockPollutants called - mockPollutantBand from session:`,
    mockPollutantBandFromSession,
    `(type: ${typeof mockPollutantBandFromSession})`
  )

  if (
    mockPollutantBandFromSession !== undefined &&
    mockPollutantBandFromSession !== null
  ) {
    const bandStr = mockPollutantBandFromSession.toString().toLowerCase()

    logger.info(`🔍 Parsed band:`, bandStr)

    // Validate band
    const validBands = ['low', 'moderate', 'high', 'very-high', 'very high']
    if (
      validBands.includes(bandStr) ||
      validBands.includes(bandStr.replace('-', ' '))
    ) {
      logger.info(`🎨 Mock Pollutant Band '${bandStr}' applied from session`)

      // Generate mock pollutants using the renamed import
      const mockPollutants = generateMockPollutantBand(bandStr, {
        logDetails: false
      })

      // Apply to all monitoring sites
      const modifiedSites = applyMockPollutantsToSites(
        monitoringSites,
        mockPollutants,
        {
          applyToAllSites: true,
          logDetails: false
        }
      )

      return modifiedSites
    } else {
      logger.warn(
        `Invalid mock pollutant band: ${mockPollutantBandFromSession}. Must be one of: low, moderate, high, very-high.`
      )
    }
  }

  // Return original data if no mock band (default behavior unchanged)
  logger.info(`🔍 Returning original monitoringSites (no mock pollutants)`)
  return monitoringSites
}

// Helper to handle redirection for Welsh language
function handleWelshRedirect(query, locationId, h) {
  if (query?.lang && query?.lang === LANG_CY && !query?.searchTerms) {
    // '' Disable mock parameters when configured (production by default)
    const mocksDisabled = config.get('disableTestMocks')

    // Preserve mock parameters in redirect (only when mocks enabled)
    const mockLevel = !mocksDisabled ? query?.mockLevel : undefined
    const mockLevelParam =
      mockLevel !== undefined
        ? `&mockLevel=${encodeURIComponent(mockLevel)}`
        : ''

    const mockDay = !mocksDisabled ? query?.mockDay : undefined
    const mockDayParam =
      mockDay !== undefined ? `&mockDay=${encodeURIComponent(mockDay)}` : ''

    const mockPollutantBand = !mocksDisabled
      ? query?.mockPollutantBand
      : undefined
    const mockPollutantParam =
      mockPollutantBand !== undefined
        ? `&mockPollutantBand=${encodeURIComponent(mockPollutantBand)}`
        : ''

    const testMode = !mocksDisabled ? query?.testMode : undefined
    const testModeParam =
      testMode !== undefined ? `&testMode=${encodeURIComponent(testMode)}` : ''

    return h
      .redirect(
        `/lleoliad/${locationId}/?lang=cy${mockLevelParam}${mockDayParam}${mockPollutantParam}${testModeParam}`
      )
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

    // '' Disable mock parameters when configured (production by default)
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
  metaSiteUrl,
  request
}) {
  let { title, headerTitle } = gazetteerEntryFilter(locationDetails)
  title = convertFirstLetterIntoUppercase(title)
  headerTitle = convertFirstLetterIntoUppercase(headerTitle)

  // '' Handle case where dailySummary might be undefined (e.g., in test mode)
  const { transformedDailySummary } = locationData.dailySummary
    ? transformKeys(locationData.dailySummary, lang)
    : { transformedDailySummary: undefined }

  let { airQuality } = airQualityValues(forecastNum, lang)

  // Apply mock level if requested
  airQuality = applyMockLevel(request, airQuality)

  // '' Apply mock pollutant bands if requested
  const modifiedMonitoringSites = applyMockPollutants(
    request,
    nearestLocationsRange
  )

  // '' Get forecast warning for high/very high pollution levels
  const forecastWarning = getForecastWarning(airQuality, lang)

  return {
    result: locationDetails,
    airQuality,
    airQualityData: airQualityData.commonMessages,
    monitoringSites: modifiedMonitoringSites,
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
    showSummaryDate: locationData.showSummaryDate,
    issueTime: locationData.issueTime,
    dailySummaryTexts: english.dailySummaryTexts,
    serviceName: english.multipleLocations.serviceName,
    forecastWarning,
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
  useNewRicardoMeasurementsEnabled,
  request
) {
  let distance
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

// Helper to validate and process session data
function validateAndProcessSessionData(
  locationData,
  currentUrl,
  lang,
  h,
  request
) {
  if (!Array.isArray(locationData?.results) || !locationData?.getForecasts) {
    const { searchTerms, secondSearchTerm, searchTermsLocationType } =
      getSearchTermsFromUrl(currentUrl)
    request.yar.clear('locationData')

    const safeSearchTerms = searchTerms || ''
    const safeSecondSearchTerm = secondSearchTerm || ''
    const safeSearchTermsLocationType = searchTermsLocationType || ''
    const searchParams =
      safeSearchTerms || safeSecondSearchTerm || safeSearchTermsLocationType
        ? `&searchTerms=${encodeURIComponent(safeSearchTerms)}&secondSearchTerm=${encodeURIComponent(safeSecondSearchTerm)}&searchTermsLocationType=${encodeURIComponent(safeSearchTermsLocationType)}`
        : ''

    // Preserve mock parameters in redirect
    const mockLevel = request.query?.mockLevel
    const mockLevelParam =
      mockLevel !== undefined
        ? `&mockLevel=${encodeURIComponent(mockLevel)}`
        : ''

    const mockPollutantBand = request.query?.mockPollutantBand
    const mockPollutantParam =
      mockPollutantBand !== undefined
        ? `&mockPollutantBand=${encodeURIComponent(mockPollutantBand)}`
        : ''

    const testMode = request.query?.testMode
    const testModeParam =
      testMode !== undefined ? `&testMode=${encodeURIComponent(testMode)}` : ''

    return h
      .redirect(
        `/location?lang=${encodeURIComponent(lang)}${searchParams}${mockLevelParam}${mockPollutantParam}${testModeParam}`
      )
      .code(REDIRECT_STATUS_CODE)
      .takeover()
  }
  return null
}

// Helper to determine location type
function determineLocationType(locationData) {
  if (locationData?.locationType === LOCATION_TYPE_UK) {
    return LOCATION_TYPE_UK
  }
  if (locationData?.locationType === LOCATION_TYPE_NI) {
    return LOCATION_TYPE_NI
  }
  return LOCATION_TYPE_UK
}

// Helper to initialize request data
function initializeRequestData(request) {
  const { query, headers } = request
  const locationId = request.params.id
  const searchTermsSaved = request.yar.get('searchTermsSaved')
  const useNewRicardoMeasurementsEnabled = config.get(
    'useNewRicardoMeasurementsEnabled'
  )
  const currentUrl = request.url.href
  const lang = query?.lang ?? LANG_EN

  // '' Disable mock functionality when configured (production by default)
  const mocksDisabled = config.get('disableTestMocks')

  // Store mockLevel in session if provided
  // Note: We preserve mockLevel in session across redirects
  // Only clear if explicitly set to empty string or 'clear'
  if (query?.mockLevel !== undefined && !mocksDisabled) {
    // Check if explicitly clearing
    if (query.mockLevel === '' || query.mockLevel === 'clear') {
      request.yar.set('mockLevel', null)
      logger.info(`🎨 Mock level explicitly cleared from session`)
    } else {
      request.yar.set('mockLevel', query.mockLevel)
      logger.info(`🎨 Mock level ${query.mockLevel} stored in session`)
    }
  } else if (mocksDisabled && query?.mockLevel !== undefined) {
    logger.warn(
      `🚫 Attempted to set mock level when mocks disabled (disableTestMocks=true) - ignoring parameter`
    )
  }
  // If parameter is not present, preserve existing session value (don't clear)

  // '' Store mockDay in session if provided (optional: specific day for mock level)
  // Valid values: today, day2, day3, day4, day5
  if (query?.mockDay !== undefined && !mocksDisabled) {
    // Check if explicitly clearing
    if (query.mockDay === '' || query.mockDay === 'clear') {
      request.yar.set('mockDay', null)
      logger.info(`🎨 Mock day explicitly cleared from session`)
    } else {
      request.yar.set('mockDay', query.mockDay)
      logger.info(`🎨 Mock day ${query.mockDay} stored in session`)
    }
  } else if (mocksDisabled && query?.mockDay !== undefined) {
    logger.warn(
      `🚫 Attempted to set mock day when mocks disabled (disableTestMocks=true) - ignoring parameter`
    )
  }
  // If parameter is not present, preserve existing session value (don't clear)

  // '' Store mockPollutantBand in session if provided
  // Note: We preserve mockPollutantBand in session across redirects
  // Only clear if explicitly set to empty string or 'clear'
  logger.info(
    `🔍 DEBUG mockPollutantBand - query.mockPollutantBand:`,
    query?.mockPollutantBand
  )
  logger.info(
    `🔍 DEBUG mockPollutantBand - type:`,
    typeof query?.mockPollutantBand
  )
  logger.info(
    `🔍 DEBUG mockPollutantBand - full query object:`,
    JSON.stringify(query)
  )

  if (query?.mockPollutantBand !== undefined && !mocksDisabled) {
    // Check if explicitly clearing
    if (query.mockPollutantBand === '' || query.mockPollutantBand === 'clear') {
      request.yar.set('mockPollutantBand', null)
      logger.info(`🎨 Mock pollutant band explicitly cleared from session`)
    } else {
      request.yar.set('mockPollutantBand', query.mockPollutantBand)
      logger.info(
        `🎨 Mock pollutant band '${query.mockPollutantBand}' stored in session`
      )
    }
  } else if (mocksDisabled && query?.mockPollutantBand !== undefined) {
    logger.warn(
      `🚫 Attempted to set mock pollutant band when mocks disabled (disableTestMocks=true) - ignoring parameter`
    )
  }
  // If parameter is not present, preserve existing session value (don't clear)

  // '' Store testMode in session if provided (but DON'T clear it if not present - let it persist)
  // Disable when mocks are disabled
  if (query?.testMode !== undefined && !mocksDisabled) {
    request.yar.set('testMode', query.testMode)
    logger.info(`🧪 Test mode ${query.testMode} stored in session`)
  } else if (mocksDisabled && query?.testMode !== undefined) {
    logger.warn(
      `🚫 Attempted to set test mode when mocks disabled (disableTestMocks=true) - ignoring parameter`
    )
  }
  // Note: We don't clear testMode automatically - it persists across requests (when mocks enabled)
  // To clear it, user must explicitly visit with ?testMode=clear or restart session

  return {
    query,
    headers,
    locationId,
    searchTermsSaved,
    useNewRicardoMeasurementsEnabled,
    currentUrl,
    lang
  }
}

// Helper to initialize common variables
function initializeCommonVariables(request) {
  request.yar.clear('searchTermsSaved')
  const formattedDate = moment().format('DD MMMM YYYY').split(' ')
  const getMonth = calendarEnglish.findIndex(
    (item) => item.indexOf(formattedDate[1]) !== -1
  )
  const metaSiteUrl = getAirQualitySiteUrl(request)
  const locationData = request.yar.get('locationData') || {}

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
  const {
    query,
    headers,
    locationId,
    searchTermsSaved,
    useNewRicardoMeasurementsEnabled,
    currentUrl,
    lang
  } = initializeRequestData(request)

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
    request
  )
  if (sessionValidationResult) {
    return { redirect: sessionValidationResult }
  }

  return {
    data: {
      locationData,
      useNewRicardoMeasurementsEnabled,
      locationId,
      lang,
      getMonth,
      metaSiteUrl
    }
  }
}

// Helper to process location data and return appropriate response
async function processLocationWorkflow({
  locationData,
  useNewRicardoMeasurementsEnabled,
  locationId,
  lang,
  getMonth,
  metaSiteUrl,
  request,
  h
}) {
  // Process location data
  const { getForecasts } = locationData
  const locationType = determineLocationType(locationData)

  // 🔍 DEBUG: Check if query params or session testMode are present
  const testModeFromQuery = request.query?.testMode
  const testModeFromSession = request.yar.get('testMode')
  const testMode = testModeFromQuery || testModeFromSession

  logger.info(`🔍 request.query.testMode:`, testModeFromQuery)
  logger.info(`🔍 session testMode:`, testModeFromSession)
  logger.info(`🔍 final testMode:`, testMode)

  // 🧪 TESTING: Temporary test modes for visual verification
  // TODO: REMOVE THIS CODE AFTER TESTING!
  if (testMode) {
    logger.info(`🧪 TEST MODE ACTIVE: ${testMode}`)

    switch (testMode) {
      case 'noDailySummary':
        // '' Remove daily summary text only (keep date if today)
        logger.info('🧪 TEST: Removing daily summary data')
        locationData.dailySummary = undefined
        break

      case 'oldDate':
        // '' Set date to yesterday (date should NOT show)
        logger.info('🧪 TEST: Setting old issue_date (yesterday)')
        if (locationData.dailySummary) {
          const yesterday = moment().subtract(1, 'days')
          locationData.dailySummary.issue_date = yesterday.format(
            'YYYY-MM-DD HH:mm:ss'
          )
          locationData.englishDate = yesterday.format('DD MMMM YYYY')
          locationData.welshDate = yesterday.format('DD MMMM YYYY')
          logger.info(
            `🧪 Changed issue_date to: ${locationData.dailySummary.issue_date}`
          )
        }
        break

      case 'todayDate':
        // '' Set date to today (date SHOULD show)
        logger.info('🧪 TEST: Setting today issue_date')
        if (locationData.dailySummary) {
          const today = moment()
          locationData.dailySummary.issue_date = today.format(
            'YYYY-MM-DD HH:mm:ss'
          )
          locationData.englishDate = today.format('DD MMMM YYYY')
          locationData.welshDate = today.format('DD MMMM YYYY')
          logger.info(
            `🧪 Changed issue_date to: ${locationData.dailySummary.issue_date}`
          )
          logger.info(`🧪 Changed englishDate to: ${locationData.englishDate}`)
        }
        break

      case 'noDataOldDate': {
        // '' Remove daily summary AND set old date (nothing should show)
        logger.info('🧪 TEST: Removing summary AND setting old date')
        const yesterday = moment().subtract(1, 'days')
        locationData.dailySummary = {
          issue_date: yesterday.format('YYYY-MM-DD HH:mm:ss')
        }
        locationData.englishDate = yesterday.format('DD MMMM YYYY')
        locationData.welshDate = yesterday.format('DD MMMM YYYY')
        logger.info(
          `🧪 Changed issue_date to: ${locationData.dailySummary.issue_date}`
        )
        logger.info(`🧪 Removed daily summary data (only kept issue_date)`)
        break
      }

      default:
        logger.warn(`🧪 Unknown testMode: ${testMode}`)
    }

    // Re-calculate showSummaryDate after any changes
    const isSummaryDateToday = (issueDate) => {
      if (!issueDate) return false
      const today = moment().format('YYYY-MM-DD')
      const issueDateFormatted = moment(issueDate).format('YYYY-MM-DD')
      return today === issueDateFormatted
    }

    locationData.showSummaryDate = isSummaryDateToday(
      locationData.dailySummary?.issue_date
    )
    locationData.issueTime = getIssueTime(locationData.dailySummary?.issue_date)

    // Update session with modified data
    request.yar.set('locationData', locationData)
    logger.info('🧪 TEST: Updated locationData in session')
    logger.info(
      `🧪 TEST: Final showSummaryDate = ${locationData.showSummaryDate}`
    )
  }
  // END TEST CODE

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
    useNewRicardoMeasurementsEnabled,
    request
  )

  // 🔍 DEBUG: Log showSummaryDate value
  logger.info(`🔍 ========== SUMMARY DATE DEBUG ==========`)
  logger.info(
    `🔍 showSummaryDate (from session): ${locationData.showSummaryDate}`
  )
  logger.info(`🔍 dailySummary object exists: ${!!locationData.dailySummary}`)
  logger.info(
    `🔍 dailySummary.issue_date (raw): ${locationData.dailySummary?.issue_date}`
  )
  logger.info(
    `🔍 dailySummary.today exists: ${!!locationData.dailySummary?.today}`
  )
  logger.info(`🔍 dailySummary.today value:`, locationData.dailySummary?.today)
  logger.info(
    `🔍 dailySummary.issue_date (type): ${typeof locationData.dailySummary?.issue_date}`
  )
  logger.info(`🔍 Today's date: ${moment().format('YYYY-MM-DD')}`)

  // '' Calculate showSummaryDate if not already set (for direct access to location pages)
  if (
    locationData.showSummaryDate === undefined &&
    locationData.dailySummary?.issue_date
  ) {
    const today = moment().format('YYYY-MM-DD')
    const issueDate = moment(locationData.dailySummary.issue_date).format(
      'YYYY-MM-DD'
    )
    locationData.showSummaryDate = today === issueDate
    locationData.issueTime = getIssueTime(locationData.dailySummary.issue_date)
    logger.info(`🔍 CALCULATED showSummaryDate:`)
    logger.info(`🔍   - today: ${today}`)
    logger.info(`🔍   - issueDate: ${issueDate}`)
    logger.info(`🔍   - match: ${today === issueDate}`)
    logger.info(`🔍   - result: ${locationData.showSummaryDate}`)
    logger.info(`🔍   - issueTime: ${locationData.issueTime}`)
  } else if (locationData.showSummaryDate !== undefined) {
    logger.info(
      `🔍 showSummaryDate already set to: ${locationData.showSummaryDate}`
    )
    // '' Ensure issueTime is also set
    logger.info(
      `🔍   - checking issueTime: ${locationData.issueTime}, has issue_date: ${!!locationData.dailySummary?.issue_date}`
    )
    if (!locationData.issueTime && locationData.dailySummary?.issue_date) {
      locationData.issueTime = getIssueTime(
        locationData.dailySummary.issue_date
      )
      logger.info(`🔍   - issueTime calculated: ${locationData.issueTime}`)
      // '' Update session with the calculated issueTime
      request.yar.set('locationData', locationData)
      logger.info(`🔍   - issueTime saved to session`)
    }
  } else {
    logger.info(
      `🔍 No issue_date available, showSummaryDate will be false/undefined`
    )
  }
  logger.info(`🔍 FINAL showSummaryDate: ${locationData.showSummaryDate}`)
  logger.info(`🔍 FINAL issueTime: ${locationData.issueTime}`)
  logger.info(`🔍 ========================================`)

  // Process result
  if (locationDetails) {
    const viewData = buildLocationViewData({
      locationDetails,
      nearestLocationsRange,
      locationData,
      forecastNum,
      lang,
      getMonth,
      metaSiteUrl,
      request
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
    try {
      // Handle initialization and validation
      const initResult = await initializeAndValidateRequest(request, h)
      if (initResult.redirect) {
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
      return h
        .response('Internal Server Error')
        .code(STATUS_INTERNAL_SERVER_ERROR)
    }
  }
}

export { getLocationDetailsController }
