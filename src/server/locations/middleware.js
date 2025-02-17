import * as airQualityData from '~/src/server/data/en/air-quality.js'
import { fetchData } from '~/src/server/locations/helpers/fetch-data'
import { english, calendarEnglish } from '~/src/server/data/en/en.js'
import { calendarWelsh } from '~/src/server/data/cy/cy.js'
import {
  siteTypeDescriptions,
  pollutantTypes
} from '~/src/server/data/en/monitoring-sites.js'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import { handleErrorInputAndRedirect } from '~/src/server/locations/helpers/error-input-and-redirect'
import {
  handleSingleMatch,
  handleMultipleMatches,
  processMatches,
  getTitleAndHeaderTitle,
  getLanguageDates,
  getFormattedDateSummary
} from '~/src/server/locations/helpers/middleware-helpers'
import {
  LANG_EN,
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI,
  LANG_CY
} from '~/src/server/data/constants'
import { getMonth } from '~/src/server/locations/helpers/location-type-util'
import {
  convertStringToHyphenatedLowercaseWords,
  isValidPartialPostcode
} from '~/src/server/locations/helpers/convert-string'
import { getNearestLocation } from '~/src/server/locations/helpers/get-nearest-location'
import { sentenceCase } from '~/src/server/common/helpers/sentence-case'
import { convertFirstLetterIntoUppercase } from '~/src/server/locations/helpers/convert-first-letter-into-upper-case'
import { transformKeys } from '~/src/server/locations/helpers/transform-summary-keys.js'

const logger = createLogger()

