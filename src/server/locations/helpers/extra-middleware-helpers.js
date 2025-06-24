import {
  processMatches,
  duplicateResults
} from '~/src/server/locations/helpers/middleware-helpers'
import { generateTitleData } from '~/src/server/locations/helpers/generate-title-data'
import { handleSingleMatchHelper } from '~/src/server/locations/helpers/handle-single-match-helper'
import { handleMultipleMatchesHelper } from '~/src/server/locations/helpers/handle-multiple-match-helper'

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

    const redirectResult = h.redirect('/location-not-found')

    // Ensure takeover is returned correctly
    if (typeof redirectResult.takeover === 'function') {
      redirectResult.takeover()
    }

    return { redirect: '/location-not-found' } // Explicitly return a valid result
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
  results = duplicateResults(results)

  // Process matches
  const { selectedMatches } = processMatches(
    results,
    userLocation,
    locationNameOrPostcode,
    searchTerms,
    secondSearchTerm
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

  const redirectResult = h.redirect('/location-not-found')

  // Ensure takeover is returned correctly
  if (typeof redirectResult.takeover === 'function') {
    redirectResult.takeover()
  }

  return { redirect: '/location-not-found' } // Explicitly return a valid result
}

export { handleErrorInputAndRedirect, handleUKLocationType }
