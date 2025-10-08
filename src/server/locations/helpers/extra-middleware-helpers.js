import { processMatches, deduplicateResults } from './middleware-helpers.js'
import { generateTitleData } from './generate-title-data.js'
import { handleSingleMatchHelper } from './handle-single-match-helper.js'
import { handleMultipleMatchesHelper } from './handle-multiple-match-helper.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { english } from '../../data/en/en.js'
import { STATUS_NOT_FOUND } from '../../data/constants.js'

const logger = createLogger()
// Helper function to handle redirection for invalid input
const handleErrorInputAndRedirect = (
  request,
  h,
  lang,
  payload,
  searchTerms
) => {
  const locationNameOrPostcode = payload?.engScoWal || payload?.ni
  if (!payload?.locationType && !searchTerms) {
    request.yar.set('locationDataNotFound', {
      locationNameOrPostcode: '',
      lang
    })
    return h.redirect('/location-not-found').takeover()
  }
  return {
    locationType: payload?.locationType || '',
    userLocation: searchTerms || locationNameOrPostcode,
    locationNameOrPostcode: searchTerms || locationNameOrPostcode
  }
}

// Refactored handleUKLocationType function
const handleUKLocationType = async (request, h, params) => {
  const {
    getOSPlaces,
    userLocation,
    locationNameOrPostcode,
    searchTerms,
    secondSearchTerm,
    lang
  } = params

  // Deduplicate results
  let { results } = getOSPlaces
  results = deduplicateResults(results)

  // Process matches
  const { selectedMatches } = processMatches(
    results,
    userLocation,
    locationNameOrPostcode,
    searchTerms,
    secondSearchTerm
  )
  logger.info(
    `Selected matches before filtering 3xxx: ${JSON.stringify(selectedMatches)}`
  )
  // Handle matches
  if (selectedMatches.length === 1) {
    const titleData = generateTitleData(selectedMatches, locationNameOrPostcode)
    return handleSingleMatchHelper(
      h,
      request,
      params,
      selectedMatches,
      titleData
    )
  }

  if (selectedMatches.length > 1) {
    return handleMultipleMatchesHelper(h, request, params, selectedMatches)
  }

  // Handle no matches
  request.yar.set('locationDataNotFound', { locationNameOrPostcode, lang })
  request.yar.clear('searchTermsSaved')
  if (searchTerms) {
    // '' Render error view directly to avoid redirect to catchAll
    return h
      .view('error/index', {
        pageTitle: 'Page not found',
        heading: 'Page not found',
        statusCode: STATUS_NOT_FOUND,
        message: 'Page not found',
        url: request.path,
        notFoundUrl: english.notFoundUrl,
        displayBacklink: false,
        phaseBanner: english.phaseBanner,
        footerTxt: english.footerTxt,
        cookieBanner: english.cookieBanner,
        serviceName: english.multipleLocations.serviceName,
        lang
      })
      .code(STATUS_NOT_FOUND)
      .takeover()
  }
  return h.redirect('/location-not-found').takeover()
}

export { handleErrorInputAndRedirect, handleUKLocationType }
