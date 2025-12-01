import {
  siteTypeDescriptions,
  pollutantTypes
} from '../../data/cy/monitoring-sites.js'
import * as airQualityData from '../../data/cy/air-quality.js'
import { calendarWelsh } from '../../data/cy/navigation-welsh.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import {
  LANG_CY,
  LANG_EN,
  REDIRECT_STATUS_CODE,
  HTTP_STATUS_INTERNAL_SERVER_ERROR
} from '../../data/constants.js'
import { getSearchTermsFromUrl } from '../../locations/helpers/get-search-terms-from-url.js'
import { config } from '../../../config/index.js'
import moment from 'moment'
import { getIssueTime } from '../../locations/helpers/middleware-helpers.js'
// Import shared helper functions
import {
  initializeLocationVariables,
  processLocationData,
  buildLocationViewData,
  renderLocationView,
  renderNotFoundView,
  optimizeLocationDataInSession
} from '../../common/helpers/location-controller-helper.js'
// '' Import mock pollutant helpers
import {
  mockPollutantBand as generateMockPollutantBand,
  applyMockPollutantsToSites
} from '../../common/helpers/mock-pollutant-level.js'

const logger = createLogger()

// '' Date format constants
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const DATE_FORMAT = 'D MMMM YYYY'
const ISSUE_DATE_FORMAT = 'YYYY-MM-DD'

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
    `🔍 [Welsh] applyMockPollutants called - mockPollutantBand from session:`,
    mockPollutantBandFromSession,
    `(type: ${typeof mockPollutantBandFromSession})`
  )

  if (
    mockPollutantBandFromSession !== null &&
    mockPollutantBandFromSession !== undefined
  ) {
    const bandStr = mockPollutantBandFromSession.toString().toLowerCase()

    logger.info(`🔍 [Welsh] Parsed band:`, bandStr)

    // Validate band
    const validBands = new Set([
      'low',
      'moderate',
      'high',
      'very-high',
      'very high'
    ])
    if (validBands.has(bandStr) || validBands.has(bandStr.replace('-', ' '))) {
      logger.info(
        `🎨 [Welsh] Mock Pollutant Band '${bandStr}' applied from session`
      )

      // Generate mock pollutants using the renamed import with Welsh language
      const mockPollutants = generateMockPollutantBand(bandStr, {
        logDetails: false,
        lang: 'cy'
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
        `[Welsh] Invalid mock pollutant band: ${mockPollutantBandFromSession}. Must be one of: low, moderate, high, very-high.`
      )
    }
  }

  // Return original data if no mock band (default behavior unchanged)
  logger.info(
    `🔍 [Welsh] Returning original monitoringSites (no mock pollutants)`
  )
  return monitoringSites
}

function shouldRedirectToEnglish(query) {
  return query?.lang && query?.lang === LANG_EN && !query?.searchTerms
}

function getPreviousUrl(request) {
  return request.headers?.referer || request.headers?.referrer
}

// '' - Helper to extract mock parameters from request
function extractMockParameters(request) {
  const mocksDisabled = config.get('disableTestMocks')
  return {
    mockLevel: mocksDisabled ? undefined : request.query?.mockLevel,
    mockDay: mocksDisabled ? undefined : request.query?.mockDay,
    mockPollutantBand: mocksDisabled
      ? undefined
      : request.query?.mockPollutantBand,
    testMode: mocksDisabled ? undefined : request.query?.testMode
  }
}

// '' - Helper to build query string from mock parameters
function buildMockParamsString(mockParams) {
  const params = []
  if (mockParams.mockLevel !== null && mockParams.mockLevel !== undefined) {
    params.push(`mockLevel=${encodeURIComponent(mockParams.mockLevel)}`)
  }
  if (mockParams.mockDay !== null && mockParams.mockDay !== undefined) {
    params.push(`mockDay=${encodeURIComponent(mockParams.mockDay)}`)
  }
  if (
    mockParams.mockPollutantBand !== null &&
    mockParams.mockPollutantBand !== undefined
  ) {
    params.push(
      `mockPollutantBand=${encodeURIComponent(mockParams.mockPollutantBand)}`
    )
  }
  if (mockParams.testMode !== null && mockParams.testMode !== undefined) {
    params.push(`testMode=${encodeURIComponent(mockParams.testMode)}`)
  }
  return params.length > 0 ? `&${params.join('&')}` : ''
}

function buildRedirectUrl(currentUrl, request) {
  const { searchTerms, secondSearchTerm, searchTermsLocationType } =
    getSearchTermsFromUrl(currentUrl)

  const mockParams = extractMockParameters(request)
  const mockParamsString = buildMockParamsString(mockParams)

  return `/lleoliad?lang=cy&searchTerms=${encodeURIComponent(searchTerms)}&secondSearchTerm=${encodeURIComponent(secondSearchTerm)}&searchTermsLocationType=${encodeURIComponent(searchTermsLocationType)}${mockParamsString}`
}