const searchMiddleware = async (request, h) => {
  logger.info(`::::::::::: searchMiddleware 1  :::::::::::`)
  let nearestLocationsRangeEnglish
  let nearestLocationsRangeWelsh
  const { query, payload } = request
  const lang = LANG_EN
  const month = getMonth(lang)
  const {
    home,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    multipleLocations
  } = english
  let locationType = request?.payload?.locationType
  const searchTerms = query?.searchTerms?.toUpperCase()
  const secondSearchTerm = query?.secondSearchTerm?.toUpperCase()
  const searchTermsLocationType = query?.searchTermsLocationType
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
  let { userLocation, locationNameOrPostcode } = redirectError
  if (searchTerms) {
    userLocation = searchTerms
    locationType = searchTermsLocationType
  }
  const { getDailySummary, getForecasts, getMeasurements, getOSPlaces } =
    await fetchData(
      locationType,
      userLocation,
      request,
      h,
      locationNameOrPostcode,
      lang
    )

  const { getMonthSummary, formattedDateSummary } = getFormattedDateSummary(
    getDailySummary?.issue_date,
    calendarEnglish,
    calendarWelsh,
    lang
  )

  const { transformedDailySummary } = transformKeys(getDailySummary, lang)
  const { englishDate, welshDate } = getLanguageDates(
    formattedDateSummary,
    getMonthSummary,
    calendarEnglish,
    calendarWelsh
  )
  request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
  request.yar.set('searchTermsSaved', searchTerms)
  if (locationType === LOCATION_TYPE_UK) {
    let { results } = getOSPlaces

    if (!results || results.length === 0 || getOSPlaces === 'wrong postcode') {
      request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
      return h.redirect('/location-not-found').takeover()
    }
    // Remove duplicates from the results array
    results = Array.from(
      new Set(results.map((item) => JSON.stringify(item)))
    ).map((item) => JSON.parse(item))

    const selectedMatches = processMatches(
      results,
      userLocation,
      locationNameOrPostcode,
      searchTerms,
      secondSearchTerm
    )
    if (selectedMatches.length === 0) {
      return h.redirect('/location-not-found').takeover()
    }
    userLocation = userLocation.toLowerCase()
    userLocation = userLocation.charAt(0).toUpperCase() + userLocation.slice(1)
    const { title, headerTitle, urlRoute } = getTitleAndHeaderTitle(
      selectedMatches,
      locationNameOrPostcode
    )
    const headerTitleRoute = convertStringToHyphenatedLowercaseWords(
      String(urlRoute)
    )
    const titleRoute = convertStringToHyphenatedLowercaseWords(String(title))
    logger.info(
      `selectedMatches in middleware UK ${JSON.stringify(selectedMatches)})`
    )
    nearestLocationsRangeEnglish = getNearestLocation(
      selectedMatches,
      getForecasts?.forecasts,
      getMeasurements?.measurements,
      LOCATION_TYPE_UK,
      0,
      LANG_EN
    )
    nearestLocationsRangeWelsh = getNearestLocation(
      selectedMatches,
      getForecasts?.forecasts,
      getMeasurements?.measurements,
      LOCATION_TYPE_UK,
      0,
      LANG_CY
    )

    const { forecastNum } = getNearestLocation(
      selectedMatches,
      getForecasts?.forecasts,
      getMeasurements?.measurements,
      LOCATION_TYPE_UK,
      0,
      lang
    )
    logger.info(
      `nearestLocationsRangeEnglish middleware ${JSON.stringify(nearestLocationsRangeEnglish)})`
    )
    const isPartialPostcode = isValidPartialPostcode(locationNameOrPostcode)
    if (selectedMatches.length === 1) {
      return handleSingleMatch(h, request, {
        searchTerms,
        selectedMatches,
        forecastNum,
        getForecasts,
        getMeasurements,
        getDailySummary,
        transformedDailySummary,
        englishDate,
        welshDate,
        month,
        headerTitle,
        titleRoute,
        headerTitleRoute,
        title,
        urlRoute,
        locationType,
        nearestLocationsRangeEnglish,
        nearestLocationsRangeWelsh,
        lang
      })
    } else if (
      (selectedMatches.length > 1 &&
        locationNameOrPostcode.length >= 2 &&
        isPartialPostcode) ||
      (selectedMatches.length > 1 &&
        locationNameOrPostcode.length >= 3 &&
        !isPartialPostcode)
    ) {
      return handleMultipleMatches(h, request, {
        selectedMatches,
        headerTitleRoute,
        titleRoute,
        locationNameOrPostcode,
        userLocation,
        getForecasts,
        getMeasurements,
        multipleLocations,
        airQualityData,
        siteTypeDescriptions,
        pollutantTypes,
        getDailySummary,
        transformedDailySummary,
        footerTxt,
        phaseBanner,
        backlink,
        cookieBanner,
        calendarWelsh,
        month,
        welshDate,
        englishDate,
        forecastNum,
        locationType,
        nearestLocationsRangeEnglish,
        nearestLocationsRangeWelsh,
        lang
      })
    } else {
      return h.redirect('/location-not-found').takeover()
    }
  } else if (locationType === LOCATION_TYPE_NI) {
    const { getNIPlaces } = await fetchData(
      LOCATION_TYPE_NI,
      userLocation,
      request,
      h,
      locationNameOrPostcode,
      lang
    )

    logger.info(`::::::LOCATION_TYPE_NI-EN::::::: , ${getNIPlaces?.results[0]}`)
    if (
      !getNIPlaces?.results ||
      getNIPlaces?.results.length === 0 ||
      getNIPlaces === 'wrong postcode'
    ) {
      request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
      return h.redirect('/location-not-found').takeover()
    }
    nearestLocationsRangeEnglish = getNearestLocation(
      getNIPlaces?.results,
      getForecasts?.forecasts,
      getMeasurements?.measurements,
      LOCATION_TYPE_NI,
      0,
      LANG_EN
    )
    nearestLocationsRangeWelsh = getNearestLocation(
      getNIPlaces?.results,
      getForecasts?.forecasts,
      getMeasurements?.measurements,
      LOCATION_TYPE_NI,
      0,
      LANG_CY
    )

    const { forecastNum, nearestLocationsRange, latlon } =
      await getNearestLocation(
        getNIPlaces?.results,
        getForecasts?.forecasts,
        getMeasurements?.measurements,
        LOCATION_TYPE_NI,
        0,
        lang
      )
    logger.info(
      `nearestLocationsRangeWelsh in middleware NI ${JSON.stringify(nearestLocationsRangeWelsh)}`
    )
    logger.info(
      `nearestLocationsRangeEnglish in middleware NI ${JSON.stringify(nearestLocationsRangeEnglish)}`
    )
    let title = ''
    let headerTitle = ''
    let urlRoute = ''
    title = `${getNIPlaces?.results[0].postcode}, ${sentenceCase(getNIPlaces?.results[0].town)} - ${home.pageTitle}`
    headerTitle = `${getNIPlaces?.results[0].postcode}, ${sentenceCase(getNIPlaces?.results[0].town)}`
    urlRoute = `${getNIPlaces?.results[0].postcode}_${sentenceCase(getNIPlaces?.results[0].administrativeArea)}`
    title = convertFirstLetterIntoUppercase(title)
    headerTitle = convertFirstLetterIntoUppercase(headerTitle)
    urlRoute = convertStringToHyphenatedLowercaseWords(urlRoute)
    const resultNI = [
      {
        GAZETTEER_ENTRY: {
          ID: urlRoute,
          NAME1: getNIPlaces?.results[0].postcode,
          DISTRICT_BOROUGH: sentenceCase(getNIPlaces?.results[0].town),
          LONGITUDE: latlon?.lon,
          LATITUDE: latlon?.lat
        }
      }
    ]
    logger.info(
      `getForecasts?.forecasts in middleware NI ${JSON.stringify(getForecasts?.forecasts)})`
    )
    logger.info(
      `getMeasurements?.measurements in middleware NI ${JSON.stringify(getMeasurements?.measurements)})`
    )
    request.yar.clear('locationData')
    request.yar.set('locationData', {
      results: resultNI,
      forecastNum,
      transformedDailySummary,
      monitoringSites: nearestLocationsRange,
      englishDate,
      dailySummary: getDailySummary,
      welshDate,
      getMonth: month,
      title: `${multipleLocations.titlePrefix} ${headerTitle}`,
      pageTitle: `${multipleLocations.titlePrefix} ${title}`,
      nearestLocationsRangeEnglish,
      nearestLocationsRangeWelsh,
      lang
    })
    return h.redirect(`/location/${urlRoute}?lang=en`).takeover()
  } else {
    // handle other location types
    return h.redirect('/location-not-found').takeover()
  }
}

export { searchMiddleware }
