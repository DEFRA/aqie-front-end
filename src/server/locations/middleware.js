import { fetchData } from './helpers/fetch-data.js'
import { english, calendarEnglish } from '../data/en/en.js'
import { calendarWelsh } from '../data/cy/cy.js'
import { transformKeys } from './helpers/transform-summary-keys.js'
import {
  getFormattedDateSummary,
  getLanguageDates
} from './helpers/middleware-helpers.js'
import {
  LANG_EN,
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI,
  LOCATION_NOT_FOUND_URL,
  WRONG_POSTCODE,
  STATUS_NOT_FOUND,
  STATUS_INTERNAL_SERVER_ERROR,
  REDIRECT_STATUS_CODE
} from '../data/constants.js'
import { handleUKLocationType } from './helpers/extra-middleware-helpers.js'
import { handleErrorInputAndRedirect } from './helpers/error-input-and-redirect.js'
import { getMonth } from './helpers/location-type-util.js'
import * as airQualityData from '../data/en/air-quality.js'
import {
  isValidPartialPostcodeNI,
  isValidPartialPostcodeUK
} from './helpers/convert-string.js'
import { sentenceCase } from '../common/helpers/sentence-case.js'
import { convertFirstLetterIntoUppercase } from './helpers/convert-first-letter-into-upper-case.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { config } from '../../config/index.js'
import proj4 from 'proj4'

const logger = createLogger()

const handleLocationDataNotFound = (
  request,
  h,
  locationNameOrPostcode,
  lang,
  searchTerms
) => {
  request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
  if (searchTerms) {
    request.yar.clear('searchTermsSaved')
    // '' Render error view directly to avoid redirect
    return h
      .view('error/index', {
        pageTitle: english.notFoundUrl.nonService.pageTitle,
        heading: 'Page not found',
        statusCode: STATUS_NOT_FOUND,
        message: 'Page not found',
        url: request.path,
        notFoundUrl: english.notFoundUrl,
        displayBacklink: false,
        phaseBanner: english.phaseBanner,
        footerTxt: english.footerTxt,
        cookieBanner: english.cookieBanner,
        serviceName: english.multipleLocations.serviceName,
        lang
      })
      .code(STATUS_NOT_FOUND)
      .takeover()
  }
  return h.redirect('location-not-found').takeover()
}

// '' Helper: Render service unavailable page for upstream failures
const handleServiceUnavailable = (request, h, lang) => {
  return h
    .view('error/index', {
      pageTitle: english.notFoundUrl.serviceAPI.pageTitle,
      heading: english.notFoundUrl.serviceAPI.heading,
      statusCode: STATUS_INTERNAL_SERVER_ERROR,
      message: english.notFoundUrl.serviceAPI.heading,
      url: request.path,
      notFoundUrl: english.notFoundUrl,
      displayBacklink: false,
      phaseBanner: english.phaseBanner,
      footerTxt: english.footerTxt,
      cookieBanner: english.cookieBanner,
      serviceName: english.multipleLocations.serviceName,
      lang
    })
    .code(STATUS_INTERNAL_SERVER_ERROR)
    .takeover()
}

const processUKLocationType = (request, h, redirectError, options = {}) => {
  const {
    userLocation,
    locationNameOrPostcode,
    lang,
    searchTerms,
    secondSearchTerm,
    getOSPlaces,
    getDailySummary,
    getForecasts,
    transformedDailySummary,
    englishDate,
    welshDate,
    month
  } = options

  const locationType = redirectError.locationType
  return handleUKLocationType(request, h, {
    locationType,
    userLocation,
    locationNameOrPostcode,
    lang,
    searchTerms,
    secondSearchTerm,
    getOSPlaces,
    airQualityData,
    getDailySummary,
    getForecasts,
    transformedDailySummary,
    calendarWelsh,
    englishDate,
    welshDate,
    month,
    english
  })
}

// '' Helper: Extract location title from result object with fallback chain
const getLocationTitle = (result, searchTerms) => {
  // '' For NI locations (have postcode + town), always use "POSTCODE, TOWN" format
  if (result?.postcode && result?.town) {
    return `${result.postcode}, ${sentenceCase(result.town)}`
  }

  // '' For UK locations, use existing priority logic
  const primaryTitle = result?.localName || result?.secondaryName
  if (primaryTitle) {
    return primaryTitle
  }

  const secondaryTitle = result?.displayName || result?.postcode || result?.town
  return secondaryTitle || searchTerms || 'Location'
}