function storeMockParameter(request, paramName, queryValue, sessionKey) {
  const mocksDisabled = config.get('disableTestMocks')

  if (queryValue !== null && !mocksDisabled) {
    if (queryValue === '' || queryValue === 'clear') {
      request.yar.set(sessionKey, null)
      logger.info(`🎨 ${paramName} explicitly cleared from session`)
    } else {
      request.yar.set(sessionKey, queryValue)
      logger.info(`🎨 ${paramName} ${queryValue} stored in session`)
    }
  } else if (mocksDisabled && queryValue !== null) {
    logger.warn(
      `🚫 Attempted to set ${paramName} when mocks disabled (disableTestMocks=true) - ignoring parameter`
    )
  } else {
    // No action needed - parameter not provided or mocks not applicable
  }
}

function applyTestModeChanges(locationData, testMode) {
  if (!testMode) {
    return
  }

  logger.info(`🧪 [CY] TEST MODE ACTIVE: ${testMode}`)

  switch (testMode) {
    case 'noDailySummary':
      logger.info('🧪 [CY] TEST: Removing daily summary data')
      locationData.dailySummary = null
      break

    case 'oldDate': {
      logger.info('🧪 [CY] TEST: Setting old issue_date (yesterday)')
      if (locationData.dailySummary) {
        const yesterday = moment().subtract(1, 'days')
        locationData.dailySummary.issue_date = yesterday.format(DATETIME_FORMAT)
        locationData.englishDate = yesterday.format(DATE_FORMAT)
        const welshMonth = calendarWelsh[yesterday.month()]
        locationData.welshDate = `${yesterday.format('DD')} ${welshMonth} ${yesterday.format('YYYY')}`
        logger.info(
          `🧪 [CY] Changed issue_date to: ${locationData.dailySummary.issue_date}`
        )
      }
      break
    }

    case 'todayDate': {
      logger.info('🧪 [CY] TEST: Setting today issue_date')
      const today = moment()
      if (!locationData.dailySummary) {
        logger.info(
          '🧪 [CY] TEST: Creating dailySummary object (test mode only - not production data)'
        )
        locationData.dailySummary = {}
      }
      locationData.dailySummary.issue_date = today.format(DATETIME_FORMAT)
      locationData.englishDate = today.format(DATE_FORMAT)
      const welshMonth = calendarWelsh[today.month()]
      locationData.welshDate = `${today.format('DD')} ${welshMonth} ${today.format('YYYY')}`
      logger.info(
        `🧪 [CY] Changed issue_date to: ${locationData.dailySummary.issue_date}`
      )
      logger.info(`🧪 [CY] Changed welshDate to: ${locationData.welshDate}`)
      break
    }

    case 'noDataOldDate': {
      logger.info('🧪 [CY] TEST: Removing summary AND setting old date')
      const yesterday = moment().subtract(1, 'days')
      locationData.dailySummary = {
        issue_date: yesterday.format(DATETIME_FORMAT)
      }
      locationData.englishDate = yesterday.format(DATE_FORMAT)
      const welshMonth = calendarWelsh[yesterday.month()]
      locationData.welshDate = `${yesterday.format('DD')} ${welshMonth} ${yesterday.format('YYYY')}`
      logger.info(
        `🧪 [CY] Changed issue_date to: ${locationData.dailySummary.issue_date}`
      )
      logger.info(`🧪 [CY] Removed daily summary data (only kept issue_date)`)
      break
    }

    default:
      logger.warn(`🧪 [CY] Unknown testMode: ${testMode}`)
  }
}

function recalculateSummaryDate(locationData) {
  const isSummaryDateToday = (issueDate) => {
    if (!issueDate) {
      return false
    }
    const today = moment().format(ISSUE_DATE_FORMAT)
    const issueDateFormatted = moment(issueDate).format(ISSUE_DATE_FORMAT)
    return today === issueDateFormatted
  }

  if (locationData.dailySummary?.issue_date) {
    locationData.showSummaryDate = isSummaryDateToday(
      locationData.dailySummary.issue_date
    )
    locationData.issueTime = getIssueTime(locationData.dailySummary.issue_date)
    logger.info(
      `🧪 [CY] Re-calculated showSummaryDate: ${locationData.showSummaryDate}`
    )
    logger.info(`🧪 [CY] Re-calculated issueTime: ${locationData.issueTime}`)
  } else {
    locationData.showSummaryDate = false
    locationData.issueTime = null
    logger.info(
      `🧪 [CY] No dailySummary.issue_date - set showSummaryDate to false`
    )
  }
}

