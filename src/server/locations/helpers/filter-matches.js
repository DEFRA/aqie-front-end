import { hasExactMatch, splitAndCheckSpecificWords } from './convert-string.js'
import { searchTermsAndBorough } from './search-terms-borough.js'
import { searchTermsAndUnitary } from './search-terms-unitary.js'

/**
 * '' Helper to normalize strings by converting to uppercase and removing spaces.
 */
const normalizeString = (str) => str?.toUpperCase().replace(/\s+/g, '') // ''

/**
 * '' Handles search term and borough matching logic.
 */
const handleSearchTermsAndBorough = (
  searchTerms,
  secondSearchTerm,
  name1,
  borough
) => {
  const exactWordFirstTerm = hasExactMatch(searchTerms, name1) // ''
  const exactWordSecondTerm = hasExactMatch(secondSearchTerm, borough) // ''
  return searchTermsAndBorough(
    searchTerms,
    name1,
    secondSearchTerm,
    borough,
    exactWordFirstTerm,
    exactWordSecondTerm
  )
}

/**
 * '' Handles search term and unitary matching logic.
 */
const handleSearchTermsAndUnitary = (
  searchTerms,
  secondSearchTerm,
  name1,
  name2,
  unitary
) => {
  const exactWordFirstTerm = hasExactMatch(searchTerms, name1, name2) // ''
  const exactWordSecondTerm = hasExactMatch(secondSearchTerm, unitary) // ''
  return searchTermsAndUnitary(
    searchTerms,
    name1,
    name2,
    secondSearchTerm,
    unitary,
    exactWordFirstTerm,
    exactWordSecondTerm
  )
}

/**
 * '' Handles full postcode matching logic.
 */
const handleFullPostcode = (name1, userLocation) => {
  return (
    name1.includes(normalizeString(userLocation)) &&
    normalizeString(userLocation).includes(name1)
  )
}

/**
 * '' Handles generic word and name matching logic.
 */
const handleGenericMatching = (userLocation, item, name1, name2) => {
  const checkWords = splitAndCheckSpecificWords(
    userLocation,
    item?.GAZETTEER_ENTRY.NAME1
  ) // ''
  return (
    checkWords ||
    (name1.includes(normalizeString(userLocation)) &&
      normalizeString(userLocation).includes(normalizeString(name1))) ||
    (name2 &&
      normalizeString(userLocation).includes(normalizeString(name2)) &&
      normalizeString(name2).includes(normalizeString(userLocation)))
  )
}

/**
 * '' Main filterMatches function to determine if an item matches the search criteria.
 */
const filterMatches = (
  item,
  { searchTerms, secondSearchTerm, isFullPostcode, userLocation }
) => {
  const name1 = normalizeString(item?.GAZETTEER_ENTRY.NAME1) // ''
  const name2 = normalizeString(item?.GAZETTEER_ENTRY.NAME2) // ''
  const borough = normalizeString(
    item?.GAZETTEER_ENTRY?.DISTRICT_BOROUGH
  )?.replace(/-/g, ' ') // ''
  const unitary = normalizeString(
    item?.GAZETTEER_ENTRY?.COUNTY_UNITARY
  )?.replace(/-/g, ' ') // ''

  if (searchTerms && borough) {
    return handleSearchTermsAndBorough(
      searchTerms,
      secondSearchTerm,
      name1,
      borough
    ) // ''
  }

  if (searchTerms && unitary) {
    return handleSearchTermsAndUnitary(
      searchTerms,
      secondSearchTerm,
      name1,
      name2,
      unitary
    ) // ''
  }

  if (isFullPostcode) {
    return handleFullPostcode(name1, userLocation) // ''
  }

  return handleGenericMatching(userLocation, item, name1, name2) // ''
}

export { filterMatches }
