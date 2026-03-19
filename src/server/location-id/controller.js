import {
  siteTypeDescriptions,
  pollutantTypes
} from '../data/en/monitoring-sites.js'
import * as airQualityData from '../data/en/air-quality.js'
import {
  DAILY_SUMMARY_KEY,
  DATE_FORMAT,
  LANG_CY,
  LOCATION_NOT_FOUND,
  LOCATION_TYPE_NI,
  LOCATION_TYPE_UK,
  REDIS_PRESSURE_MIN_GROWTH_RATIO,
  REDIRECT_STATUS_CODE,
  SESSION_GUARD_LOG_LIMIT_PER_REQUEST,
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
import { getSessionRedisClient } from '../common/helpers/session-cache/cache-engine.js'
import {
  buildSharedLocationPayloadCacheKey,
  getSharedLocationPayload,
  setSharedLocationPayload
} from '../common/helpers/location-shared-cache.js'
import { fetchData } from '../locations/helpers/fetch-data.js'
import { createURLRouteBookmarks } from '../locations/helpers/create-bookmark-ids.js'
import {
  buildUserLocationMetaCacheKey,
  getUserDataPayload,
  setUserDataPayload
} from '../common/helpers/user-data-cache.js'
import { processLocationWorkflow } from './helpers/processLocationWorkflow.js'

const logger = createLogger()

const redisPressureGuardState = {
  lastCheckAtMs: 0,
  lastUsedMemoryBytes: null,
  activeUntilMs: 0,
  inFlight: false
}

function hasSessionCookie(request) {
  const sessionCookieName = config.get('session.cache.name')
  return Boolean(request?.state?.[sessionCookieName])
}

function isGlobalSessionGuardEnabled() {
  const env = config.get('env') || config.get('nodeEnv')
  if (env === 'production') {
    return true
  }

  if (env === 'test') {
    return false
  }

  // '' Master guard switch for local/dev simulation
  const globalGuardEnabled = config.get('session.cache.globalGuardEnabled')
  return typeof globalGuardEnabled === 'boolean' ? globalGuardEnabled : true
}

function logSessionGuardSkip(request, operation, sessionKey, reason) {
  const currentCount = request?.app?.sessionGuardSkipCount || 0
  const nextCount = currentCount + 1

  if (request?.app) {
    request.app.sessionGuardSkipCount = nextCount
  }

  if (nextCount <= SESSION_GUARD_LOG_LIMIT_PER_REQUEST) {
    logger.info(
      `[SESSION GUARD] Skipped session ${operation} for key='${sessionKey}' (${reason})`
    )
  }
}

function parseRedisInfoValue(infoText, key) {
  const match = infoText?.match(new RegExp(`^${key}:(.*)$`, 'm'))
  return match && match[1] ? match[1].trim() : ''
}

function getRedisPressureConfigValue(path, fallbackValue) {
  const configuredValue = Number(config.get(path))
  return Number.isFinite(configuredValue) && configuredValue > 0
    ? configuredValue
    : fallbackValue
}

function getRedisPressureThresholds() {
  const checkIntervalMs = getRedisPressureConfigValue(
    'session.cache.redisPressure.checkIntervalMs',
    10000
  )
  const windowMs = getRedisPressureConfigValue(
    'session.cache.redisPressure.windowMs',
    30000
  )
  const cooldownMs = getRedisPressureConfigValue(
    'session.cache.redisPressure.cooldownMs',
    300000
  )
  const minGrowthMebibytes = getRedisPressureConfigValue(
    'session.cache.redisPressure.minGrowthMebibytes',
    20
  )
  const bytesPerMebibyte = getRedisPressureConfigValue(
    'session.cache.redisPressure.bytesPerMebibyte',
    1024 * 1024
  )

  return {
    checkIntervalMs,
    windowMs,
    cooldownMs,
    minGrowthBytes: minGrowthMebibytes * bytesPerMebibyte
  }
}

function isRedisPressureGuardActive() {
  return redisPressureGuardState.activeUntilMs > Date.now()
}

function maybeRefreshRedisPressureGuard() {
  const nowMs = Date.now()
  const { checkIntervalMs, windowMs, cooldownMs, minGrowthBytes } =
    getRedisPressureThresholds()

  if (redisPressureGuardState.inFlight) {
    return
  }

  if (nowMs - redisPressureGuardState.lastCheckAtMs < checkIntervalMs) {
    return
  }

  const redisClient = getSessionRedisClient()
  if (!redisClient) {
    return
  }

  const previousCheckAtMs = redisPressureGuardState.lastCheckAtMs
  redisPressureGuardState.inFlight = true
  redisPressureGuardState.lastCheckAtMs = nowMs

  redisClient
    .info('memory')
    .then((memoryInfo) => {
      const usedMemoryBytes = Number(
        parseRedisInfoValue(memoryInfo, 'used_memory')
      )

      if (!Number.isFinite(usedMemoryBytes)) {
        return
      }

      const previousUsedMemoryBytes =
        redisPressureGuardState.lastUsedMemoryBytes
      const elapsedMs = nowMs - previousCheckAtMs

      if (Number.isFinite(previousUsedMemoryBytes) && elapsedMs <= windowMs) {
        const growthBytes = usedMemoryBytes - previousUsedMemoryBytes
        const growthRatio =
          previousUsedMemoryBytes > 0
            ? growthBytes / previousUsedMemoryBytes
            : 0

        if (
          growthBytes >= minGrowthBytes &&
          growthRatio >= REDIS_PRESSURE_MIN_GROWTH_RATIO
        ) {
          redisPressureGuardState.activeUntilMs = Date.now() + cooldownMs

          logger.warn(
            `[SESSION GUARD] Redis pressure guard activated growthBytes=${growthBytes} growthRatio=${growthRatio.toFixed(3)} cooldownMs=${cooldownMs}`
          )
        }
      }

      redisPressureGuardState.lastUsedMemoryBytes = usedMemoryBytes
    })
    .catch((error) => {
      logger.warn(
        `[SESSION GUARD] Redis pressure sample failed: ${error.message}`
      )
    })
    .finally(() => {
      redisPressureGuardState.inFlight = false
    })
}

function isSessionMutationAllowed(request, operation, sessionKey) {
  const isGlobalGuardEnabled = isGlobalSessionGuardEnabled()

  if (isGlobalGuardEnabled && !hasSessionCookie(request)) {
    logSessionGuardSkip(request, operation, sessionKey, 'no session cookie')
    return false
  }

  if (isGlobalGuardEnabled) {
    maybeRefreshRedisPressureGuard()
    if (isRedisPressureGuardActive()) {
      logSessionGuardSkip(
        request,
        operation,
        sessionKey,
        'redis pressure guard active'
      )
      return false
    }
  }

  return true
}

function clearSessionKeyIfExists(request, sessionKey) {
  if (!isSessionMutationAllowed(request, 'clear', sessionKey)) {
    return
  }

  const currentValue = request?.yar?.get?.(sessionKey)
  if (currentValue !== undefined) {
    request.yar.clear(sessionKey)
    if (sessionKey === 'locationData') {
      request.yar.clear('locationDataCacheKey')
    }
  }
}

function isObjectLikeValue(value) {
  return Boolean(value && typeof value === 'object')
}

function hasObjectReferencePair(currentValue, nextValue) {
  return isObjectLikeValue(currentValue) && isObjectLikeValue(nextValue)
}

function areObjectValuesEqual(currentValue, nextValue) {
  try {
    return JSON.stringify(currentValue) === JSON.stringify(nextValue)
  } catch {
    return false
  }
}

function areSessionValuesEqual(currentValue, nextValue) {
  if (Object.is(currentValue, nextValue)) {
    if (hasObjectReferencePair(currentValue, nextValue)) {
      return false
    }
    return true
  }

  if (hasObjectReferencePair(currentValue, nextValue)) {
    return areObjectValuesEqual(currentValue, nextValue)
  }

  return false
}

function setSessionKeyIfSessionExists(request, sessionKey, value) {
  if (!isSessionMutationAllowed(request, 'set', sessionKey)) {
    return
  }

  const currentValue = request?.yar?.get?.(sessionKey)
  if (areSessionValuesEqual(currentValue, value)) {
    return
  }

  request.yar.set(sessionKey, value)
}

async function persistLocationDataForLocationRoute(request, locationData) {
  if (!isSessionMutationAllowed(request, 'set', 'locationData')) {
    return
  }

  const cacheKey = buildSharedLocationPayloadCacheKey(request, locationData)
  const isSharedCacheWriteSuccessful = await setSharedLocationPayload(
    request,
    cacheKey,
    locationData
  )

  if (!isSharedCacheWriteSuccessful) {
    setSessionKeyIfSessionExists(request, 'locationData', locationData)
    return
  }

  const locationDataLite = {
    cacheKey,
    locationType: locationData?.locationType,
    showSummaryDate: locationData?.showSummaryDate,
    issueTime: locationData?.issueTime,
    englishDate: locationData?.englishDate,
    welshDate: locationData?.welshDate,
    dailySummary: locationData?.dailySummary
      ? { issue_date: locationData.dailySummary.issue_date }
      : undefined
  }

  setSessionKeyIfSessionExists(request, 'locationDataCacheKey', cacheKey)
  setSessionKeyIfSessionExists(request, 'locationData', locationDataLite)
}

async function resolveLocationDataFromSessionOrSharedCache(request) {
  const sessionLocationData = request.yar.get('locationData') || {}
  const hasFullLocationData =
    Array.isArray(sessionLocationData?.results) &&
    Boolean(sessionLocationData?.getForecasts)

  if (hasFullLocationData) {
    return sessionLocationData
  }

  const sessionCacheKey = request.yar.get('locationDataCacheKey')
  const locationDataCacheKey =
    sessionCacheKey ||
    buildSharedLocationPayloadCacheKey(request, sessionLocationData)

  const sharedLocationData = await getSharedLocationPayload(
    request,
    locationDataCacheKey
  )
  if (sharedLocationData) {
    return sharedLocationData
  }

  return sessionLocationData
}

function normalizeLocationIdTerms(locationId = '') {
  const decodedId = decodeURIComponent(locationId || '').toLowerCase()
  const [primaryPart = '', ...secondaryParts] = decodedId.split('_')

  return {
    searchTerms: primaryPart.replace(/-/g, ' ').trim(),
    secondSearchTerm: secondaryParts.join('_').replace(/-/g, ' ').trim()
  }
}

function shouldSkipStatelessHydration(env, locationId) {
  return env === 'test' || !locationId
}

function hasPlacesResults(getOSPlaces) {
  return Boolean(
    Array.isArray(getOSPlaces?.results) && getOSPlaces.results.length > 0
  )
}

function hasLocationIdMatch(selectedMatchesAddedIDs, locationId) {
  return selectedMatchesAddedIDs.some(
    (item) => item?.GAZETTEER_ENTRY?.ID === locationId
  )
}

async function hydrateLocationDataForStatelessLocationId(
  request,
  locationId,
  lang
) {
  const env = config.get('env') || config.get('nodeEnv')
  // '' Attempt direct-id hydration even with a session cookie, because
  // '' stale/empty session payloads can happen on bookmarked URLs.
  if (shouldSkipStatelessHydration(env, locationId)) {
    return null
  }

  const { searchTerms, secondSearchTerm } = normalizeLocationIdTerms(locationId)
  const userLocation = [searchTerms, secondSearchTerm].filter(Boolean).join(' ')

  if (!userLocation) {
    return null
  }

  try {
    const { getOSPlaces, getForecasts, getDailySummary } = await fetchData(
      request,
      {
        locationType: LOCATION_TYPE_UK,
        userLocation,
        searchTerms,
        secondSearchTerm
      }
    )

    if (!hasPlacesResults(getOSPlaces)) {
      return null
    }

    const { selectedMatchesAddedIDs } = createURLRouteBookmarks([
      ...getOSPlaces.results
    ])

    if (!hasLocationIdMatch(selectedMatchesAddedIDs, locationId)) {
      return null
    }

    const hydratedLocationData = {
      results: selectedMatchesAddedIDs,
      getForecasts: getForecasts?.forecasts,
      dailySummary: getDailySummary,
      locationType: LOCATION_TYPE_UK,
      lang,
      urlRoute: locationId
    }

    const cacheKey = buildSharedLocationPayloadCacheKey(
      request,
      hydratedLocationData
    )
    await setSharedLocationPayload(request, cacheKey, hydratedLocationData)

    logger.info(
      `[STATLESS LOCATION-ID] Hydrated locationData for id='${locationId}'`
    )

    return hydratedLocationData
  } catch (error) {
    logger.warn(
      `[STATLESS LOCATION-ID] Hydration failed for id='${locationId}': ${error.message}`
    )
    return null
  }
}

function getNILatLon(locationData = {}) {
  if (locationData?.locationType !== LOCATION_TYPE_NI) {
    return null
  }

  const firstResult = Array.isArray(locationData?.results)
    ? locationData.results[0]
    : null
  const lat = Number(firstResult?.latitude)
  const lon = Number(firstResult?.longitude)

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null
  }

  return { lat, lon }
}