// '' Helper: Update session with location data for notification flow
const updateNotificationSession = (request, locationData, searchTerms) => {
  const result = locationData?.results?.[0]
  if (!result) {
    return
  }

  const locationTitle = getLocationTitle(result, searchTerms)
  const cleanedLocation = (locationTitle || 'Location')
    .replace(/^\s*air\s+quality\s+in\s+/i, '')
    .trim()
  const sanitizedLocation = cleanedLocation || 'Location'

  request.yar.set(
    'location',
    convertFirstLetterIntoUppercase(sanitizedLocation)
  )
  request.yar.set('locationId', locationData.urlRoute)
  // '' Coordinates should already be in Lat/Long format from convertPointToLonLat
  request.yar.set('latitude', result.latitude)
  request.yar.set('longitude', result.longitude)

  logger.info(
    `[DEBUG updateNotificationSession] Updated session location data:`,
    {
      location: locationTitle,
      locationId: locationData.urlRoute,
      lat: result.latitude,
      lon: result.longitude
    }
  )
}

// '' Helper: Redirect to location not found page
const redirectToLocationNotFound = (
  request,
  h,
  locationNameOrPostcode,
  lang
) => {
  request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
  request.yar.clear('searchTermsSaved')
  return h
    .redirect(`${LOCATION_NOT_FOUND_URL}?lang=en`)
    .code(REDIRECT_STATUS_CODE)
    .takeover()
}

// '' Helper: Build location data object for NI locations
const buildNILocationData = (
  firstNIResult,
  getNIPlaces,
  redirectError,
  options
) => {
  const {
    transformedDailySummary,
    englishDate,
    welshDate,
    getDailySummary,
    month,
    multipleLocations,
    home,
    getForecasts,
    lang
  } = options
  const postcode = firstNIResult.postcode
  const town = sentenceCase(firstNIResult.town)
  const locationTitle = `${postcode}, ${town}`

  // '' Real NI API returns easting/northing (Irish Grid EPSG:29903 coordinates)
  // '' Mock API returns xCoordinate/yCoordinate (WGS84 lat/long)
  // '' Convert Irish Grid to WGS84 lat/long for real API, or use direct coordinates from mock

  // '' Define Irish Grid (EPSG:29903) projection - from epsg.io
  const irishGrid =
    '+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=1.000035 +x_0=200000 +y_0=250000 +ellps=mod_airy +units=m +no_defs +type=crs'
  const wgs84 = 'EPSG:4326'

  // '' Helper: detect Irish Grid numeric coordinates (meters)
  const isIrishGridPair = (coord1, coord2) => {
    const x = Number(coord1)
    const y = Number(coord2)
    return (
      Number.isFinite(x) &&
      Number.isFinite(y) &&
      x > 10000 &&
      x < 500000 &&
      y > 10000 &&
      y < 600000
    )
  }

  const resultsWithCoords = getNIPlaces?.results?.map((result) => {
    let latitude, longitude

    // '' If we have easting/northing (Irish Grid), convert to lat/long
    if (result.easting && result.northing) {
      logger.info(
        `[DEBUG NI COORDS] Converting Irish Grid to WGS84: easting=${result.easting}, northing=${result.northing}`
      )
      const [lon, lat] = proj4(irishGrid, wgs84, [
        result.easting,
        result.northing
      ])
      latitude = lat
      longitude = lon
      logger.info(
        `[DEBUG NI COORDS] Converted to WGS84: latitude=${latitude}, longitude=${longitude}`
      )
    } else if (result.xCoordinate && result.yCoordinate) {
      // '' xCoordinate/yCoordinate may be WGS84 or Irish Grid - detect and convert if needed
      if (isIrishGridPair(result.xCoordinate, result.yCoordinate)) {
        logger.info(
          `[DEBUG NI COORDS] Converting Irish Grid from x/y: easting=${result.xCoordinate}, northing=${result.yCoordinate}`
        )
        const [lon, lat] = proj4(irishGrid, wgs84, [
          Number(result.xCoordinate),
          Number(result.yCoordinate)
        ])
        latitude = lat
        longitude = lon
        logger.info(
          `[DEBUG NI COORDS] Converted x/y to WGS84: latitude=${latitude}, longitude=${longitude}`
        )
      } else {
        logger.info(
          `[DEBUG NI COORDS] Using WGS84 coordinates: latitude=${result.yCoordinate}, longitude=${result.xCoordinate}`
        )
        latitude = result.yCoordinate
        longitude = result.xCoordinate
      }
    } else {
      // '' Fallback to existing lat/long if present
      logger.info(
        `[DEBUG NI COORDS] Using fallback coordinates: latitude=${result.latitude}, longitude=${result.longitude}`
      )
      latitude = result.latitude
      longitude = result.longitude
    }

    return {
      ...result,
      latitude,
      longitude
    }
  })

  return {
    results: resultsWithCoords,
    urlRoute: `${firstNIResult.postcode.toLowerCase()}`.replaceAll(/\s+/g, ''),
    locationType: redirectError.locationType,
    transformedDailySummary,
    englishDate,
    dailySummary: getDailySummary,
    welshDate,
    getMonth: month,
    title: `${multipleLocations.titlePrefix} ${convertFirstLetterIntoUppercase(locationTitle)}`,
    pageTitle: `${multipleLocations.titlePrefix} ${convertFirstLetterIntoUppercase(locationTitle)} - ${home.pageTitle}`,
    getForecasts: getForecasts?.forecasts,
    lang
  }
}

