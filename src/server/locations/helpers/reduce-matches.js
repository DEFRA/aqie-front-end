import { isOnlyLettersAndMoreThanFour } from '~/src/server/locations/helpers/convert-string'

const reduceMatches = (
  selectedMatches,
  locationNameOrPostcode,
  postcodes,
  isAlphanumeric,
  search
) => {
  const { isFullPostcode, isNotPostcode } = postcodes
  const { searchTerms, secondSearchTerm } = search
  const fullPostcodePattern = /^[a-z]{1,2}\d[a-z\d]?\s*\d[a-z]{2}$/i // Regex for full UK postcode
  const partialPostcodePattern = /^[a-z]{1,2}\d[a-z\d]?$/i // Regex for partial UK postcode
  const onlyLetters = isOnlyLettersAndMoreThanFour(locationNameOrPostcode)

  if (isFullPostcode && selectedMatches.length > 1) {
    selectedMatches = selectedMatches.slice(0, 1)
  }

  if (
    (isAlphanumeric || isNaN(Number(locationNameOrPostcode))) &&
    isNotPostcode &&
    searchTerms &&
    secondSearchTerm !== 'UNDEFINED' &&
    selectedMatches.length > 1
  ) {
    selectedMatches = selectedMatches.slice(0, 1)
  }

  if (
    (isAlphanumeric || isNaN(Number(locationNameOrPostcode))) &&
    isNotPostcode &&
    searchTerms &&
    selectedMatches.length > 1
  ) {
    selectedMatches =
      secondSearchTerm !== 'UNDEFINED' ? selectedMatches.slice(0, 1) : []
  }

  if (
    (isAlphanumeric || !isNaN(Number(locationNameOrPostcode))) &&
    isNotPostcode &&
    selectedMatches.length > 1
  ) {
    selectedMatches = []
  }

  if (
    (fullPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
      selectedMatches.length === 2) ||
    (partialPostcodePattern.test(locationNameOrPostcode.toUpperCase()) &&
      selectedMatches.length > 0 &&
      locationNameOrPostcode.length <= 6) ||
    (selectedMatches.length === 1 &&
      !partialPostcodePattern.test(locationNameOrPostcode.toUpperCase())) ||
    (selectedMatches.length >= 2 && onlyLetters && searchTerms)
  ) {
    selectedMatches = [selectedMatches[0]]
  }

  return selectedMatches
}

export default reduceMatches
