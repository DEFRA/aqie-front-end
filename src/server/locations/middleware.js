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

const isObjectPair = (left, right) =>
  Boolean(
    left && right && typeof left === 'object' && typeof right === 'object'
  )

const areSerializedObjectsEqual = (left, right) => {
  try {
    return JSON.stringify(left) === JSON.stringify(right)
  } catch {
    // '' Ignore serialization issues and continue to set session value
    return false
  }
}

const setSessionIfChanged = (request, key, value) => {
  const currentValue = request?.yar?.get?.(key)
  if (Object.is(currentValue, value)) {
    return
  }

  if (isObjectPair(currentValue, value)) {
    if (areSerializedObjectsEqual(currentValue, value)) {
      return
    }
  }

  request.yar.set(key, value)
}

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

const processNILocationType = (request, h, redirectError, options = {}) => {
  const {
    locationNameOrPostcode,
    lang,
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

  if (isInvalidNIPlaces(getNIPlaces)) {
    request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
    request.yar.clear('searchTermsSaved')
    return h
      .redirect(`${LOCATION_NOT_FOUND_URL}?lang=en`)
      .code(REDIRECT_STATUS_CODE)
      .takeover()
  }

  const locationData = buildNILocationData({
    getNIPlaces,
    locationType: redirectError.locationType,
    transformedDailySummary,
    englishDate,
    getDailySummary,
    welshDate,
    month,
    multipleLocations,
    home,
    getForecasts,
    lang
  })

  setSessionIfChanged(request, 'locationData', locationData)
  return h
    .redirect(`/location/${locationData.urlRoute}?lang=en`)
    .code(REDIRECT_STATUS_CODE)
    .takeover()
}

function isInvalidNIPlaces(getNIPlaces) {
  return (
    !getNIPlaces?.results ||
    getNIPlaces?.results.length === 0 ||
    getNIPlaces === WRONG_POSTCODE
  )
}

function buildNILocationData({
  getNIPlaces,
  locationType,
  transformedDailySummary,
  englishDate,
  getDailySummary,
  welshDate,
  month,
  multipleLocations,
  home,
  getForecasts,
  lang
}) {
  const postcode = getNIPlaces.results[0].postcode
  const town = sentenceCase(getNIPlaces.results[0].town)
  const locationTitle = `${postcode}, ${town}`

  return {
    results: getNIPlaces.results,
    urlRoute: `${postcode.toLowerCase()}`.replace(/\s+/g, ''),
    locationType,
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

const isLocationDataNotFound = (
  userLocation,
  redirectError,
  getOSPlaces,
  getNIPlaces
) => {
  if (
    isValidPartialPostcodeUK(userLocation) ||
    isValidPartialPostcodeNI(userLocation)
  ) {
    return true
  }

  if (getOSPlaces === WRONG_POSTCODE) {
    return true
  }

  if (isUkLocationWithoutResults(redirectError, getOSPlaces)) {
    return true
  }

  return isNiLocationWithoutResults(redirectError, getNIPlaces)
}

function isUkLocationWithoutResults(redirectError, getOSPlaces) {
  return (
    redirectError.locationType === LOCATION_TYPE_UK && !getOSPlaces?.results
  )
}

function isNiLocationWithoutResults(redirectError, getNIPlaces) {
  return (
    redirectError.locationType === LOCATION_TYPE_NI &&
    (!getNIPlaces?.results || getNIPlaces?.results.length === 0)
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
  if (
    redirectError.locationType === LOCATION_TYPE_NI &&
    (!getNIPlaces?.results || getNIPlaces?.results.length === 0)
  ) {
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
    return true
  }
  return false
}

function isInvalidDailySummary(getDailySummary) {
  return (
    !getDailySummary ||
    typeof getDailySummary !== 'object' ||
    !getDailySummary.today
  )
}

function routeByLocationType(request, h, redirectError, context) {
  if (redirectError.locationType === LOCATION_TYPE_UK) {
    return processUKLocationType(request, h, redirectError, context)
  }

  if (redirectError.locationType === LOCATION_TYPE_NI) {
    return processNILocationType(request, h, redirectError, context)
  }

  request.yar.clear('searchTermsSaved')
  return h.redirect(`${LOCATION_NOT_FOUND_URL}?lang=en`).takeover()
}

const searchMiddleware = async (request, h) => {
  const { query, payload } = request
  const lang = LANG_EN
  const month = getMonth(lang)
  const { home, multipleLocations } = english
  const searchTerms = query?.searchTerms?.toUpperCase()
  const secondSearchTerm = query?.secondSearchTerm?.toUpperCase()

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
    return handleLocationDataNotFound(
      request,
      h,
      locationNameOrPostcode,
      lang,
      searchTerms
    )
  }

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
  setSessionIfChanged(request, 'searchTermsSaved', searchTerms)

  return routeByLocationType(request, h, redirectError, {
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
    english,
    getNIPlaces,
    multipleLocations,
    home
  })
}

export { searchMiddleware, shouldReturnNotFound, isInvalidDailySummary }
