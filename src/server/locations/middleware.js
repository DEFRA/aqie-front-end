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
  WRONG_POSTCODE
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

  const {
    getDailySummary,
    getForecasts,
    getMeasurements,
    getOSPlaces,
    getNIPlaces
  } = await fetchData(request, h, {
    locationType: redirectError.locationType,
    userLocation,
    searchTerms,
    secondSearchTerm
  })
  if (
    redirectError.locationType === LOCATION_TYPE_NI &&
    (!getNIPlaces?.results || getNIPlaces?.results.length === 0)
  ) {
    request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
    return h.redirect('location-not-found').takeover()
  }
  const isPartialPostcode =
    isValidPartialPostcodeUK(userLocation) ||
    isValidPartialPostcodeNI(userLocation)

  // '' Helper function to check if location data is not found
  const isLocationDataNotFound = () => {
    // ''
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

  if (isLocationDataNotFound()) {
    request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
    if (searchTerms) {
      request.yar.clear('searchTermsSaved')
      return h.redirect('error/index').takeover()
    }
    return h.redirect('location-not-found').takeover()
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
      getMeasurements,
      transformedDailySummary,
      calendarWelsh,
      englishDate,
      welshDate,
      month: getMonth(lang),
      english
    })
  } else if (redirectError.locationType === LOCATION_TYPE_NI) {
    if (isPartialPostcode) {
      request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
      request.yar.clear('searchTermsSaved')
      return h.redirect('/lleoliad-heb-ei-ganfod/cy').code(301).takeover()
    }

    if (
      !getNIPlaces?.results ||
      getNIPlaces?.results.length === 0 ||
      getNIPlaces === WRONG_POSTCODE
    ) {
      request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
      request.yar.clear('searchTermsSaved')
      return h
        .redirect(`${LOCATION_NOT_FOUND_URL}?lang=en`)
        .code(301)
        .takeover()()
    }
    if (
      !getNIPlaces?.results ||
      getNIPlaces?.results.length === 0 ||
      getNIPlaces === WRONG_POSTCODE
    ) {
      request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
      request.yar.clear('searchTermsSaved')
      return h
        .redirect(`${LOCATION_NOT_FOUND_URL}?lang=en`)
        .code(301)
        .takeover()()
    }
    let title = ''
    let headerTitle = ''
    let urlRoute = ''
    title = `${getNIPlaces?.results[0].postcode}, ${sentenceCase(getNIPlaces?.results[0].town)} - ${home.pageTitle}`
    headerTitle = `${getNIPlaces?.results[0].postcode}, ${sentenceCase(getNIPlaces?.results[0].town)}`
    urlRoute = `${getNIPlaces?.results[0].postcode.toLowerCase()}`
    title = convertFirstLetterIntoUppercase(title)
    headerTitle = convertFirstLetterIntoUppercase(headerTitle)
    urlRoute = urlRoute.replace(/\s+/g, '')
    request.yar.clear('locationData')
    request.yar.set('locationData', {
      results: getNIPlaces?.results,
      urlRoute,
      locationType: redirectError.locationType,
      transformedDailySummary,
      englishDate,
      dailySummary: getDailySummary,
      welshDate,
      getMonth: month,
      title: `${multipleLocations.titlePrefix} ${headerTitle}`,
      pageTitle: `${multipleLocations.titlePrefix} ${title}`,
      getForecasts: getForecasts?.forecasts,
      getMeasurements: getMeasurements?.measurements,
      lang
    })
    return h.redirect(`/location/${urlRoute}?lang=en`).code(301).takeover()
  } else {
    // handle other location types
    request.yar.clear('searchTermsSaved')
    return h.redirect(`${LOCATION_NOT_FOUND_URL}?lang=en`).takeover()
  }
}

export { searchMiddleware }