function getFiniteFallbackLatLon(fallbackLatlon = {}) {
  const lat = Number(fallbackLatlon?.lat)
  const lon = Number(fallbackLatlon?.lon)

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null
  }

  return { lat, lon }
}

// '' Helper to resolve alert coordinates with NI-safe fallback
function resolveAlertLatLon(locationData = {}, fallbackLatlon = {}) {
  const niLatLon = getNILatLon(locationData)
  if (niLatLon) {
    return niLatLon
  }

  const fallbackCoordinates = getFiniteFallbackLatLon(fallbackLatlon)
  if (fallbackCoordinates) {
    return fallbackCoordinates
  }

  return { lat: undefined, lon: undefined }
}

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

function normalizeSearchTermsForRedirect(searchTerms, request) {
  const fallbackSearchTerms = request?.params?.id || ''
  let safeSearchTerms = searchTerms || fallbackSearchTerms

  // '' Check if searchTerms is a normalized Northern Ireland postcode (e.g., bt938ad)
  // '' and convert it back to proper format (e.g., BT93 8AD)
  const normalizedNIPostcodeRegex = /^bt\d{1,2}\d[a-z]{2}$/i
  if (normalizedNIPostcodeRegex.test(safeSearchTerms)) {
    logger.info(
      `[DEBUG controller] Detected normalized NI postcode: ${safeSearchTerms}`
    )
    safeSearchTerms = formatNorthernIrelandPostcode(
      safeSearchTerms.toUpperCase()
    )
    logger.info(
      `[DEBUG controller] Converted to formatted NI postcode: ${safeSearchTerms}`
    )
  }

  return safeSearchTerms
}

