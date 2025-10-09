import * as airQualityData from '../../../data/cy/air-quality.js'
import { fetchData } from '../../helpers/fetch-data.js'
import { calendarWelsh } from '../../../data/cy/cy.js'
import {
  siteTypeDescriptions,
  pollutantTypes
} from '../../../data/cy/monitoring-sites.js'
import {
  handleSingleMatch,
  handleMultipleMatches,
  getTitleAndHeaderTitle
} from '../../helpers/middleware-helpers.js'
import {
  convertStringToHyphenatedLowercaseWords,
  isValidPartialPostcodeNI,
  isValidPartialPostcodeUK
} from '../../helpers/convert-string.js'
import { sentenceCase } from '../../../common/helpers/sentence-case.js'
import { convertFirstLetterIntoUppercase } from '../../helpers/convert-first-letter-into-upper-case.js'
import {
  REDIRECT_STATUS_CODE,
  WRONG_POSTCODE,
  MIN_LOCATION_NAME_LENGTH
} from '../../../data/constants.js'
import {
  validateUKSearchTerms,
  validateAndProcessResults,
  handleLocationNotFound
} from './cy-validation-helpers.js'

// '' Helper function to prepare location data
const prepareLocationData = (
  selectedMatches,
  locationNameOrPostcode,
  userLocation
) => {
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

  return {
    normalizedUserLocation,
    title,
    headerTitle,
    urlRoute,
    headerTitleRoute,
    titleRoute,
    isCurrentPartialPostcode
  }
}

// '' Helper function to build common parameters
const buildCommonParams = (selectedMatches, locationData, params) => {
  const { title, headerTitle, urlRoute, headerTitleRoute, titleRoute } =
    locationData
  const {
    getForecasts,
    getDailySummary,
    transformedDailySummary,
    englishDate,
    welshDate,
    month,
    locationType,
    multipleLocations,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    lang
  } = params

  return {
    selectedMatches,
    headerTitle,
    titleRoute,
    headerTitleRoute,
    title,
    urlRoute,
    getForecasts,
    getDailySummary,
    transformedDailySummary,
    englishDate,
    welshDate,
    month,
    locationType,
    multipleLocations,
    airQualityData, // Use the imported namespace
    siteTypeDescriptions,
    pollutantTypes,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    calendarWelsh,
    lang
  }
}

// '' Helper function to route based on match count and criteria
const routeBasedOnMatches = (
  selectedMatches,
  requestContext,
  locationContext,
  commonParams,
  routingParams
) => {
  const { h, request } = requestContext
  const {
    locationNameOrPostcode,
    isCurrentPartialPostcode,
    normalizedUserLocation,
    lang
  } = locationContext
  const { searchTerms } = routingParams

  if (selectedMatches.length === 1) {
    return handleSingleMatch(h, request, {
      ...commonParams,
      searchTerms
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
      ...commonParams,
      locationNameOrPostcode,
      userLocation: normalizedUserLocation
    })
  } else {
    return handleLocationNotFound(request, h, locationNameOrPostcode, lang)
  }
}

// '' Helper function to handle matched locations
export const handleMatchedLocations = (
  selectedMatches,
  locationNameOrPostcode,
  userLocation,
  h,
  request,
  params
) => {
  // '' Prepare location data
  const locationData = prepareLocationData(
    selectedMatches,
    locationNameOrPostcode,
    userLocation
  )

  // '' Build common parameters
  const commonParams = buildCommonParams(selectedMatches, locationData, params)

  // '' Route based on matches
  return routeBasedOnMatches(
    selectedMatches,
    {
      h,
      request
    },
    {
      locationNameOrPostcode,
      isCurrentPartialPostcode: locationData.isCurrentPartialPostcode,
      normalizedUserLocation: locationData.normalizedUserLocation,
      lang: params.lang
    },
    commonParams,
    {
      searchTerms: params.searchTerms
    }
  )
}

// '' Helper function to process UK locations
export const processUKLocation = async (request, h, params) => {
  const {
    searchTerms,
    locationNameOrPostcode,
    lang,
    getOSPlaces,
    userLocation,
    secondSearchTerm,
    welsh
  } = params

  // '' Validate search terms
  const searchValidation = validateUKSearchTerms(
    searchTerms,
    request,
    h,
    locationNameOrPostcode,
    lang,
    welsh
  )
  if (!searchValidation.isValid) {
    return searchValidation.response
  }

  // '' Validate and process results
  const resultsValidation = validateAndProcessResults(
    getOSPlaces,
    {
      searchTerms,
      userLocation,
      secondSearchTerm
    },
    {
      request,
      h
    },
    {
      locationNameOrPostcode,
      lang
    },
    welsh
  )
  if (!resultsValidation.isValid) {
    return resultsValidation.response
  }

  // '' Handle matched locations
  return handleMatchedLocations(
    resultsValidation.selectedMatches,
    locationNameOrPostcode,
    userLocation,
    h,
    request,
    params
  )
}

// '' Helper function to process NI locations
export const processNILocation = async (request, h, params) => {
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
    home
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
  const urlRoute = result.postcode.toLowerCase().replaceAll(/\s+/g, '')

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
