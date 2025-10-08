import * as airQualityData from '../../data/cy/air-quality.js'
import { fetchData } from '../helpers/fetch-data.js'
import { welsh, calendarWelsh, PAGE_NOT_FOUND_CY } from '../../data/cy/cy.js'
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
  LOCATION_NOT_FOUND_PATH_CY,
  ERROR_INDEX_PATH,
  STATUS_NOT_FOUND,
  REDIRECT_STATUS_CODE,
  WRONG_POSTCODE,
  MIN_LOCATION_NAME_LENGTH
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

// '' Helper function to validate location postcode based on type
const validateLocationPostcode = (userLocation, locationType) => {
  if (locationType === 'uk-location') {
    return isValidFullPostcodeUK(userLocation)
  } else if (locationType === 'ni-location') {
    return isValidFullPostcodeNI(userLocation)
  }
  return false
}

// '' Helper function to create error response
const createErrorResponse = (h, welsh, lang, statusCode = STATUS_NOT_FOUND) => {
  return h
    .view(ERROR_INDEX_PATH, {
      pageTitle: welsh.notFoundUrl.nonService.pageTitle,
      heading: PAGE_NOT_FOUND_CY,
      statusCode,
      message: PAGE_NOT_FOUND_CY,
      url: '',
      notFoundUrl: welsh.notFoundUrl,
      displayBacklink: false,
      phaseBanner: welsh.phaseBanner,
      footerTxt: welsh.footerTxt,
      cookieBanner: welsh.cookieBanner,
      serviceName: welsh.multipleLocations.serviceName,
      lang
    })
    .code(statusCode)
    .takeover()
}

// '' Helper function to handle location data not found
const handleLocationNotFound = (
  request,
  h,
  locationNameOrPostcode,
  lang,
  isSearch = false,
  welsh = null
) => {
  request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
  request.yar.clear('searchTermsSaved')

  if (isSearch && welsh) {
    return createErrorResponse(h, welsh, lang)
  }
  return h.redirect(LOCATION_NOT_FOUND_PATH_CY).takeover()
}