function getSearchRedirectParams(currentUrl, request) {
  const { searchTerms, secondSearchTerm, searchTermsLocationType } =
    getSearchTermsFromUrl(currentUrl)

  const safeSearchTerms = normalizeSearchTermsForRedirect(searchTerms, request)
  const safeSecondSearchTerm = secondSearchTerm || ''
  const safeSearchTermsLocationType =
    !searchTermsLocationType || searchTermsLocationType === 'Invalid Postcode'
      ? LOCATION_TYPE_UK
      : searchTermsLocationType

  return {
    safeSearchTerms,
    safeSecondSearchTerm,
    safeSearchTermsLocationType
  }
}

function buildDefinedQueryParams(query = {}) {
  const params = []

  if (query.mockLevel !== undefined) {
    params.push(`mockLevel=${encodeURIComponent(query.mockLevel)}`)
  }

  if (query.mockDay !== undefined) {
    params.push(`mockDay=${encodeURIComponent(query.mockDay)}`)
  }

  if (query.mockPollutantBand !== undefined) {
    params.push(
      `mockPollutantBand=${encodeURIComponent(query.mockPollutantBand)}`
    )
  }

  if (query.testMode !== undefined) {
    params.push(`testMode=${encodeURIComponent(query.testMode)}`)
  }

  return params.length > 0 ? `&${params.join('&')}` : ''
}

