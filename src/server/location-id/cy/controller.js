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
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  CY_LOCATION_DATE_TIME_FORMAT,
  CY_LOCATION_DATE_ONLY_FORMAT,
  CY_LOCATION_VALID_MOCK_BANDS
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

/**
 * Check if mock pollutant band is requested and override pollutant data in monitoring sites
 * '' - Non-intrusive: only applies mock if explicitly enabled
 */
function applyMockPollutants(request, monitoringSites) {
  // '' Disable mock functionality when configured (production by default)
  const mocksDisabled = config.get('disableTestMocks')
  if (mocksDisabled) {
    return monitoringSites
  }

  // Check session for mockPollutantBand (preserved across redirects)
  const mockPollutantBandFromSession = request.yar.get('mockPollutantBand')

  if (
    mockPollutantBandFromSession !== undefined &&
    mockPollutantBandFromSession !== null
  ) {
    const bandStr = mockPollutantBandFromSession.toString().toLowerCase()

    // Validate band
    const normalizedBand = bandStr.replace('-', ' ')
    if (
      CY_LOCATION_VALID_MOCK_BANDS.has(bandStr) ||
      CY_LOCATION_VALID_MOCK_BANDS.has(normalizedBand)
    ) {
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
  return monitoringSites
}

function shouldRedirectToEnglish(query) {
  return query?.lang && query?.lang === LANG_EN && !query?.searchTerms
}

function getPreviousUrl(request) {
  return request.headers.referer || request.headers.referrer
}

function buildMockQueryParams(query, mocksDisabled) {
  if (mocksDisabled) {
    return ''
  }

  const params = []
  const keys = ['mockLevel', 'mockDay', 'mockPollutantBand', 'testMode']

  keys.forEach((key) => {
    if (query?.[key] !== undefined) {
      params.push(`${key}=${encodeURIComponent(query[key])}`)
    }
  })

  return params.length > 0 ? `&${params.join('&')}` : ''
}

function buildRedirectUrl(currentUrl, request) {
  const { searchTerms, secondSearchTerm, searchTermsLocationType } =
    getSearchTermsFromUrl(currentUrl)
  const mocksDisabled = config.get('disableTestMocks')
  const mockParamsString = buildMockQueryParams(request?.query, mocksDisabled)

  return `/lleoliad?lang=cy&searchTerms=${encodeURIComponent(searchTerms)}&secondSearchTerm=${encodeURIComponent(secondSearchTerm)}&searchTermsLocationType=${encodeURIComponent(searchTermsLocationType)}${mockParamsString}`
}

function storeSessionParameter(request, paramName, paramValue) {
  if (!request?.yar?.set || paramValue === undefined) {
    return
  }

  if (paramValue === '' || paramValue === 'clear') {
    request.yar.set(paramName, null)
    return
  }

  request.yar.set(paramName, paramValue)
}

function warnMocksDisabled(paramLabel) {
  logger.warn(
    `Attempted to set ${paramLabel.toLowerCase()} when mocks disabled (disableTestMocks=true) - ignoring parameter`
  )
}

function persistMockAndTestModeParams(request, query, mocksDisabled) {
  const mockParamConfig = [
    { key: 'mockLevel', label: 'Mock level' },
    { key: 'mockDay', label: 'Mock day' },
    { key: 'mockPollutantBand', label: 'Mock pollutant band' },
    { key: 'testMode', label: 'Test mode' }
  ]

  mockParamConfig.forEach(({ key, label }) => {
    if (query?.[key] === undefined) {
      return
    }

    if (mocksDisabled) {
      warnMocksDisabled(label)
      return
    }

    if (key === 'testMode') {
      request.yar.set('testMode', query.testMode)
      return
    }

    storeSessionParameter(request, key, query[key])
  })
}

function getWelshFormattedDate(dateValue) {
  const welshMonth = calendarWelsh[dateValue.month()]
  return `${dateValue.format('DD')} ${welshMonth} ${dateValue.format('YYYY')}`
}

function setLocationDates(locationData, dateValue) {
  locationData.englishDate = dateValue.format('DD MMMM YYYY')
  locationData.welshDate = getWelshFormattedDate(dateValue)
}

function applyWelshTestMode(locationData, testMode) {
  switch (testMode) {
    case 'noDailySummary':
      // '' Remove daily summary text only (keep date if today)
      locationData.dailySummary = null
      break

    case 'oldDate':
      // '' Set date to yesterday (date should NOT show)
      if (locationData.dailySummary) {
        const yesterday = moment().subtract(1, 'days')
        locationData.dailySummary.issue_date = yesterday.format(
          CY_LOCATION_DATE_TIME_FORMAT
        )
        setLocationDates(locationData, yesterday)
      }
      break

    case 'todayDate': {
      // '' Set date to today (date SHOULD show)
      const today = moment()
      if (!locationData.dailySummary) {
        locationData.dailySummary = {}
      }
      locationData.dailySummary.issue_date = today.format(
        CY_LOCATION_DATE_TIME_FORMAT
      )
      setLocationDates(locationData, today)
      break
    }

    case 'noDataOldDate': {
      // '' Remove daily summary AND set old date (nothing should show)
      const yesterday = moment().subtract(1, 'days')
      locationData.dailySummary = {
        issue_date: yesterday.format(CY_LOCATION_DATE_TIME_FORMAT)
      }
      setLocationDates(locationData, yesterday)
      break
    }

    default:
      logger.warn(`[CY] Unknown testMode: ${testMode}`)
  }
}

function isSummaryDateToday(issueDate) {
  if (!issueDate) {
    return false
  }
  const today = moment().format(CY_LOCATION_DATE_ONLY_FORMAT)
  const issueDateFormatted = moment(issueDate).format(
    CY_LOCATION_DATE_ONLY_FORMAT
  )
  return today === issueDateFormatted
}

function recalculateSummaryDateFields(locationData) {
  if (locationData.dailySummary?.issue_date) {
    locationData.showSummaryDate = isSummaryDateToday(
      locationData.dailySummary.issue_date
    )
    locationData.issueTime = getIssueTime(locationData.dailySummary.issue_date)
    return
  }

  locationData.showSummaryDate = false
  locationData.issueTime = null
}

function applyTestModeFromQueryOrSession(request, locationData) {
  const testModeFromQuery = request.query?.testMode
  const testModeFromSession = request.yar.get('testMode')
  const testMode = testModeFromQuery || testModeFromSession

  if (!testMode) {
    return
  }

  applyWelshTestMode(locationData, testMode)
  recalculateSummaryDateFields(locationData)
}

function ensureSummaryDateForDirectAccess(locationData) {
  if (
    locationData.showSummaryDate !== undefined ||
    !locationData.dailySummary?.issue_date
  ) {
    return
  }

  const today = moment().format(CY_LOCATION_DATE_ONLY_FORMAT)
  const issueDate = moment(locationData.dailySummary.issue_date).format(
    CY_LOCATION_DATE_ONLY_FORMAT
  )
  locationData.showSummaryDate = today === issueDate
  locationData.issueTime = getIssueTime(locationData.dailySummary.issue_date)
}

function renderProcessedLocationOrNotFound({
  h,
  request,
  locationData,
  processedData,
  initData,
  locationId
}) {
  if (!processedData.locationDetails) {
    return renderNotFoundView(h, LANG_CY)
  }

  optimizeLocationDataInSession(
    request,
    locationData,
    processedData.nearestLocation,
    processedData.nearestLocationsRange
  )

  ensureSummaryDateForDirectAccess(locationData)

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
    locationId
  })

  return renderLocationView(h, viewData)
}

