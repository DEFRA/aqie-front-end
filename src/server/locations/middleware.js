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
  return (
    result?.localName ||
    result?.secondaryName ||
    result?.displayName ||
    result?.postcode ||
    result?.town ||
    searchTerms ||
    'Location'
  )
}

// '' Helper: Update session with location data for notification flow
const updateNotificationSession = (request, locationData, searchTerms) => {
  const result = locationData?.results?.[0]
  if (!result) return

  const locationTitle = getLocationTitle(result, searchTerms)
  const sanitizedLocation =
    (locationTitle || 'Location')
      .replace(/^\s*air\s+quality\s+in\s+/i, '')
      .trim() || 'Location'

  request.yar.set(
    'location',
    convertFirstLetterIntoUppercase(sanitizedLocation)
  )
  request.yar.set('locationId', locationData.urlRoute)
  request.yar.set('latitude', result.latitude || result.yCoordinate)
  request.yar.set('longitude', result.longitude || result.xCoordinate)

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

const processNILocationType = (request, h, redirectError, options = {}) => {
  const {
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
  } = options
  if (
    !getNIPlaces?.results ||
    getNIPlaces?.results.length === 0 ||
    getNIPlaces === WRONG_POSTCODE
  ) {
    request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
    request.yar.clear('searchTermsSaved')
    return h
      .redirect(`${LOCATION_NOT_FOUND_URL}?lang=en`)
      .code(REDIRECT_STATUS_CODE)
      .takeover()
  }

  // '' Guard against null/undefined results from failed mock server fetch
  const firstNIResult = getNIPlaces?.results?.[0]
  if (!firstNIResult?.postcode) {
    logger.error('NI mock server returned invalid data - postcode missing')
    request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
    request.yar.clear('searchTermsSaved')
    return h
      .redirect(`${LOCATION_NOT_FOUND_URL}?lang=en`)
      .code(REDIRECT_STATUS_CODE)
      .takeover()
  }

  const postcode = firstNIResult.postcode
  const town = sentenceCase(firstNIResult.town)
  const locationTitle = `${postcode}, ${town}`

  const locationData = {
    results: getNIPlaces?.results,
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

  request.yar.clear('locationData')
  request.yar.set('locationData', locationData)

  // '' Set searchTermsSaved for NI locations to prevent redirect loop in controller
  request.yar.set('searchTermsSaved', searchTerms)

  logger.info(
    `[DEBUG processNILocationType] After set, locationData from session:`
  )
  const retrievedLocationData = request.yar.get('locationData')
  logger.info(
    `[DEBUG processNILocationType] - retrieved results is array: ${Array.isArray(retrievedLocationData?.results)}`
  )
  logger.info(
    `[DEBUG processNILocationType] - retrieved getForecasts exists: ${!!retrievedLocationData?.getForecasts}`
  )

  // '' Check if user is in notification registration flow (SMS or Email)
  const notificationFlow = request.yar.get('notificationFlow')
  if (notificationFlow) {
    // '' Update session with new location data for notification
    updateNotificationSession(request, locationData, searchTerms)

    // '' Clear the flow flag and redirect to appropriate confirm details page
    request.yar.clear('notificationFlow')
    logger.info(
      `[DEBUG processNILocationType] Redirecting to ${notificationFlow} confirm details (notificationFlow=${notificationFlow})`
    )

    if (notificationFlow === 'sms') {
      return h
        .redirect(`/notify/register/sms-confirm-details?lang=en`)
        .code(REDIRECT_STATUS_CODE)
        .takeover()
    }
    // '' Email flow - will be implemented later
    return h
      .redirect(`/notify/register/email-confirm-details?lang=en`)
      .code(REDIRECT_STATUS_CODE)
      .takeover()
  }

  // '' Use .takeover() to send redirect immediately and skip remaining lifecycle
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
