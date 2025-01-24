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
  LOCATION_TYPE_NI
} from '~/src/server/data/constants'
import { getMonth } from '~/src/server/locations/helpers/location-type-util'
import { convertStringToHyphenatedLowercaseWords } from '~/src/server/locations/helpers/convert-string'
import { getNearestLocation } from '~/src/server/locations/helpers/get-nearest-location'
import { sentenceCase } from '~/src/server/common/helpers/sentence-case'
import { firstLetterUppercase } from '~/src/server/common/helpers/stringUtils'
import { getAirQuality } from '~/src/server/data/en/air-quality.js'

const logger = createLogger()

const searchMiddleware = async (request, h) => {
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
  logger.info(`::::::::::: before handleErrorInputAndRedirect  ::::::::::: `)
  const redirectError = handleErrorInputAndRedirect(
    request,
    h,
    lang,
    request?.payload
  )
  logger.info(`::::::::::: after handleErrorInputAndRedirect  :::::::::::`)
  if (!redirectError.locationType) {
    return redirectError
  }
  let { locationType, userLocation, locationNameOrPostcode } = redirectError

  const { getDailySummary, getForecasts, getMeasurements } = await fetchData(
    locationType,
    userLocation,
    request,
    h
  )

  const { getMonthSummary, formattedDateSummary } = getFormattedDateSummary(
    getDailySummary.issue_date,
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
  request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })

  if (locationType === LOCATION_TYPE_UK) {
    const { getOSPlaces } = await fetchData(
      locationType,
      userLocation,
      request,
      h
    )
    let { results } = getOSPlaces

    if (!results || results.length === 0 || getOSPlaces === 'wrong postcode') {
      return h.redirect('/location-not-found').takeover()
    }
    // Remove duplicates from the results array
    results = Array.from(
      new Set(results.map((item) => JSON.stringify(item)))
    ).map((item) => JSON.parse(item))
    const selectedMatches = processMatches(
      results,
      locationNameOrPostcode,
      userLocation
    )
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
    const { forecastNum, nearestLocationsRange, airQuality } =
      getNearestLocation(
        selectedMatches,
        getForecasts?.forecasts,
        getMeasurements?.measurements,
        LOCATION_TYPE_UK,
        0,
        lang
      )
    if (selectedMatches.length === 1) {
      return handleSingleMatch(h, request, {
        selectedMatches,
        forecastNum,
        getForecasts,
        getMeasurements,
        getDailySummary,
        nearestLocationsRange,
        englishDate,
        welshDate,
        month,
        headerTitle,
        titleRoute,
        headerTitleRoute,
        title,
        urlRoute,
        lang
      })
    } else if (
      selectedMatches.length > 1 &&
      locationNameOrPostcode.length > 3
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
        airQuality,
        airQualityData,
        nearestLocationsRange,
        siteTypeDescriptions,
        pollutantTypes,
        getDailySummary,
        footerTxt,
        phaseBanner,
        backlink,
        cookieBanner,
        calendarWelsh,
        month,
        welshDate,
        englishDate,
        lang
      })
    } else {
      return h.redirect('/location-not-found').takeover()
    }
  } else if (locationType === LOCATION_TYPE_NI) {
    const { daqi } = english
    const { getNIPlaces } = await fetchData(
      'ni-location',
      userLocation,
      request,
      h
    )
    const { results } = getNIPlaces
    const { forecastNum, nearestLocationsRange, latlon } = getNearestLocation(
      results,
      getForecasts?.forecasts,
      getMeasurements?.measurements,
      'ni-location',
      0,
      lang
    )
    logger.info(`::::::::::: getNIPlaces 1  result ::::::::::: ${results}`)

    let title = ''
    let headerTitle = ''
    let urlRoute = ''
    logger.info(`::::::::::: getNIPlaces 2  :::::::::::`)

    title = `${results[0].postcode}, ${sentenceCase(results[0].administrativeArea)} - ${home.pageTitle}`
    headerTitle = `${results[0].postcode}, ${sentenceCase(results[0].administrativeArea)}`
    urlRoute = `${results[0].postcode}_${sentenceCase(results[0].administrativeArea)}`

    logger.info(`::::::::::: getNIPlaces 3  :::::::::::`)
    title = firstLetterUppercase(title)
    headerTitle = firstLetterUppercase(headerTitle)
    urlRoute = convertStringToHyphenatedLowercaseWords(urlRoute)
    const locationData = [
      {
        GAZETTEER_ENTRY: {
          ID: urlRoute,
          NAME1: results[0].postcode,
          DISTRICT_BOROUGH: sentenceCase(results[0].administrativeArea),
          LONGITUDE: latlon.lon,
          LATITUDE: latlon.lat,
          LOCATION_TYPE: LOCATION_TYPE_NI,
          title,
          headerTitle,
          urlRoute
        }
      }
    ]
    const airQuality = getAirQuality(
      forecastNum[0][0].today,
      Object.values(forecastNum[0][1])[0],
      Object.values(forecastNum[0][2])[0],
      Object.values(forecastNum[0][3])[0],
      Object.values(forecastNum[0][4])[0]
    )

    request.yar.set('locationData', {
      results: locationData,
      airQuality,
      airQualityData: airQualityData.commonMessages,
      monitoringSites: nearestLocationsRange,
      siteTypeDescriptions,
      pollutantTypes,
      pageTitle: title,
      title: headerTitle,
      displayBacklink: true,
      forecastSummary: getDailySummary.today,
      dailySummary: getDailySummary,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      daqi,
      welshMonth: calendarWelsh[getMonth],
      summaryDate: lang === 'cy' ? welshDate : englishDate,
      dailySummaryTexts: english.dailySummaryTexts,
      locationType: LOCATION_TYPE_NI,
      lang
    })
    logger.info(
      `::::::::::: redirecting to specific urlRoute en  ::::::::::: ${urlRoute}`
    )
    return h.redirect(`/location/${urlRoute}?lang=en`).takeover()
  } else {
    logger.info(
      `::::::::::: redirecting to location not found en  ::::::::::: ${locationType}`
    )
    // handle other location types
    return h.redirect('/location-not-found').takeover()
  }
}

export { searchMiddleware }