// Cleaned up - UI components and helper functions now handled by shared helper

const getLocationDetailsController = {
  handler: async (request, h) => {
    try {
      const { query } = request
      const locationId = request.params.id
      const searchTermsSaved = request.yar.get('searchTermsSaved')
      const useNewRicardoMeasurementsEnabled = config.get(
        'useNewRicardoMeasurementsEnabled'
      )

      // '' Store mock parameters in session (mockLevel, mockDay, mockPollutantBand, testMode)
      const mocksDisabled = config.get('disableTestMocks')
      persistMockAndTestModeParams(request, query, mocksDisabled)

      if (shouldRedirectToEnglish(query)) {
        return h.redirect(`/location/${locationId}/?lang=en`)
      }
      // Get the previous URL hit by the user from the referer header
      const previousUrl = getPreviousUrl(request)
      const currentUrl = request.url.href

      if (previousUrl === undefined && !searchTermsSaved) {
        request.yar.clear('locationData')
        return h
          .redirect(buildRedirectUrl(currentUrl, request))
          .code(REDIRECT_STATUS_CODE)
          .takeover()
      }

      // Initialize Welsh variables using helper
      const initData = initializeLocationVariables(request, LANG_CY)
      const locationData = request.yar.get('locationData') || {}

      // Validate session data - redirect to search if missing required data
      if (
        !Array.isArray(locationData?.results) ||
        !locationData?.getForecasts
      ) {
        request.yar.clear('locationData')
        return h
          .redirect(buildRedirectUrl(currentUrl))
          .code(REDIRECT_STATUS_CODE)
          .takeover()
      }
      applyTestModeFromQueryOrSession(request, locationData)

      // Process Welsh location data using helper
      const processedData = await processLocationData(
        request,
        locationData,
        locationId,
        LANG_CY,
        useNewRicardoMeasurementsEnabled
      )

      return renderProcessedLocationOrNotFound({
        h,
        request,
        locationData,
        processedData,
        initData,
        locationId
      })
    } catch (error) {
      logger.error(`error on single location ${error.message}`)
      return h
        .response('Internal Server Error')
        .code(HTTP_STATUS_INTERNAL_SERVER_ERROR)
    }
  }
}

export { getLocationDetailsController }
