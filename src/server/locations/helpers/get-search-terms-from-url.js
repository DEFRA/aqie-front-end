import {
  LOCATION_TYPE_NI,
  LOCATION_TYPE_UK,
  URL_LANGUAGE_SEGMENT_INDEX
} from '../../data/constants.js'
import { getPostcode } from './get-postcode-type.js'
import { isOnlyWords } from './convert-string.js'

// '' Helper to determine language from URL path segment
function determineLanguageFromUrl(splits) {
  if (
    !splits ||
    !Array.isArray(splits) ||
    splits.length <= URL_LANGUAGE_SEGMENT_INDEX
  ) {
    return ''
  }
  const locLang = splits[URL_LANGUAGE_SEGMENT_INDEX]
  if (locLang === 'lleoliad') {
    return 'cy'
  }
  if (locLang === 'location') {
    return 'en'
  }
  return ''
}

// '' Helper to extract string between last slash and query parameter
function extractSearchString(url) {
  const lastSlashIndex = url.lastIndexOf('/')
  let interrogationSignIndex = url.indexOf('?')

  if (interrogationSignIndex === -1) {
    interrogationSignIndex = url.length
  }

  return url.substring(lastSlashIndex + 1, interrogationSignIndex)
}

// '' Helper to determine location type based on postcode type
function determineLocationType(postcodeType) {
  if (
    postcodeType === 'Full Northern Ireland Postcode' ||
    postcodeType === 'Partial Northern Ireland Postcode'
  ) {
    return LOCATION_TYPE_NI
  }

  if (
    postcodeType === 'Full UK Postcode' ||
    postcodeType === 'Partial UK Postcode'
  ) {
    return LOCATION_TYPE_UK
  }

  return postcodeType
}

const getSearchTermsFromUrl = (url) => {
  if (!url) {
    return {
      searchTerms: '',
      secondSearchTerm: '',
      searchTermsLang: '',
      searchTermsLocationType: ''
    }
  }

  const splits = url?.split('/')
  const searchTermsLang = determineLanguageFromUrl(splits)

  const extractedString = extractSearchString(url)
  const parts = extractedString?.split(/[_-]/)
  let searchTerms = parts?.join(' ') || ''

  const postcodeResult = getPostcode(searchTerms)
  const postcodeType = postcodeResult?.postcodeType || 'Invalid Postcode'
  let searchTermsLocationType = determineLocationType(postcodeType)

  const underscoreParts = extractedString?.split('_')
  let secondSearchTerm = ''

  if (postcodeType === 'Invalid Postcode') {
    // If there are underscores, process as multi-part search terms
    if (underscoreParts.length > 1) {
      if (isOnlyWords(searchTerms)) {
        searchTermsLocationType = LOCATION_TYPE_UK
      }
      searchTerms = underscoreParts[0]?.split('-').join(' ') || ''
      secondSearchTerm = underscoreParts[1]?.split('-').join(' ') || ''
      return {
        searchTerms,
        secondSearchTerm,
        searchTermsLang,
        searchTermsLocationType
      }
    }

    // For simple location names (only words, no underscores), return null for secondSearchTerm
    if (isOnlyWords(searchTerms)) {
      searchTermsLocationType = LOCATION_TYPE_UK
      return {
        searchTerms,
        secondSearchTerm: null,
        searchTermsLang,
        searchTermsLocationType
      }
    }

    // For other invalid postcodes
    return {
      searchTerms,
      secondSearchTerm: '',
      searchTermsLang,
      searchTermsLocationType
    }
  }

  // For valid postcodes, return empty string for secondSearchTerm
  return {
    searchTerms,
    secondSearchTerm: '',
    searchTermsLang,
    searchTermsLocationType
  }
}

export { getSearchTermsFromUrl }
