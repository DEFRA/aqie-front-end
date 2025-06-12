import {
  hasExactMatch,
  splitAndCheckSpecificWords
} from '~/src/server/locations/helpers/convert-string'
import { searchTermsAndBorough } from '~/src/server/locations/helpers/search-terms-borough'
import { searchTermsAndUnitary } from '~/src/server/locations/helpers/search-terms-unitary'

const filterMatches = (
  item,
  { searchTerms, secondSearchTerm, isFullPostcode, userLocation }
) => {
  const normalizeString = (str) => str?.toUpperCase().replace(/\s+/g, '') // Normalize string by converting to uppercase and removing spaces

  const name1 = normalizeString(item?.GAZETTEER_ENTRY.NAME1)
  const name2 = normalizeString(item?.GAZETTEER_ENTRY.NAME2)
  const borough = normalizeString(
    item?.GAZETTEER_ENTRY?.DISTRICT_BOROUGH
  )?.replace(/-/g, ' ')
  const unitary = normalizeString(
    item?.GAZETTEER_ENTRY?.COUNTY_UNITARY
  )?.replace(/-/g, ' ')

  if (searchTerms && borough) {
    const exactWordFirstTerm = hasExactMatch(searchTerms, name1)
    const exactWordSecondTerm = hasExactMatch(secondSearchTerm, borough)
    return searchTermsAndBorough(
      searchTerms,
      name1,
      secondSearchTerm,
      borough,
      exactWordFirstTerm,
      exactWordSecondTerm
    )
  }

  if (searchTerms && unitary) {
    const exactWordFirstTerm = hasExactMatch(searchTerms, name1, name2)
    const exactWordSecondTerm = hasExactMatch(secondSearchTerm, unitary)
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

  if (isFullPostcode) {
    return (
      name1.includes(normalizeString(userLocation)) &&
      normalizeString(userLocation).includes(name1)
    )
  }

  const checkWords = splitAndCheckSpecificWords(
    userLocation,
    item?.GAZETTEER_ENTRY.NAME1
  )
  return (
    checkWords ||
    (name1.includes(normalizeString(userLocation)) &&
      normalizeString(userLocation).includes(normalizeString(name1))) ||
    (name2 &&
      normalizeString(userLocation).includes(normalizeString(name2)) &&
      normalizeString(name2).includes(normalizeString(userLocation)))
  )
}

export { filterMatches }
