import * as airQualityData from '~/src/server/data/cy/air-quality.js'
import { fetchData } from '~/src/server/locations/helpers/fetch-data'
import { welsh, calendarWelsh } from '~/src/server/data/cy/cy.js'
import { calendarEnglish } from '~/src/server/data/en/en.js'
import {
  siteTypeDescriptions,
  pollutantTypes
} from '~/src/server/data/cy/monitoring-sites.js'
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
  LANG_CY,
  LANG_EN,
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI
} from '~/src/server/data/constants'
import { getMonth } from '~/src/server/locations/helpers/location-type-util'
import {
  convertStringToHyphenatedLowercaseWords,
  isValidPartialPostcode
} from '~/src/server/locations/helpers/convert-string'
import { getNearestLocation } from '~/src/server/locations/helpers/get-nearest-location'
import { transformKeys } from '~/src/server/locations/helpers/transform-summary-keys.js'
import { sentenceCase } from '~/src/server/common/helpers/sentence-case'
import { convertFirstLetterIntoUppercase } from '~/src/server/locations/helpers/convert-first-letter-into-upper-case.js'

const logger = createLogger()

const searchMiddlewareCy = async (request, h) => {
  logger.info(`::::::::::: searchMiddlewareCy 1  :::::::::::`)
  let nearestLocationsRangeEnglish
  let nearestLocationsRangeWelsh
  const { query, payload } = request
  const lang = LANG_CY
  const month = getMonth(lang)
  const {
    home,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    multipleLocations
  } = welsh
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
      return h.redirect('/lleoliad-heb-ei-ganfod/cy').takeover()
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
      return h.redirect('/lleoliad-heb-ei-ganfod/cy').takeover()
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
      return h.redirect('/lleoliad-heb-ei-ganfod/cy').takeover()
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
    if (
      !getNIPlaces?.results ||
      getNIPlaces?.results.length === 0 ||
      getNIPlaces === 'wrong postcode'
    ) {
      request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
      return h.redirect('/lleoliad-heb-ei-ganfod/cy').takeover()
    }

    logger.info(`::::::LOCATION_TYPE_NI-CY::::::: , ${getNIPlaces?.results[0]}`)
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
    if (
      !getNIPlaces?.results ||
      getNIPlaces?.results.length === 0 ||
      getNIPlaces === 'wrong postcode'
    ) {
      return h.redirect('/lleoliad-heb-ei-ganfod/cy').takeover()
    }

    logger.info(
      `::::::LOCATION_TYPE_NI-CY::::::: , ${JSON.stringify(getNIPlaces?.results[0])}`
    )
    let title = ''
    let headerTitle = ''
    let urlRoute = ''
    title = `${getNIPlaces?.results[0].postcode}, ${sentenceCase(getNIPlaces?.results[0].town)} - ${home.pageTitle}`
    headerTitle = `${getNIPlaces?.results[0].postcode}, ${sentenceCase(getNIPlaces?.results[0].town)}`
    urlRoute = `${getNIPlaces?.results[0].postcode.toLowerCase()}`
    title = convertFirstLetterIntoUppercase(title)
    headerTitle = convertFirstLetterIntoUppercase(headerTitle)
    urlRoute = urlRoute.replace(/\s+/g, '')
    logger.info(`urlRoute in middleware welsh NI ${urlRoute}`)
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
    return h.redirect(`/lleoliad/${urlRoute}?lang=cy`).takeover()
  } else {
    // handle other location types
    return h.redirect('/lleoliad-heb-ei-ganfod/cy').takeover()
  }
}

export { searchMiddlewareCy }