// '' Helper: Log debug information about location data
const logLocationDataDebug = (locationData, retrievedLocationData) => {
  logger.info(`[DEBUG processNILocationType] Setting locationData with:`)
  logger.info(
    `[DEBUG processNILocationType] - results is array: ${Array.isArray(locationData.results)}`
  )
  logger.info(
    `[DEBUG processNILocationType] - results length: ${locationData.results?.length || 0}`
  )
  logger.info(
    `[DEBUG processNILocationType] - getForecasts exists: ${!!locationData.getForecasts}`
  )
  logger.info(
    `[DEBUG processNILocationType] - getForecasts length: ${locationData.getForecasts?.length || 0}`
  )

  logger.info(
    `[DEBUG processNILocationType] After set, locationData from session:`
  )
  logger.info(
    `[DEBUG processNILocationType] - retrieved results is array: ${Array.isArray(retrievedLocationData?.results)}`
  )
  logger.info(
    `[DEBUG processNILocationType] - retrieved getForecasts exists: ${!!retrievedLocationData?.getForecasts}`
  )
}

// '' Helper: Handle notification flow redirects
const handleNotificationFlow = (
  request,
  h,
  notificationFlow,
  locationData,
  searchTerms
) => {
  updateNotificationSession(request, locationData, searchTerms)
  request.yar.clear('notificationFlow')
  logger.info(
    `[DEBUG processNILocationType] Redirecting to ${notificationFlow} confirm details (notificationFlow=${notificationFlow})`
  )

  const smsRedirectUrl = '/notify/register/sms-confirm-details?lang=en'
  const emailRedirectUrl = '/notify/register/email-confirm-details?lang=en'
  const redirectUrl =
    notificationFlow === 'sms' ? smsRedirectUrl : emailRedirectUrl

  return h.redirect(redirectUrl).code(REDIRECT_STATUS_CODE).takeover()
}

const processNILocationType = (request, h, redirectError, options = {}) => {
  const { locationNameOrPostcode, lang, searchTerms, getNIPlaces } = options

  if (
    !getNIPlaces?.results ||
    !Array.isArray(getNIPlaces.results) ||
    getNIPlaces?.results.length === 0 ||
    getNIPlaces === WRONG_POSTCODE
  ) {
    return redirectToLocationNotFound(request, h, locationNameOrPostcode, lang)
  }

  const firstNIResult = getNIPlaces?.results?.[0]
  if (!firstNIResult?.postcode) {
    logger.error('NI mock server returned invalid data - postcode missing')
    return redirectToLocationNotFound(request, h, locationNameOrPostcode, lang)
  }

  const locationData = buildNILocationData(
    firstNIResult,
    getNIPlaces,
    redirectError,
    options
  )

  request.yar.clear('locationData')
  request.yar.set('locationData', locationData)
  // '' Set searchTermsSaved with the actual postcode if searchTerms is undefined
  // '' This prevents redirect loops when accessing NI location URLs directly
  const savedSearchTerms = searchTerms || firstNIResult.postcode
  request.yar.set('searchTermsSaved', savedSearchTerms)
  logger.info(
    `[DEBUG processNILocationType] Set searchTermsSaved: ${savedSearchTerms} (original searchTerms: ${searchTerms})`
  )

  const retrievedLocationData = request.yar.get('locationData')
  logLocationDataDebug(locationData, retrievedLocationData)

  const notificationFlow = request.yar.get('notificationFlow')
  if (notificationFlow) {
    return handleNotificationFlow(
      request,
      h,
      notificationFlow,
      locationData,
      searchTerms
    )
  }

  return h
    .redirect(`/location/${locationData.urlRoute}?lang=en`)
    .code(REDIRECT_STATUS_CODE)
    .takeover()
}

