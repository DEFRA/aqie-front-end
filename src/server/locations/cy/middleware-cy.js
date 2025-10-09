import { welsh } from '../../data/cy/cy.js'
import { LANG_CY, REDIRECT_STATUS_CODE } from '../../data/constants.js'
import { getMonth } from '../helpers/location-type-util.js'
import {
  validateInputAndHandleErrors,
  fetchAndProcessData,
  setSessionData,
  processLocationByType
} from './helpers/cy-middleware-utils.js'
import { handleLocationNotFound } from './helpers/cy-validation-helpers.js'

// '' Main Welsh middleware function for location search

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

  // '' Validate input and handle errors
  const validationResult = await validateInputAndHandleErrors(
    request,
    h,
    lang,
    payload,
    {
      searchTerms,
      searchTermsLocationType,
      initialLocationType: locationType
    },
    welsh
  )
  if (validationResult.error) {
    return validationResult.error
  }

  const {
    userLocation,
    locationNameOrPostcode,
    locationType: validatedLocationType
  } = validationResult
  locationType = validatedLocationType

  // '' Fetch and process data
  const dataResult = await fetchAndProcessData(
    request,
    locationType,
    userLocation,
    locationNameOrPostcode,
    lang,
    searchTerms,
    secondSearchTerm
  )
  if (dataResult.error) {
    return handleLocationNotFound(request, h, locationNameOrPostcode, lang)
  }

  const {
    getDailySummary,
    getForecasts,
    getOSPlaces,
    transformedDailySummary,
    englishDate,
    welshDate
  } = dataResult

  // '' Set session data
  setSessionData(request, locationNameOrPostcode, lang, searchTerms)

  // '' Process based on location type
  return processLocationByType(request, h, locationType, {
    locationNameOrPostcode,
    lang,
    ukParams: {
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
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner
    },
    niParams: {
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
      redirectStatusCode: REDIRECT_STATUS_CODE
    }
  })
}

export { searchMiddlewareCy }
