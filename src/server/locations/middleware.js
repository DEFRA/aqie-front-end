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
    console.log('redirectioning to location search 3')
    return h.redirect('error/index').takeover()
  }
  console.log('redirectioning to location search 4')
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

  const postcode = getNIPlaces?.results[0].postcode
  const town = sentenceCase(getNIPlaces?.results[0].town)
  const locationTitle = `${postcode}, ${town}`

  const locationData = {
    results: getNIPlaces?.results,
    urlRoute: `${getNIPlaces?.results[0].postcode.toLowerCase()}`.replace(
      /\s+/g,
      ''
    ),
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

  request.yar.clear('locationData')
  request.yar.set('locationData', locationData)
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
    redirectError.locationType === LOCATION_TYPE_NI &&
    (!getNIPlaces?.results || getNIPlaces?.results.length === 0)
  ) {
    return handleLocationDataNotFound(
      request,
      h,
      locationNameOrPostcode,
      lang,
      searchTerms
    )
  }

  if (
    isLocationDataNotFound(
      userLocation,
      redirectError,
      getOSPlaces,
      getNIPlaces
    )
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
  request.yar.set('searchTermsSaved', searchTerms)

  if (redirectError.locationType === LOCATION_TYPE_UK) {
    return processUKLocationType(request, h, redirectError, {
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
  } else if (redirectError.locationType === LOCATION_TYPE_NI) {
    return processNILocationType(request, h, redirectError, {
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
    })
  } else {
    request.yar.clear('searchTermsSaved')
    console.log('redirectioning to location search 5')
    return h.redirect(`${LOCATION_NOT_FOUND_URL}?lang=en`).takeover()
  }
}

export { searchMiddleware }