function buildMockParamsForSearchRedirect(request) {
  // '' Disable mock functionality when configured (production by default)
  const mocksDisabled = config.get('disableTestMocks')
  return mocksDisabled ? '' : buildDefinedQueryParams(request?.query)
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
  const isPreviousAndCurrentUrlEqual = previousUrl
    ? compareLastElements(previousUrl, currentUrl)
    : false

  // '' Allow first-hit bookmark requests without a session cookie to proceed statelessly
  const hasSession = hasSessionCookie(request)
  logger.info(
    `[DEBUG controller] isPreviousAndCurrentUrlEqual: ${isPreviousAndCurrentUrlEqual}`
  )
  if (!isPreviousAndCurrentUrlEqual || searchTermsSaved || !hasSession) {
    logger.info(`[DEBUG controller] NOT redirecting - searchTermsSaved found`)
    return null
  }

  logger.info(`[DEBUG controller] REDIRECTING because searchTermsSaved is missing`)

  const {
    safeSearchTerms,
    safeSecondSearchTerm,
    safeSearchTermsLocationType
  } = getSearchRedirectParams(currentUrl, request)

  clearSessionKeyIfExists(request, 'locationData')
  logger.info('Redirecting to location search')

  const mockParams = buildMockParamsForSearchRedirect(request)

  return h
    .redirect(
      `/location?lang=en&searchTerms=${encodeURIComponent(safeSearchTerms)}&secondSearchTerm=${encodeURIComponent(safeSecondSearchTerm)}&searchTermsLocationType=${encodeURIComponent(safeSearchTermsLocationType)}${mockParams}`
    )
    .code(REDIRECT_STATUS_CODE)
    .takeover()
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
  // '' Prefer NI search result coordinates for alert links to avoid forecast grid mismatches
  // Format coordinates to 4 decimal places for alert links ''
  const rawLatlon = resolveAlertLatLon(locationData, locationData.latlon)
  const latlon = {
    lat: Number.isFinite(rawLatlon.lat)
      ? Number(rawLatlon.lat.toFixed(4))
      : undefined,
    lon: Number.isFinite(rawLatlon.lon)
      ? Number(rawLatlon.lon.toFixed(4))
      : undefined
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
async function updateSessionWithNearest(
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
    distance?.latlon &&
      distance.latlon.lat !== undefined &&
      distance.latlon.lon !== undefined
  )
}

function createNIDistanceFallback(distance, locationData) {
  const firstResult = Array.isArray(locationData?.results)
    ? locationData.results[0]
    : null

  return {
    ...(distance || {}),
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
  const formattedDate = moment().format(DATE_FORMAT).split(' ')
  const getMonth = calendarEnglish.findIndex((item) =>
    item.includes(formattedDate[1])
  )
  const metaSiteUrl = getAirQualitySiteUrl(request)
  let locationData = await resolveLocationDataFromSessionOrSharedCache(request)

  const hasLocationData =
    Array.isArray(locationData?.results) && Boolean(locationData?.getForecasts)
  if (!hasLocationData) {
    const hydratedLocationData =
      await hydrateLocationDataForStatelessLocationId(request, locationId, lang)
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
    await initializeCommonVariables(request, locationId, lang)

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
          buildLocationViewData,
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