const isLocationDataNotFound = (
  userLocation,
  redirectError,
  getOSPlaces,
  getNIPlaces
) => {
  const isPartialPostcode =
    isValidPartialPostcodeUK(userLocation) ||
    isValidPartialPostcodeNI(userLocation)

  const isUKTypeNoResults =
    !getOSPlaces?.results && redirectError.locationType === LOCATION_TYPE_UK

  const isNITypeNoResults =
    redirectError.locationType === LOCATION_TYPE_NI &&
    (!getNIPlaces?.results || getNIPlaces?.results.length === 0)

  return (
    isPartialPostcode ||
    getOSPlaces === WRONG_POSTCODE ||
    isUKTypeNoResults ||
    isNITypeNoResults
  )
}

const processLocationData = async (
  request,
  redirectError,
  userLocation,
  searchTerms,
  secondSearchTerm
) => {
  // '' Return the promise directly to avoid redundant await
  return fetchData(request, {
    locationType: redirectError.locationType,
    userLocation,
    searchTerms,
    secondSearchTerm
  })
}

function shouldReturnNotFound(
  redirectError,
  getNIPlaces,
  userLocation,
  getOSPlaces
) {
  logger.info(
    `[DEBUG shouldReturnNotFound] locationType: ${redirectError.locationType}`
  )
  logger.info(
    `[DEBUG shouldReturnNotFound] getNIPlaces?.results exists: ${!!getNIPlaces?.results}`
  )
  logger.info(
    `[DEBUG shouldReturnNotFound] getNIPlaces?.results length: ${getNIPlaces?.results?.length}`
  )
  logger.info(
    `[DEBUG shouldReturnNotFound] getNIPlaces structure: ${JSON.stringify(getNIPlaces)}`
  )

  if (
    redirectError.locationType === LOCATION_TYPE_NI &&
    (!getNIPlaces?.results || getNIPlaces?.results.length === 0)
  ) {
    logger.info(
      `[DEBUG shouldReturnNotFound] Returning true: NI with no results`
    )
    return true
  }
  if (
    isLocationDataNotFound(
      userLocation,
      redirectError,
      getOSPlaces,
      getNIPlaces
    )
  ) {
    logger.info(
      `[DEBUG shouldReturnNotFound] Returning true: isLocationDataNotFound`
    )
    return true
  }
  logger.info(`[DEBUG shouldReturnNotFound] Returning false: location found`)
  return false
}

function isInvalidDailySummary(getDailySummary) {
  const isMockEnabled = config.get('enabledMock')

  // '' When mock is enabled, allow null daily summary for NI testing
  if (isMockEnabled) {
    return false
  }

  return (
    !getDailySummary ||
    typeof getDailySummary !== 'object' ||
    !getDailySummary.today
  )
}

/**
 * '' Prepare formatted date information for display
 */
function prepareDateFormatting(getDailySummary, lang) {
  const { transformedDailySummary } = transformKeys(getDailySummary, lang)
  const { formattedDateSummary, getMonthSummary } = getFormattedDateSummary(
    getDailySummary?.issue_date,
    calendarEnglish,
    calendarWelsh,
    lang
  )
  const { englishDate, welshDate } = getLanguageDates(
    formattedDateSummary,
    getMonthSummary,
    calendarEnglish,
    calendarWelsh
  )

  return { transformedDailySummary, englishDate, welshDate }
}

/**
 * '' Route request to appropriate location type handler
 */
function routeToLocationTypeHandler(request, h, redirectError, context) {
  const { locationType } = redirectError

  if (locationType === LOCATION_TYPE_UK) {
    return processUKLocationType(request, h, redirectError, context.ukContext)
  }

  if (locationType === LOCATION_TYPE_NI) {
    return processNILocationType(request, h, redirectError, context.niContext)
  }

  request.yar.clear('searchTermsSaved')
  return h.redirect(`${LOCATION_NOT_FOUND_URL}?lang=en`).takeover()
}

