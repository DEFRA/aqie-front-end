import { LOCATION_TYPE_NI, LOCATION_TYPE_UK } from '~/src/server/data/constants'

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
  // Extract the postcode from the searchTerms variable
  const postcodeRegex = /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}\b/i // Regular expression to match postcode format
  const postcodeMatch = searchTerms.match(postcodeRegex) // Match the postcode in the searchTerms

  const isFullNorthernIrelandPostcode =
    postcodeMatch && /^BT\d{1,2}\s?\d[A-Z]{2}$/i.test(postcodeMatch[0]) // Regular expression to match full Northern Ireland postcode format ''
  const isPartialNorthernIrelandPostcode =
    postcodeMatch && /^BT\d{1,2}$/i.test(postcodeMatch[0]) // Regular expression to match partial Northern Ireland postcode format ''
  if (isFullNorthernIrelandPostcode || isPartialNorthernIrelandPostcode) {
    searchTermsLocationType = LOCATION_TYPE_NI // Set the location type to Northern Ireland ''
  } else {
    searchTermsLocationType = LOCATION_TYPE_UK // Set the location type to UK ''
  }
  // Separate the string after the underscore
  const underscoreParts = extractedString?.split('_') // Split the string by underscore
  let secondSearchTerm = '' // Initialize the second search term
  if (!postcodeMatch) {
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