// '' Helper function to process UK locations
const processUKLocation = async (request, h, params) => {
  const {
    getOSPlaces,
    searchTerms,
    secondSearchTerm,
    userLocation,
    locationNameOrPostcode,
    lang,
    welsh,
    getForecasts,
    getDailySummary,
    transformedDailySummary,
    englishDate,
    welshDate,
    month,
    locationType,
    multipleLocations,
    airQualityData,
    siteTypeDescriptions,
    pollutantTypes,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    calendarWelsh
  } = params

  let { results } = getOSPlaces
  const isPartialPostcode = isValidPartialPostcodeUK(searchTerms)
  const isFullPostcode = isValidFullPostcodeUK(searchTerms)
  const wordsOnly = isOnlyWords(searchTerms)

  // '' Validate search terms
  if (searchTerms && !wordsOnly && !isPartialPostcode && !isFullPostcode) {
    return handleLocationNotFound(
      request,
      h,
      locationNameOrPostcode,
      lang,
      true,
      welsh
    )
  }

  // '' Check if results exist
  if (
    (!results || results.length === 0 || getOSPlaces === WRONG_POSTCODE) &&
    !searchTerms
  ) {
    return handleLocationNotFound(request, h, locationNameOrPostcode, lang)
  }

  if (!results && searchTerms) {
    return handleLocationNotFound(
      request,
      h,
      locationNameOrPostcode,
      lang,
      true,
      welsh
    )
  }

  // '' Remove duplicates from results
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
        `${ERROR_INDEX_PATH}?from=${encodeURIComponent(request.url.pathname)}`
      )
      .takeover()
  }

  if (selectedMatches.length === 0) {
    return handleLocationNotFound(request, h, locationNameOrPostcode, lang)
  }

  const normalizedUserLocation =
    userLocation.toLowerCase().charAt(0).toUpperCase() + userLocation.slice(1)
  const { title, headerTitle, urlRoute } = getTitleAndHeaderTitle(
    selectedMatches,
    locationNameOrPostcode
  )
  const headerTitleRoute = convertStringToHyphenatedLowercaseWords(
    String(urlRoute)
  )
  const titleRoute = convertStringToHyphenatedLowercaseWords(String(title))
  const isCurrentPartialPostcode = isValidPartialPostcodeUK(
    locationNameOrPostcode
  )

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
      isCurrentPartialPostcode) ||
    (selectedMatches.length > 1 &&
      locationNameOrPostcode.length >= MIN_LOCATION_NAME_LENGTH &&
      !isCurrentPartialPostcode)
  ) {
    return handleMultipleMatches(h, request, {
      selectedMatches,
      headerTitleRoute,
      titleRoute,
      locationNameOrPostcode,
      userLocation: normalizedUserLocation,
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
    return handleLocationNotFound(request, h, locationNameOrPostcode, lang)
  }
}

// '' Helper function to process NI locations
const processNILocation = async (request, h, params) => {
  const {
    locationNameOrPostcode,
    lang,
    userLocation,
    searchTerms,
    secondSearchTerm,
    locationType,
    getDailySummary,
    transformedDailySummary,
    englishDate,
    welshDate,
    month,
    multipleLocations,
    getForecasts,
    home,
    REDIRECT_STATUS_CODE
  } = params

  const isPartialPostcode = isValidPartialPostcodeNI(locationNameOrPostcode)
  if (isPartialPostcode) {
    return handleLocationNotFound(request, h, locationNameOrPostcode, lang)
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
    getNIPlaces === WRONG_POSTCODE
  ) {
    return handleLocationNotFound(request, h, locationNameOrPostcode, lang)
  }

  const result = getNIPlaces.results[0]
  let title = `${result.postcode}, ${sentenceCase(result.town)} - ${home.pageTitle}`
  let headerTitle = `${result.postcode}, ${sentenceCase(result.town)}`
  const urlRoute = result.postcode.toLowerCase().replace(/\s+/g, '')

  title = convertFirstLetterIntoUppercase(title)
  headerTitle = convertFirstLetterIntoUppercase(headerTitle)

  request.yar.clear('locationData')
  request.yar.set('locationData', {
    results: getNIPlaces.results,
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
}

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

  // '' Handle error input and redirection
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

  // '' Handle invalid postcode
  if (locationType === 'Invalid Postcode') {
    return handleLocationNotFound(
      request,
      h,
      locationNameOrPostcode,
      lang,
      true,
      welsh
    )
  }

  // '' Validate location input
  const isLocationValidPostcode = validateLocationPostcode(
    userLocation,
    redirectError.locationType
  )
  const userLocationWordsOnly = isOnlyWords(userLocation)

  if (!isLocationValidPostcode && !userLocationWordsOnly) {
    return handleLocationNotFound(
      request,
      h,
      locationNameOrPostcode,
      lang,
      Boolean(searchTerms),
      welsh
    )
  }
  // '' Fetch location data
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
    return handleLocationNotFound(request, h, locationNameOrPostcode, lang)
  }

  // '' Process date and summary data
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

  // '' Set session data
  request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
  request.yar.set('searchTermsSaved', searchTerms)

  // '' Process based on location type
  if (locationType === LOCATION_TYPE_UK) {
    return processUKLocation(request, h, {
      getOSPlaces,
      searchTerms,
      secondSearchTerm,
      userLocation,
      locationNameOrPostcode,
      lang,
      welsh,
      getForecasts,
      getDailySummary,
      transformedDailySummary,
      englishDate,
      welshDate,
      month,
      locationType,
      multipleLocations,
      airQualityData,
      siteTypeDescriptions,
      pollutantTypes,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      calendarWelsh
    })
  } else if (locationType === LOCATION_TYPE_NI) {
    return processNILocation(request, h, {
      locationNameOrPostcode,
      lang,
      userLocation,
      searchTerms,
      secondSearchTerm,
      locationType,
      getDailySummary,
      transformedDailySummary,
      englishDate,
      welshDate,
      month,
      multipleLocations,
      getForecasts,
      home,
      REDIRECT_STATUS_CODE
    })
  } else {
    // '' Handle other location types
    return handleLocationNotFound(request, h, locationNameOrPostcode, lang)
  }
}

export { searchMiddlewareCy }