/**
 * '' Build context objects for location type handlers
 */
function buildLocationContexts(params) {
  const {
    userLocation,
    locationNameOrPostcode,
    lang,
    searchTerms,
    secondSearchTerm,
    getOSPlaces,
    getDailySummary,
    getForecasts,
    getNIPlaces,
    transformedDailySummary,
    englishDate,
    welshDate,
    month,
    home,
    multipleLocations
  } = params

  const ukContext = {
    userLocation,
    locationNameOrPostcode,
    lang,
    searchTerms,
    secondSearchTerm,
    getOSPlaces,
    airQualityData,
    getDailySummary,
    getForecasts,
    transformedDailySummary,
    calendarWelsh,
    englishDate,
    welshDate,
    month,
    english
  }

  const niContext = {
    locationNameOrPostcode,
    lang,
    searchTerms,
    getNIPlaces,
    transformedDailySummary,
    englishDate,
    welshDate,
    getDailySummary,
    month,
    multipleLocations,
    home,
    getForecasts
  }

  return { ukContext, niContext }
}

const searchMiddleware = async (request, h) => {
  logger.info(
    `[DEBUG MIDDLEWARE TOP] Request to /location - query params: ${JSON.stringify(request.query)}`
  )

  const { query, payload } = request
  const lang = LANG_EN
  const month = getMonth(lang)
  const { home, multipleLocations } = english
  const searchTerms = query?.searchTerms?.toUpperCase()
  const secondSearchTerm = query?.secondSearchTerm?.toUpperCase()

  // '' Set searchTermsSaved early in UK location processing
  if (searchTerms) {
    request.yar.set('searchTermsSaved', searchTerms)
  }

  const redirectError = handleErrorInputAndRedirect(
    request,
    h,
    lang,
    payload,
    searchTerms
  )
  if (!redirectError.locationType) {
    return redirectError
  }

  const { userLocation, locationNameOrPostcode } = redirectError
  const { getDailySummary, getForecasts, getOSPlaces, getNIPlaces } =
    await processLocationData(
      request,
      redirectError,
      userLocation,
      searchTerms,
      secondSearchTerm
    )

  // '' Handle upstream NI API failure - show 500 service error (not 404 postcode error)
  if (
    redirectError.locationType === LOCATION_TYPE_NI &&
    getNIPlaces?.error === 'service-unavailable'
  ) {
    logger.error(
      '[NI API UNAVAILABLE] Upstream NI API failed - showing service error'
    )
    logger.error(
      `[NI API UNAVAILABLE] This is NOT a wrong postcode - API connectivity issue for: ${userLocation}`
    )
    return handleServiceUnavailable(request, h, lang)
  }

  if (
    shouldReturnNotFound(
      redirectError,
      getNIPlaces,
      userLocation,
      getOSPlaces
    ) ||
    isInvalidDailySummary(getDailySummary)
  ) {
    logger.info(
      `[DEBUG] Redirecting to location-not-found. shouldReturnNotFound: ${shouldReturnNotFound(redirectError, getNIPlaces, userLocation, getOSPlaces)}, isInvalidDailySummary: ${isInvalidDailySummary(getDailySummary)}`
    )
    logger.info(`[DEBUG] getDailySummary: ${JSON.stringify(getDailySummary)}`)
    return handleLocationDataNotFound(
      request,
      h,
      locationNameOrPostcode,
      lang,
      searchTerms
    )
  }

  const { transformedDailySummary, englishDate, welshDate } =
    prepareDateFormatting(getDailySummary, lang)

  const contexts = buildLocationContexts({
    userLocation,
    locationNameOrPostcode,
    lang,
    searchTerms,
    secondSearchTerm,
    getOSPlaces,
    getDailySummary,
    getForecasts,
    getNIPlaces,
    transformedDailySummary,
    englishDate,
    welshDate,
    month,
    home,
    multipleLocations
  })

  // '' searchTermsSaved is set in processNILocationType/processUKLocationType before redirecting

  return routeToLocationTypeHandler(request, h, redirectError, contexts)
}

export { searchMiddleware, shouldReturnNotFound, isInvalidDailySummary }
