import {
  siteTypeDescriptions,
  pollutantTypes
} from '../../data/cy/monitoring-sites.js'
import * as airQualityData from '../../data/cy/air-quality.js'
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
    mockPollutantBandFromSession !== undefined &&
    mockPollutantBandFromSession !== null
  ) {
    const bandStr = mockPollutantBandFromSession.toString().toLowerCase()

    logger.info(`🔍 [Welsh] Parsed band:`, bandStr)

    // Validate band
    const validBands = ['low', 'moderate', 'high', 'very-high', 'very high']
    if (
      validBands.includes(bandStr) ||
      validBands.includes(bandStr.replace('-', ' '))
    ) {
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
  return request.headers.referer || request.headers.referrer
}

function buildRedirectUrl(currentUrl, request) {
  const { searchTerms, secondSearchTerm, searchTermsLocationType } =
    getSearchTermsFromUrl(currentUrl)

  // '' Preserve mock parameters from query string
  const mocksDisabled = config.get('disableTestMocks')
  const mockLevel = !mocksDisabled ? request.query?.mockLevel : undefined
  const mockDay = !mocksDisabled ? request.query?.mockDay : undefined
  const mockPollutantBand = !mocksDisabled
    ? request.query?.mockPollutantBand
    : undefined
  const testMode = !mocksDisabled ? request.query?.testMode : undefined

  const mockParams = []
  if (mockLevel !== undefined) {
    mockParams.push(`mockLevel=${encodeURIComponent(mockLevel)}`)
  }
  if (mockDay !== undefined) {
    mockParams.push(`mockDay=${encodeURIComponent(mockDay)}`)
  }
  if (mockPollutantBand !== undefined) {
    mockParams.push(
      `mockPollutantBand=${encodeURIComponent(mockPollutantBand)}`
    )
  }
  if (testMode !== undefined) {
    mockParams.push(`testMode=${encodeURIComponent(testMode)}`)
  }

  const mockParamsString =
    mockParams.length > 0 ? `&${mockParams.join('&')}` : ''

  return `/lleoliad?lang=cy&searchTerms=${encodeURIComponent(searchTerms)}&secondSearchTerm=${encodeURIComponent(secondSearchTerm)}&searchTermsLocationType=${encodeURIComponent(searchTermsLocationType)}${mockParamsString}`
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

      // Store mockLevel in session if provided
      if (query?.mockLevel !== undefined && !mocksDisabled) {
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

      // Store mockDay in session if provided
      if (query?.mockDay !== undefined && !mocksDisabled) {
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

      // Store mockPollutantBand in session if provided
      if (query?.mockPollutantBand !== undefined && !mocksDisabled) {
        if (
          query.mockPollutantBand === '' ||
          query.mockPollutantBand === 'clear'
        ) {
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

      // Store testMode in session if provided
      if (query?.testMode !== undefined && !mocksDisabled) {
        request.yar.set('testMode', query.testMode)
        logger.info(`🧪 Test mode ${query.testMode} stored in session`)
      } else if (mocksDisabled && query?.testMode !== undefined) {
        logger.warn(
          `🚫 Attempted to set test mode when mocks disabled (disableTestMocks=true) - ignoring parameter`
        )
      }

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

      // Process Welsh location data using helper
      const processedData = await processLocationData(
        request,
        locationData,
        locationId,
        LANG_CY,
        useNewRicardoMeasurementsEnabled
      )

      if (processedData.locationDetails) {
        // Optimize session data to reduce memory usage
        optimizeLocationDataInSession(
          request,
          locationData,
          processedData.nearestLocation,
          processedData.nearestLocationsRange
        )

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
          locationData.issueTime = getIssueTime(
            locationData.dailySummary.issue_date
          )
        }

        // '' Apply mock pollutant bands if requested
        const modifiedMonitoringSites = applyMockPollutants(
          request,
          processedData.nearestLocationsRange
        )

        // Build view data using helper
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
      } else {
        return renderNotFoundView(h, LANG_CY)
      }
    } catch (error) {
      logger.error(`error on single location ${error.message}`)
      return h
        .response('Internal Server Error')
        .code(HTTP_STATUS_INTERNAL_SERVER_ERROR)
    }
  }
}

export { getLocationDetailsController }
