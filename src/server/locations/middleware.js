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
import {
  convertStringToHyphenatedLowercaseWords,
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK,
  isWordsOnly
} from '~/src/server/locations/helpers/convert-string'
import { sentenceCase } from '~/src/server/common/helpers/sentence-case'
import { convertFirstLetterIntoUppercase } from '~/src/server/locations/helpers/convert-first-letter-into-upper-case'
import { transformKeys } from '~/src/server/locations/helpers/transform-summary-keys.js'

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
      locationNameOrPostcode,
      lang,
      searchTerms,
      secondSearchTerm
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

    let isPartialPostcode = isValidPartialPostcodeUK(searchTerms)
    const isFullPostcode = isValidFullPostcodeUK(searchTerms)
    const wordsOnly = isWordsOnly(searchTerms)
    if (searchTerms && !wordsOnly && !isPartialPostcode && !isFullPostcode) {
      request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
      request.yar.clear('searchTermsSaved')
      return h.redirect('error/index').takeover()
    }
    if (
      (!results || results.length === 0 || getOSPlaces === 'wrong postcode') &&
      !searchTerms
    ) {
      request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
      request.yar.clear('searchTermsSaved')
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
      request.yar.clear('searchTermsSaved')
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
    isPartialPostcode = isValidPartialPostcodeUK(locationNameOrPostcode)
    if (selectedMatches.length === 1) {
      return handleSingleMatch(h, request, {
        searchTerms,
        selectedMatches,
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
        headerTitle,
        title,
        month,
        welshDate,
        englishDate,
        locationType,
        lang
      })
    } else {
      request.yar.clear('searchTermsSaved')
      return h.redirect('/location-not-found').takeover()
    }
  } else if (locationType === LOCATION_TYPE_NI) {
    const { getNIPlaces } = await fetchData(
      LOCATION_TYPE_NI,
      userLocation,
      request,
      locationNameOrPostcode,
      lang,
      searchTerms,
      secondSearchTerm
    )

    logger.info(`::::::LOCATION_TYPE_NI-EN::::::: , ${getNIPlaces?.results[0]}`)
    if (
      !getNIPlaces?.results ||
      getNIPlaces?.results.length === 0 ||
      getNIPlaces === 'wrong postcode'
    ) {
      request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
      request.yar.clear('searchTermsSaved')
      return h.redirect('/location-not-found').takeover()
    }
    let title = ''
    let headerTitle = ''
    let urlRoute = ''
    title = `${getNIPlaces?.results[0].postcode}, ${sentenceCase(getNIPlaces?.results[0].town)} - ${home.pageTitle}`
    headerTitle = `${getNIPlaces?.results[0].postcode}, ${sentenceCase(getNIPlaces?.results[0].town)}`
    urlRoute = `${getNIPlaces?.results[0].postcode.toUpperCase()}`
    title = convertFirstLetterIntoUppercase(title)
    headerTitle = convertFirstLetterIntoUppercase(headerTitle)
    urlRoute = urlRoute.replace(/\s+/g, '')
    logger.info(`urlRoute in middleware english NI ${urlRoute}`)
    request.yar.clear('locationData')
    request.yar.set('locationData', {
      results: getNIPlaces?.results,
      urlRoute,
      locationType,
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
    return h.redirect(`/location/${urlRoute}?lang=en`).takeover()
  } else {
    // handle other location types
    request.yar.clear('searchTermsSaved')
    return h.redirect('/location-not-found').takeover()
  }
}

export { searchMiddleware }
