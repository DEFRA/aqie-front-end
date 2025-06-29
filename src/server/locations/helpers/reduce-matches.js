import { filterByPostcode } from './filter-by-postcode.js'
import { filterBySearchTerms } from './filter-by-search-terms.js'

const MAX_POSTCODE_LENGTH = 6 // Maximum length for partial postcodes
const SINGLE_MATCH = 1 // Limit to a single match
const reduceMatches = (selectedMatches, locationNameOrPostcode, options) => {
  const {
    searchTerms,
    secondSearchTerm,
    fullPostcodePattern,
    partialPostcodePattern,
    isFullPostcode
  } = options
  const isAlphanumeric = /^[a-zA-Z\d]+$/.test(locationNameOrPostcode) // Check if input is alphanumeric
  const isNotPostcode =
    !fullPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
    !partialPostcodePattern.test(locationNameOrPostcode.toUpperCase())
  const postcodes = { isFullPostcode, isNotPostcode }
  const search = { searchTerms, secondSearchTerm }

  // Apply filters
  selectedMatches = filterByPostcode(
    selectedMatches,
    locationNameOrPostcode,
    postcodes
  )
  selectedMatches = filterBySearchTerms(selectedMatches, search, isAlphanumeric)

  // Additional logic for partial postcodes or single matches
  if (
    (partialPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
      selectedMatches.length > 0 &&
      locationNameOrPostcode.length <= MAX_POSTCODE_LENGTH) ||
    selectedMatches.length === SINGLE_MATCH
  ) {
    return selectedMatches.slice(0, SINGLE_MATCH)
  }

  return selectedMatches
}

export default reduceMatches