function validateSessionData(locationData, currentUrl, h, request) {
  if (!Array.isArray(locationData?.results) || !locationData?.getForecasts) {
    request.yar.clear('locationData')
    return h
      .redirect(buildRedirectUrl(currentUrl, request))
      .code(REDIRECT_STATUS_CODE)
      .takeover()
  }
  return null
}

function applyTestModeAndRecalculate(locationData, request) {
  const testModeFromQuery = request.query?.testMode
  const testModeFromSession = request.yar.get('testMode')
  const testMode = testModeFromQuery || testModeFromSession
  logger.info(`🔍 [CY] request.query.testMode:`, testModeFromQuery)
  logger.info(`🔍 [CY] session testMode:`, testModeFromSession)
  logger.info(`🔍 [CY] final testMode:`, testMode)
  applyTestModeChanges(locationData, testMode)
  if (testMode) {
    recalculateSummaryDate(locationData)
  }
}

function calculateSummaryDateIfNeeded(locationData) {
  if (
    locationData.showSummaryDate === null &&
    locationData.dailySummary?.issue_date
  ) {
    const today = moment().format(ISSUE_DATE_FORMAT)
    const issueDate = moment(locationData.dailySummary.issue_date).format(
      ISSUE_DATE_FORMAT
    )
    locationData.showSummaryDate = today === issueDate
    locationData.issueTime = getIssueTime(locationData.dailySummary.issue_date)
  }
}

// '' - Helper to handle successful location data processing
function handleSuccessfulLocationData(
  processedData,
  request,
  locationData,
  initData,
  h
) {
  optimizeLocationDataInSession(
    request,
    locationData,
    processedData.nearestLocation,
    processedData.nearestLocationsRange
  )
  calculateSummaryDateIfNeeded(locationData)
  const modifiedMonitoringSites = applyMockPollutants(
    request,
    processedData.nearestLocationsRange
  )
  const viewData = buildLocationViewData({
    locationDetails: processedData.locationDetails,
    nearestLocationsRange: modifiedMonitoringSites,
    locationData,
    forecastNum: processedData.forecastNum,
    lang: LANG_CY,
    getMonth: initData.getMonth,
    metaSiteUrl: initData.metaSiteUrl,
    airQualityData,
    siteTypeDescriptions,
    pollutantTypes,
    request,
    locationId: processedData.locationDetails.id
  })
  return renderLocationView(h, viewData)
}

async function processLocationRequest(request, h) {
  const { query } = request
  const locationId = request.params.id
  const searchTermsSaved = request.yar.get('searchTermsSaved')
  const useNewRicardoMeasurementsEnabled = config.get(
    'useNewRicardoMeasurementsEnabled'
  )

  storeMockParameter(request, 'Mock level', query?.mockLevel, 'mockLevel')
  storeMockParameter(request, 'Mock day', query?.mockDay, 'mockDay')
  storeMockParameter(
    request,
    'Mock pollutant band',
    query?.mockPollutantBand,
    'mockPollutantBand'
  )
  storeMockParameter(request, 'Test mode', query?.testMode, 'testMode')

  if (shouldRedirectToEnglish(query)) {
    return h.redirect(`/location/${locationId}/?lang=en`)
  }
  const previousUrl = getPreviousUrl(request)
  const currentUrl = request.url.href

  if (!previousUrl && !searchTermsSaved) {
    request.yar.clear('locationData')
    return h
      .redirect(buildRedirectUrl(currentUrl, request))
      .code(REDIRECT_STATUS_CODE)
      .takeover()
  }

  const initData = initializeLocationVariables(request, LANG_CY)
  const locationData = request.yar.get('locationData') || {}
  const validationError = validateSessionData(
    locationData,
    currentUrl,
    h,
    request
  )
  if (validationError) {
    return validationError
  }

  applyTestModeAndRecalculate(locationData, request)

  const processedData = await processLocationData(
    request,
    locationData,
    locationId,
    LANG_CY,
    useNewRicardoMeasurementsEnabled
  )

  if (processedData.locationDetails) {
    return handleSuccessfulLocationData(
      processedData,
      request,
      locationData,
      initData,
      h
    )
  } else {
    return renderNotFoundView(h, LANG_CY)
  }
}

const getLocationDetailsController = {
  handler: async (request, h) => {
    try {
      return await processLocationRequest(request, h)
    } catch (error) {
      logger.error(`error on single location ${error.message}`)
      return h
        .response('Internal Server Error')
        .code(HTTP_STATUS_INTERNAL_SERVER_ERROR)
    }
  }
}

export { getLocationDetailsController }
