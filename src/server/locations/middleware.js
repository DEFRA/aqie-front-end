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
  handleLocationNotFound,
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
  const { payload } = request
  const lang = LANG_EN
  const month = getMonth(lang)
  const {
    notFoundLocation,
    home,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    multipleLocations
  } = english

  const redirectError = handleErrorInputAndRedirect(request, h, lang, payload)
  if (!redirectError.locationType) {
    return redirectError
  }
  let { locationType, userLocation, locationNameOrPostcode } = redirectError

  const { getDailySummary, getForecasts, getMeasurements, getOSPlaces } =
    await fetchData(locationType, userLocation, request, h)

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
      locationNameOrPostcode,
      userLocation
    )
    userLocation = userLocation.toLowerCase()
    userLocation = userLocation.charAt(0).toUpperCase() + userLocation.slice(1)
    const { title, headerTitle, urlRoute } = getTitleAndHeaderTitle(
      selectedMatches,
      locationNameOrPostcode
    )
    const headerTitleRoute = convertStringToHyphenatedLowercaseWords(urlRoute)
    const titleRoute = convertStringToHyphenatedLowercaseWords(title)
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
      return handleLocationNotFound(h, {
        locationNameOrPostcode,
        notFoundLocation,
        home,
        footerTxt,
        phaseBanner,
        backlink,
        cookieBanner,
        lang
      })
    }
  } else if (locationType === LOCATION_TYPE_NI) {
    const { query } = request
    const { daqi } = english
    const { getNIPlaces } = await fetchData(
      'ni-location',
      userLocation,
      request,
      h
    )
    logger.info(`::::::::::: getNIPlaces en  ::::::::::: ${getNIPlaces}`)
    logger.info(
      `::::::::::: getNIPlaces statusCode en  ::::::::::: ${getNIPlaces?.statusCode}`
    )
    if (
      getOSPlaces?.statusCode !== 200 &&
      getOSPlaces?.statusCode !== undefined
    ) {
      return h.view('error/index', {
        footerTxt,
        url: request.path,
        phaseBanner,
        displayBacklink: false,
        cookieBanner,
        serviceName: english.multipleLocations.serviceName,
        notFoundUrl: english.notFoundUrl,
        statusCode:
          getOSPlaces?.statusCode ||
          getForecasts?.statusCode ||
          getMeasurements?.statusCode ||
          getDailySummary?.statusCode,
        lang
      })
    }
    if (!getNIPlaces?.results || getNIPlaces?.results.length === 0) {
      return h.redirect('/location-not-found').takeover()
    }
    const { results } = getNIPlaces
    const { forecastNum, nearestLocationsRange, latlon } = getNearestLocation(
      results,
      getForecasts?.forecasts,
      getMeasurements?.measurements,
      'ni-location',
      0,
      lang
    )
    const locationData = {
      GAZETTEER_ENTRY: {
        NAME1: results[0].postcode,
        DISTRICT_BOROUGH: sentenceCase(results[0].administrativeArea),
        LONGITUDE: latlon.lon,
        LATITUDE: latlon.lat
      }
    }
    let title = ''
    let headerTitle = ''
    let urlRoute = ''
    if (locationData) {
      if (locationData.GAZETTEER_ENTRY.NAME2) {
        title = `${locationData.GAZETTEER_ENTRY.NAME2}, ${locationData.GAZETTEER_ENTRY.DISTRICT_BOROUGH} - ${home.pageTitle}`
        headerTitle = `${locationData.GAZETTEER_ENTRY.NAME2}, ${locationData.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
        urlRoute = `${locationData.GAZETTEER_ENTRY.NAME2}_${locationData.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
      } else {
        title = `${locationData.GAZETTEER_ENTRY.NAME1}, ${locationData.GAZETTEER_ENTRY.DISTRICT_BOROUGH} - ${home.pageTitle}`
        headerTitle = `${locationData.GAZETTEER_ENTRY.NAME1}, ${locationData.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
        urlRoute = `${locationData.GAZETTEER_ENTRY.NAME1}_${locationData.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
      }
    }
    title = firstLetterUppercase(title)
    headerTitle = firstLetterUppercase(headerTitle)
    urlRoute = convertStringToHyphenatedLowercaseWords(urlRoute)

    const airQuality = getAirQuality(
      forecastNum[0][0].today,
      Object.values(forecastNum[0][1])[0],
      Object.values(forecastNum[0][2])[0],
      Object.values(forecastNum[0][3])[0],
      Object.values(forecastNum[0][4])[0]
    )
    if (lang === 'en' && query?.lang === 'cy') {
      /* eslint-disable camelcase */
      return h.redirect(`/lleoliad/cy?lang=cy`)
    }
    request.yar.set('locationData', {
      result: locationData,
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
      lang
    })
    return h.redirect(`/location/${urlRoute}?lang=en`).takeover()
  } else {
    // handle other location types
    return handleLocationNotFound(h, {
      locationNameOrPostcode,
      notFoundLocation,
      home,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      lang
    })
  }
}

export { searchMiddleware }
