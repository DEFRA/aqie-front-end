import * as airQualityData from '~/src/server/data/en/air-quality.js'
import { fetchData } from '~/src/server/locations/helpers/fetch-data'
import { english, calendarEnglish } from '~/src/server/data/en/en.js'
import { calendarWelsh } from '~/src/server/data/cy/cy.js'
import {
  siteTypeDescriptions,
  pollutantTypes
} from '~/src/server/data/en/monitoring-sites.js'
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
  isValidPartialPostcodeNI,
  isValidPartialPostcodeUK,
  isOnlyWords
} from '~/src/server/locations/helpers/convert-string'
import { sentenceCase } from '~/src/server/common/helpers/sentence-case'
import { convertFirstLetterIntoUppercase } from '~/src/server/locations/helpers/convert-first-letter-into-upper-case'
import { transformKeys } from '~/src/server/locations/helpers/transform-summary-keys.js'

const searchMiddleware = async (request, h) => {
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
  if (locationType === 'Invalid Postcode') {
    request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
    request.yar.clear('searchTermsSaved')
    return h.redirect('error/index').takeover()
  }
  const isLocationValidPostcode = isValidFullPostcodeUK(userLocation)
  const wordsOnly = isOnlyWords(userLocation)
  if (!isLocationValidPostcode && !wordsOnly) {
    request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
    request.yar.clear('searchTermsSaved')
    if (searchTerms) {
      return h.redirect('error/index').takeover()
    }
    return h.redirect('/location-not-found').takeover()
  }
  const { getDailySummary, getForecasts, getMeasurements, getOSPlaces } =
    await fetchData(request, h, {
      locationType,
      userLocation,
      locationNameOrPostcode,
      lang,
      searchTerms,
      secondSearchTerm
    })
  if (!getDailySummary) {
    request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
    request.yar.clear('searchTermsSaved')
    return h.redirect('/location-not-found').takeover()
  }
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
    const wordsOnly = isOnlyWords(searchTerms)
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
    if (!results && searchTerms) {
      request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
      request.yar.clear('searchTermsSaved')
      return h.redirect('error/index').takeover()
    }
    // Remove duplicates from the results array
    results = Array.from(
      new Set(results.map((item) => JSON.stringify(item)))
    ).map((item) => JSON.parse(item))

    const { selectedMatches } = processMatches(
      results,
      userLocation,
      locationNameOrPostcode,
      searchTerms,
      secondSearchTerm
    )
    if (searchTerms !== undefined && selectedMatches.length === 0) {
      request.yar.clear('searchTermsSaved')
      return h.redirect('error/index').takeover()
    }
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
    const isPartialPostcode = isValidPartialPostcodeNI(locationNameOrPostcode)
    if (isPartialPostcode) {
      request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
      request.yar.clear('searchTermsSaved')
      return h.redirect('/location-not-found').takeover()
    }
    const { getNIPlaces } = await fetchData(request, h, {
      locationType,
      userLocation,
      locationNameOrPostcode,
      lang,
      searchTerms,
      secondSearchTerm
    })
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
