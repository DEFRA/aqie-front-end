import * as airQualityData from '../../data/cy/air-quality.js'
import { fetchData } from '../helpers/fetch-data.js'
import { welsh, calendarWelsh } from '../../data/cy/cy.js'
import { calendarEnglish } from '../../data/en/en.js'
import {
  siteTypeDescriptions,
  pollutantTypes
} from '../../data/cy/monitoring-sites.js'
import { handleErrorInputAndRedirect } from '../helpers/error-input-and-redirect.js'
import {
  handleSingleMatch,
  handleMultipleMatches,
  processMatches,
  getTitleAndHeaderTitle,
  getLanguageDates,
  getFormattedDateSummary
} from '../helpers/middleware-helpers.js'
import {
  LANG_CY,
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI,
  REDIRECT_STATUS_CODE
} from '../../data/constants.js'
import { getMonth } from '../helpers/location-type-util.js'
import {
  convertStringToHyphenatedLowercaseWords,
  isValidFullPostcodeUK,
  isValidFullPostcodeNI,
  isValidPartialPostcodeUK,
  isValidPartialPostcodeNI,
  isOnlyWords
} from '../helpers/convert-string.js'
import { sentenceCase } from '../../common/helpers/sentence-case.js'
import { convertFirstLetterIntoUppercase } from '../helpers/convert-first-letter-into-upper-case.js'
import { transformKeys } from '../helpers/transform-summary-keys.js'

const searchMiddlewareCy = async (request, h) => {
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
  if (locationType === 'Invalid Postcode') {
    request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
    request.yar.clear('searchTermsSaved')
    return h.redirect('error/index').takeover()
  }
  let isLocationValidPostcode
  if (redirectError.locationType === 'uk-location') {
    isLocationValidPostcode = isValidFullPostcodeUK(userLocation)
  } else if (redirectError.locationType === 'ni-location') {
    isLocationValidPostcode = isValidFullPostcodeNI(userLocation)
  } else {
    isLocationValidPostcode = false
  }
  const wordsOnly = isOnlyWords(userLocation)
  if (!isLocationValidPostcode && !wordsOnly) {
    request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
    request.yar.clear('searchTermsSaved')
    if (searchTerms) {
      return h.redirect('error/index').takeover()
    }
    return h.redirect('/lleoliad-heb-ei-ganfod/cy').takeover()
  }
  const { getDailySummary, getForecasts, getOSPlaces } = await fetchData(
    request,
    {
      locationType,
      userLocation,
      locationNameOrPostcode,
      lang,
      searchTerms,
      secondSearchTerm
    }
  )
  if (!getDailySummary) {
    request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
    request.yar.clear('searchTermsSaved')
    return h.redirect('/lleoliad-heb-ei-ganfod/cy').takeover()
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
      return h.redirect('/lleoliad-heb-ei-ganfod/cy').takeover()
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

    const { selectedMatches, exactWordFirstTerm, exactWordSecondTerm } =
      processMatches(
        results,
        userLocation,
        locationNameOrPostcode,
        searchTerms,
        secondSearchTerm
      )
    if (
      searchTerms !== undefined &&
      selectedMatches.length === 0 &&
      (!exactWordFirstTerm || !exactWordSecondTerm)
    ) {
      request.yar.clear('searchTermsSaved')
      return h
        .redirect(
          `error/index?from=${encodeURIComponent(request.url.pathname)}`
        )
        .takeover()
    }
    if (selectedMatches.length === 0) {
      request.yar.clear('searchTermsSaved')
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
    isPartialPostcode = isValidPartialPostcodeUK(locationNameOrPostcode)
    if (selectedMatches.length === 1) {
      return handleSingleMatch(h, request, {
        searchTerms,
        selectedMatches,
        getForecasts,
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
      return h.redirect('/lleoliad-heb-ei-ganfod/cy').takeover()
    }
  } else if (locationType === LOCATION_TYPE_NI) {
    const isPartialPostcode = isValidPartialPostcodeNI(locationNameOrPostcode)
    if (isPartialPostcode) {
      request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
      request.yar.clear('searchTermsSaved')
      return h.redirect('/lleoliad-heb-ei-ganfod/cy').takeover()
    }
    const { getNIPlaces } = await fetchData(request, {
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
      return h.redirect('/lleoliad-heb-ei-ganfod/cy').takeover()
    }
    if (
      !getNIPlaces?.results ||
      getNIPlaces?.results.length === 0 ||
      getNIPlaces === 'wrong postcode'
    ) {
      request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
      request.yar.clear('searchTermsSaved')
      return h.redirect('/lleoliad-heb-ei-ganfod/cy').takeover()
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
      locationType,
      transformedDailySummary,
      englishDate,
      dailySummary: getDailySummary,
      welshDate,
      getMonth: month,
      title: `${multipleLocations.titlePrefix} ${headerTitle}`,
      pageTitle: `${multipleLocations.titlePrefix} ${title}`,
      getForecasts: getForecasts?.forecasts,
      lang
    })
    return h
      .redirect(`/lleoliad/${urlRoute}?lang=cy`)
      .code(REDIRECT_STATUS_CODE)
      .takeover()
  } else {
    // handle other location types
    request.yar.clear('searchTermsSaved')
    return h.redirect('/lleoliad-heb-ei-ganfod/cy').takeover()
  }
}

export { searchMiddlewareCy }
