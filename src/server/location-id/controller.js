import {
  DAILY_SUMMARY_KEY,
  LOCATION_NOT_FOUND,
  LOCATION_TYPE_NI,
  REDIRECT_STATUS_CODE,
  STATUS_INTERNAL_SERVER_ERROR
} from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { calendarEnglish } from '../data/en/en.js'
import moment from 'moment-timezone'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getNearestLocation } from '../locations/helpers/get-nearest-location.js'
import { getIdMatch } from '../locations/helpers/get-id-match.js'
import { getNIData } from '../locations/helpers/get-ni-single-data.js'
import sizeof from 'object-sizeof'
import { config } from '../../config/index.js'
import {
  initializeRequestData,
  validateAndProcessSessionData as validateSessionData
} from './controller-helpers.js'
import {
  applyTestModeChanges,
  calculateSummaryDate,
  determineLocationType
} from './controller-workflow.js'
import {
  buildSharedLocationPayloadCacheKey,
  getSharedLocationPayload,
  setSharedLocationPayload
} from '../common/helpers/location-shared-cache.js'
import {
  buildUserLocationMetaCacheKey,
  getUserDataPayload,
  setUserDataPayload
} from '../common/helpers/user-data-cache.js'
import { processLocationWorkflow } from './helpers/processLocationWorkflow.js'
import { createSessionStateHelpers } from './helpers/session-state-helpers.js'
import { hydrateLocationDataForStatelessLocationId } from './helpers/location-id-hydration-helpers.js'
import {
  handleWelshRedirect,
  handleSearchTermsRedirect,
  buildLocationViewData,
  buildNotFoundViewData
} from './helpers/location-view-routing-helpers.js'

const logger = createLogger()

const {
  hasSessionCookie,
  clearSessionKeyIfExists,
  setSessionKeyIfSessionExists,
  persistLocationDataForLocationRoute,
  resolveLocationDataFromSessionOrSharedCache
} = createSessionStateHelpers({
  config,
  logger,
  buildSharedLocationPayloadCacheKey,
  getSharedLocationPayload,
  setSharedLocationPayload
})

// Helper to update session with nearest location and measurements
async function updateSessionWithNearest(
  request,
  locationData,
  nearestLocation,
  nearestLocationsRange
) {
  const nearestLocationSafe = Array.isArray(nearestLocation)
    ? nearestLocation
    : []
  const nearestLocationsRangeSafe = Array.isArray(nearestLocationsRange)
    ? nearestLocationsRange
    : []

  locationData.getForecasts = nearestLocationSafe
  locationData.getMeasurements = nearestLocationsRangeSafe
  await persistLocationDataForLocationRoute(request, locationData)
}

async function getDistanceForNILocation(
  locationData,
  getForecasts,
  locationType,
  lang,
  request
) {
  if (locationData.locationType !== LOCATION_TYPE_NI) {
    return undefined
  }

  return getNearestLocation(
    locationData?.results,
    getForecasts,
    locationType,
    0,
    lang,
    true,
    { request, skipMeasurements: true }
  )
}

function ensureNIDistanceLatLon(distance, locationData) {
  if (hasUsableDistanceLatLon(distance)) {
    return distance
  }

  return createNIDistanceFallback(distance, locationData)
}

function hasUsableDistanceLatLon(distance) {
  return Boolean(
    distance?.latlon?.lat !== undefined && distance.latlon.lon !== undefined
  )
}

function createNIDistanceFallback(distance, locationData) {
  const firstResult = Array.isArray(locationData?.results)
    ? locationData.results[0]
    : null

  return {
    ...(distance ?? undefined),
    latlon: {
      lat: firstResult?.latitude || 0,
      lon: firstResult?.longitude || 0
    }
  }
}

function sanitizeNearestLocation(nearestLocation) {
  return Array.isArray(nearestLocation) && nearestLocation.length > 0
    ? nearestLocation
    : []
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
  const distance = ensureNIDistanceLatLon(
    await getDistanceForNILocation(
      locationData,
      getForecasts,
      locationType,
      lang,
      request
    ),
    locationData
  )

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
      true,
      { request }
    )

  // Store calculated latlon from geolib in locationData ''
  locationData.latlon = latlon

  // '' Ensure nearestLocation is an array; fallback to empty array if forecasts are missing
  return {
    locationDetails,
    forecastNum,
    nearestLocationsRange,
    nearestLocation: sanitizeNearestLocation(nearestLocation),
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
async function initializeCommonVariables(request, locationId, lang) {
  // '' Clear searchTermsSaved after handleSearchTermsRedirect check (0.685.0 behavior)
  clearSessionKeyIfExists(request, 'searchTermsSaved')
  const currentMonthName = moment().format('MMMM')
  const getMonth = calendarEnglish.indexOf(currentMonthName)
  const metaSiteUrl = getAirQualitySiteUrl(request)
  let locationData = await resolveLocationDataFromSessionOrSharedCache(request)

  const hasLocationData =
    Array.isArray(locationData?.results) && Boolean(locationData?.getForecasts)
  if (!hasLocationData) {
    const hydratedLocationData =
      await hydrateLocationDataForStatelessLocationId(
        request,
        locationId,
        lang,
        logger
      )
    if (hydratedLocationData) {
      locationData = hydratedLocationData
    }
  }

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
  return updateSessionWithNearest(
    request,
    locationData,
    nearestLocation,
    nearestLocationsRange
  ).then(() => h.view('locations/location', viewData))
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
  const searchTermsRedirect = handleSearchTermsRedirect({
    headers,
    searchTermsSaved,
    currentUrl,
    request,
    h,
    hasSessionCookie,
    clearSessionKeyIfExists,
    logger
  })
  if (searchTermsRedirect) {
    return { redirect: searchTermsRedirect }
  }

  // Initialize common variables
  const { getMonth, metaSiteUrl, locationData } =
    await initializeCommonVariables(request, locationId, lang)

  // Validate session data
  const sessionValidationResult = validateAndProcessSessionData(
    locationData,
    currentUrl,
    lang,
    h,
    request,
    locationId
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
async function applyTestModeAndLogDebug(request, locationData) {
  const testModeFromQuery = request.query?.testMode
  const testModeFromSession = request.yar.get('testMode')
  const testMode = testModeFromQuery || testModeFromSession

  logger.info(`🔍 request.query.testMode:`, testModeFromQuery)
  logger.info(`🔍 session testMode:`, testModeFromSession)
  logger.info(`🔍 final testMode:`, testMode)

  if (testMode) {
    applyTestModeChanges(locationData, testMode, logger)
    await persistLocationDataForLocationRoute(request, locationData)
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
        h,
        helpers: {
          logger,
          config,
          constants: {
            REDIRECT_STATUS_CODE,
            LOCATION_NOT_FOUND
          },
          buildUserLocationMetaCacheKey,
          getUserDataPayload,
          setUserDataPayload,
          setSessionKeyIfSessionExists,
          determineLocationType,
          clearSessionKeyIfExists,
          applyTestModeAndLogDebug,
          getNearestLocationData,
          logAndCalculateSummaryDate,
          persistLocationDataForLocationRoute,
          buildLocationViewData: (params) =>
            buildLocationViewData({ ...params, logger }),
          processLocationResult,
          buildNotFoundViewData
        }
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
