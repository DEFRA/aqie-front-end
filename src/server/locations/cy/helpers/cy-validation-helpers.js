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

// '' Helper function to validate and process results
export const validateAndProcessResults = (
  getOSPlaces,
  searchTerms,
  request,
  h,
  locationNameOrPostcode,
  lang,
  welshContent,
  userLocation,
  secondSearchTerm
) => {
  let { results } = getOSPlaces

  // '' Check if results exist
  if (
    (!results || results.length === 0 || getOSPlaces === WRONG_POSTCODE) &&
    !searchTerms
  ) {
    return {
      isValid: false,
      response: handleLocationNotFound(request, h, locationNameOrPostcode, lang)
    }
  }

  if (!results && searchTerms) {
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
    return {
      isValid: false,
      response: h
        .redirect(
          `${ERROR_INDEX_PATH}?from=${encodeURIComponent(request.url.pathname)}`
        )
        .takeover()
    }
  }

  if (selectedMatches.length === 0) {
    return {
      isValid: false,
      response: handleLocationNotFound(request, h, locationNameOrPostcode, lang)
    }
  }

  return {
    isValid: true,
    selectedMatches
  }
}
