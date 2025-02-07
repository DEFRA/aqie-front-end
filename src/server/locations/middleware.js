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
import { convertFirstLetterIntoUppercase } from '~/src/server/locations/helpers/convert-first-letter-into-upper-case'
import { transformKeys } from '~/src/server/locations/helpers/generate-daily-summary-with-calendar-day'

const logger = createLogger()

const searchMiddleware = async (request, h) => {
  logger.info(`::::::::::: searchMiddleware 1  :::::::::::`)
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
  logger.info(`::::::::::: before handleErrorInputAndRedirect  ::::::::::: `)
  const redirectError = handleErrorInputAndRedirect(
    request,
    h,
    lang,
    payload,
    searchTerms
  )
  logger.info(`::::::::::: after handleErrorInputAndRedirect  :::::::::::`)
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
  logger.info(
    `::::::::::: getDailySummary 1  ::::::::::: ${JSON.stringify(getDailySummary)}`
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
      locationNameOrPostcode,
      userLocation,
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
        searchTerms,
        selectedMatches,
        forecastNum,
        getForecasts,
        getMeasurements,
        getDailySummary,
        transformedDailySummary,
        nearestLocationsRange,
        englishDate,
        welshDate,
        month,
        headerTitle,
        titleRoute,
        headerTitleRoute,
        title,
        urlRoute,
        locationType,
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
        transformedDailySummary,
        footerTxt,
        phaseBanner,
        backlink,
        cookieBanner,
        calendarWelsh,
        month,
        welshDate,
        englishDate,
        locationType,
        lang
      })
    } else {
      return h.redirect('/location-not-found').takeover()
    }
  } else if (locationType === LOCATION_TYPE_NI) {
    const { daqi } = english
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
      logger.info(
        `::::::::::: redirecting to location-not-found results en  ::::::::::: ${JSON.stringify(getNIPlaces?.results)}`
      )
      logger.info(
        `::::::::::: redirecting to location-not-found getNIPlaces en  ::::::::::: ${JSON.stringify(getNIPlaces)}`
      )
      return h.redirect('/location-not-found').takeover()
    }
    logger.info(
      `::::::::::: getNIPlaces results  passed to getNearestLocation en  ::::::::::: ${JSON.stringify(getNIPlaces?.results)}`
    )
    const { forecastNum, nearestLocationsRange, latlon, airQuality } =
      getNearestLocation(
        getNIPlaces?.results,
        getForecasts?.forecasts,
        getMeasurements?.measurements,
        LOCATION_TYPE_NI,
        0,
        lang
      )
    logger.info(
      `::::::::::: getNIPlaces 1  forecastNum stringify ::::::::::: ${JSON.stringify(forecastNum)}`
    )
    logger.info(
      `::::::::::: getNIPlaces 1  latlon ::::::::::: ${JSON.stringify(latlon)}`
    )
    logger.info(
      `::::::::::: getNIPlaces 1  result stringify ::::::::::: ${JSON.stringify(getNIPlaces?.results)}`
    )
    logger.info(
      `::::::::::: getNIPlaces 1  airQuality stringify ::::::::::: ${JSON.stringify(airQuality)}`
    )
    logger.info(
      `::::::::::: getNIPlaces 1  nearestLocationsRange stringify ::::::::::: ${JSON.stringify(nearestLocationsRange)}`
    )

    let title = ''
    let headerTitle = ''
    let urlRoute = ''
    logger.info(`::::::::::: getNIPlaces 2  :::::::::::`)

    title = `${getNIPlaces?.results[0].postcode}, ${sentenceCase(getNIPlaces?.results[0].administrativeArea)} - ${home.pageTitle}`
    headerTitle = `${getNIPlaces?.results[0].postcode}, ${sentenceCase(getNIPlaces?.results[0].administrativeArea)}`
    urlRoute = `${getNIPlaces?.results[0].postcode}_${sentenceCase(getNIPlaces?.results[0].administrativeArea)}`

    logger.info(`::::::::::: getNIPlaces 3  :::::::::::`)
    title = convertFirstLetterIntoUppercase(title)
    headerTitle = convertFirstLetterIntoUppercase(headerTitle)
    urlRoute = convertStringToHyphenatedLowercaseWords(urlRoute)
    const resultNI = [
      {
        GAZETTEER_ENTRY: {
          ID: urlRoute,
          NAME1: getNIPlaces?.results[0].postcode,
          DISTRICT_BOROUGH: sentenceCase(
            getNIPlaces?.results[0].administrativeArea
          ),
          LONGITUDE: latlon?.lon,
          LATITUDE: latlon?.lat
        }
      }
    ]
    request.yar.set('locationData', {
      results: resultNI,
      airQuality,
      airQualityData: airQualityData.commonMessages,
      monitoringSites: nearestLocationsRange,
      siteTypeDescriptions,
      pollutantTypes,
      pageTitle: `${multipleLocations.titlePrefix} ${title}`,
      title: `${multipleLocations.titlePrefix} ${headerTitle}`,
      displayBacklink: true,
      dailySummary: getDailySummary,
      transformedDailySummary,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      daqi,
      welshMonth: calendarWelsh[getMonth],
      summaryDate: lang === 'cy' ? welshDate : englishDate,
      dailySummaryTexts: english.dailySummaryTexts,
      locationType,
      forecastNum,
      lang
    })
    logger.info(
      `::::::::::: redirecting to specific urlRoute en  ::::::::::: ${urlRoute}`
    )

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
