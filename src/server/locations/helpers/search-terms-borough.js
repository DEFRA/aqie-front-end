function searchTermsAndBorough(
  searchTerms,
  name1,
  secondSearchTerm,
  borough,
  exactWordFirstTerm,
  exactWordSecondTerm
) {
  const normalizeString = (str) => str?.toUpperCase().replace(/\s+/g, '')
  if (!exactWordFirstTerm) {
    return false
  }
  if (secondSearchTerm === 'UNDEFINED') {
    return (
      name1?.includes(normalizeString(searchTerms)) &&
      normalizeString(searchTerms).includes(name1) &&
      exactWordFirstTerm
    )
  }
  // Check if the search term is an exact match
  if (!exactWordSecondTerm) {
    return false
  }
  return (
    name1?.includes(normalizeString(searchTerms)) &&
    normalizeString(secondSearchTerm).includes(normalizeString(borough)) &&
    normalizeString(borough).includes(normalizeString(secondSearchTerm)) &&
    exactWordFirstTerm &&
    exactWordSecondTerm
  )
}

export { searchTermsAndBorough }
