import { PAGE_NOT_FOUND_CY } from '../../../data/cy/cy.js'
import {
  isValidFullPostcodeUK,
  isValidFullPostcodeNI,
  isValidPartialPostcodeUK,
  isOnlyWords
} from '../../helpers/convert-string.js'
import { processMatches } from '../../helpers/middleware-helpers.js'
import {
  LOCATION_NOT_FOUND_PATH_CY,
  ERROR_INDEX_PATH,
  STATUS_NOT_FOUND,
  WRONG_POSTCODE
} from '../../../data/constants.js'

// '' Helper function to validate location postcode based on type
export const validateLocationPostcode = (userLocation, locationType) => {
  if (locationType === 'uk-location') {
    return isValidFullPostcodeUK(userLocation)
  } else if (locationType === 'ni-location') {
    return isValidFullPostcodeNI(userLocation)
  } else {
    // '' Handle other location types
    return false
  }
}

// '' Helper function to create error response
export const createErrorResponse = (
  h,
  welshTranslations,
  lang,
  statusCode = STATUS_NOT_FOUND
) => {
  return h
    .view(ERROR_INDEX_PATH, {
      pageTitle: welshTranslations.notFoundUrl.nonService.pageTitle,
      heading: PAGE_NOT_FOUND_CY,
      statusCode,
      message: PAGE_NOT_FOUND_CY,
      url: '',
      notFoundUrl: welshTranslations.notFoundUrl,
      displayBacklink: false,
      phaseBanner: welshTranslations.phaseBanner,
      footerTxt: welshTranslations.footerTxt,
      cookieBanner: welshTranslations.cookieBanner,
      serviceName: welshTranslations.multipleLocations.serviceName,
      lang
    })
    .code(statusCode)
    .takeover()
}

// '' Helper function to handle location data not found
export const handleLocationNotFound = (
  request,
  h,
  locationNameOrPostcode,
  lang,
  isSearch = false,
  welshLocale = null
) => {
  request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
  request.yar.clear('searchTermsSaved')

  if (isSearch && welshLocale) {
    return createErrorResponse(h, welshLocale, lang)
  }
  return h.redirect(LOCATION_NOT_FOUND_PATH_CY).takeover()
}

// '' Helper function to validate UK search terms
export const validateUKSearchTerms = (
  searchTerms,
  request,
  h,
  locationNameOrPostcode,
  lang,
  welshData
) => {
  const isPartialPostcode = isValidPartialPostcodeUK(searchTerms)
  const isFullPostcode = isValidFullPostcodeUK(searchTerms)
  const wordsOnly = isOnlyWords(searchTerms)

  if (searchTerms && !wordsOnly && !isPartialPostcode && !isFullPostcode) {
    return {
      isValid: false,
      response: handleLocationNotFound(
        request,
        h,
        locationNameOrPostcode,
        lang,
        true,
        welshData
      )
    }
  }

  return {
    isValid: true,
    isPartialPostcode,
    isFullPostcode,
    wordsOnly
  }
}

// '' Helper function to check if results are empty or invalid
const isResultsEmpty = (results, getOSPlaces) => {
  return !results || results.length === 0 || getOSPlaces === WRONG_POSTCODE
}

// '' Helper function to handle no results without search terms
const handleNoResultsWithoutSearch = (
  request,
  h,
  locationNameOrPostcode,
  lang
) => {
  return {
    isValid: false,
    response: handleLocationNotFound(request, h, locationNameOrPostcode, lang)
  }
}

// '' Helper function to handle no results with search terms
const handleNoResultsWithSearch = (
  request,
  h,
  locationNameOrPostcode,
  lang,
  welshContent
) => {
  return {
    isValid: false,
    response: handleLocationNotFound(
      request,
      h,
      locationNameOrPostcode,
      lang,
      true,
      welshContent
    )
  }
}

// '' Helper function to check if results are valid
const checkResultsExist = (
  getOSPlaces,
  searchTerms,
  request,
  h,
  locationNameOrPostcode,
  lang,
  welshContent
) => {
  const { results } = getOSPlaces

  // '' Check if results are empty or invalid
  const resultsEmpty = isResultsEmpty(results, getOSPlaces)

  // '' Handle case without search terms
  if (resultsEmpty && !searchTerms) {
    return handleNoResultsWithoutSearch(
      request,
      h,
      locationNameOrPostcode,
      lang
    )
  }

  // '' Handle case with search terms but no results
  if (!results && searchTerms) {
    return handleNoResultsWithSearch(
      request,
      h,
      locationNameOrPostcode,
      lang,
      welshContent
    )
  }

  return { isValid: true, results }
}

// '' Helper function to remove duplicate results
const removeDuplicateResults = (results) => {
  return Array.from(new Set(results.map((item) => JSON.stringify(item)))).map(
    (item) => JSON.parse(item)
  )
}

// '' Helper function to check if search terms have exact word matches
const hasExactWordMatches = (exactWordFirstTerm, exactWordSecondTerm) => {
  return exactWordFirstTerm && exactWordSecondTerm
}

// '' Helper function to handle search terms with no matches
const handleSearchTermsNoMatches = (request, h) => {
  request.yar.clear('searchTermsSaved')
  return {
    isValid: false,
    response: h
      .redirect(
        `${ERROR_INDEX_PATH}?from=${encodeURIComponent(request.url.pathname)}`
      )
      .takeover()
  }
}

// '' Helper function to validate matches
const validateMatches = (matchData, requestContext, locationContext) => {
  const {
    selectedMatches,
    searchTerms,
    exactWordFirstTerm,
    exactWordSecondTerm
  } = matchData
  const { request, h } = requestContext
  const { locationNameOrPostcode, lang } = locationContext

  // '' Handle search terms with no matches and no exact word matches
  if (
    searchTerms !== undefined &&
    selectedMatches.length === 0 &&
    !hasExactWordMatches(exactWordFirstTerm, exactWordSecondTerm)
  ) {
    return handleSearchTermsNoMatches(request, h)
  }

  // '' Handle no matches found
  if (selectedMatches.length === 0) {
    return {
      isValid: false,
      response: handleLocationNotFound(request, h, locationNameOrPostcode, lang)
    }
  }

  return { isValid: true }
}

// '' Helper function to validate and process results
export const validateAndProcessResults = (
  getOSPlaces,
  searchParams,
  requestContext,
  locationParams,
  welshContent
) => {
  const { searchTerms, userLocation, secondSearchTerm } = searchParams
  const { request, h } = requestContext
  const { locationNameOrPostcode, lang } = locationParams

  // '' Check if results exist
  const resultsCheck = checkResultsExist(
    getOSPlaces,
    searchTerms,
    request,
    h,
    locationNameOrPostcode,
    lang,
    welshContent
  )
  if (!resultsCheck.isValid) {
    return resultsCheck
  }

  // '' Remove duplicates from results
  const cleanResults = removeDuplicateResults(resultsCheck.results)

  // '' Process matches
  const { selectedMatches, exactWordFirstTerm, exactWordSecondTerm } =
    processMatches(
      cleanResults,
      userLocation,
      locationNameOrPostcode,
      searchTerms,
      secondSearchTerm
    )

  // '' Validate matches
  const matchValidation = validateMatches(
    {
      selectedMatches,
      searchTerms,
      exactWordFirstTerm,
      exactWordSecondTerm
    },
    {
      request,
      h
    },
    {
      locationNameOrPostcode,
      lang
    }
  )
  if (!matchValidation.isValid) {
    return matchValidation
  }

  return {
    isValid: true,
    selectedMatches
  }
}
