function searchTermsAndBorough(
  searchTerms,
  name1,
  secondSearchTerm,
  borough,
  exactWordFirstTerm,
  exactWordSecondTerm
) {
  const normalizeString = (str) => str?.toUpperCase().replace(/\s+/g, '')

  // Early return if first term doesn't match exactly
  if (!exactWordFirstTerm) {
    return false
  }

  // Handle case with only one search term
  const isSecondTermEmpty =
    secondSearchTerm === 'UNDEFINED' || secondSearchTerm === ''
  if (isSecondTermEmpty) {
    return checkSingleTermMatch(
      searchTerms,
      name1,
      normalizeString,
      exactWordFirstTerm
    )
  }

  // Handle case with two search terms
  return checkDoubleTermMatch(
    searchTerms,
    name1,
    secondSearchTerm,
    borough,
    normalizeString,
    exactWordFirstTerm,
    exactWordSecondTerm
  )
}

function checkSingleTermMatch(
  searchTerms,
  name1,
  normalizeString,
  exactWordFirstTerm
) {
  return (
    normalizeString(name1)?.includes(normalizeString(searchTerms)) &&
    normalizeString(searchTerms).includes(normalizeString(name1)) &&
    exactWordFirstTerm
  )
}

function checkDoubleTermMatch(
  searchTerms,
  name1,
  secondSearchTerm,
  borough,
  normalizeString,
  exactWordFirstTerm,
  exactWordSecondTerm
) {
  // Check if the second search term is an exact match
  if (!exactWordSecondTerm) {
    return false
  }

  return (
    normalizeString(name1)?.includes(normalizeString(searchTerms)) &&
    normalizeString(secondSearchTerm).includes(normalizeString(borough)) &&
    normalizeString(borough).includes(normalizeString(secondSearchTerm)) &&
    exactWordFirstTerm &&
    exactWordSecondTerm
  )
}

export { searchTermsAndBorough }
