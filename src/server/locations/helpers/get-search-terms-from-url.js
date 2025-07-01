import { LOCATION_TYPE_NI, LOCATION_TYPE_UK } from '../../data/constants.js'
import { getPostcode } from './get-postcode-type.js'
import { isOnlyWords } from './convert-string.js'

const getSearchTermsFromUrl = (url) => {
  let searchTermsLang = ''
  let searchTermsLocationType = ''
  const splits = url?.split('/') // Split the URL by forward slashes
  const locLang = splits[3] // Get the string after the second forward slash and before the third one
  if (locLang === 'lleoliad') {
    searchTermsLang = 'cy'
  } // If the string is 'lleoliad', set the language to Welsh
  if (locLang === 'location') {
    searchTermsLang = 'en'
  } // If the string is 'location', set the language to English
  const lastSlashIndex = url.lastIndexOf('/') // Find the position of the last forward slash
  let interrogationSignIndex = url.indexOf('?') // Find the position of the interrogation sign
  if (interrogationSignIndex === -1) {
    interrogationSignIndex = url.length // If there is no interrogation sign, set the index to the end of the string
  }
  const extractedString = url.substring(
    lastSlashIndex + 1,
    interrogationSignIndex
  ) // Extract the string between the last forward slash and the interrogation sign
  const parts = extractedString?.split(/[_-]/) // Split by hyphen and underscore
  let searchTerms = parts.join(' ') // Join the parts with spaces
  const { postcodeType } = getPostcode(searchTerms) // Get the postcode type
  searchTermsLocationType = postcodeType // Set the location type to 'invalid postcode or not a postcode'
  if (
    postcodeType === 'Full Northern Ireland Postcode' ||
    postcodeType === 'Partial Northern Ireland Postcode'
  ) {
    searchTermsLocationType = LOCATION_TYPE_NI // Set the location type to Northern Ireland ''
  }
  if (
    postcodeType === 'Full UK Postcode' ||
    postcodeType === 'Partial UK Postcode'
  ) {
    searchTermsLocationType = LOCATION_TYPE_UK // Set the location type to UK ''
  }
  // Separate the string after the underscore
  const underscoreParts = extractedString?.split('_') // Split the string by underscore
  let secondSearchTerm = '' // Initialize the second search term
  if (postcodeType === 'Invalid Postcode') {
    if (isOnlyWords(searchTerms)) {
      searchTermsLocationType = LOCATION_TYPE_UK
    }
    searchTerms = underscoreParts[0]?.split('-').join(' ') // Get the part before the underscore // ''
    secondSearchTerm = underscoreParts[1]?.split('-').join(' ') // Get the part after the underscore // ''
  }
  return {
    searchTerms,
    secondSearchTerm,
    searchTermsLang,
    searchTermsLocationType
  } // Return the search terms, the language and the location type
}

export { getSearchTermsFromUrl }
