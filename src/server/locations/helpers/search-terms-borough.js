// '' Helper function to normalize strings for comparison
const normalizeString = (str) => str?.toUpperCase().replaceAll(/\s+/g, '')

// '' Helper function to check if search term is undefined or empty
const isSearchTermEmpty = (term) => term === 'UNDEFINED' || term === ''

// '' Helper function to check bidirectional string inclusion
const checkBidirectionalMatch = (str1, str2) => {
  const norm1 = normalizeString(str1)
  const norm2 = normalizeString(str2)
  return norm1?.includes(norm2) && norm2?.includes(norm1)
}

// '' Handle single search term scenario
function handleSingleSearchTerm(name1, searchTerms, exactWordFirstTerm) {
  return checkBidirectionalMatch(name1, searchTerms) && exactWordFirstTerm
}

// '' Handle dual search term scenario
function handleDualSearchTerm(
  name1,
  searchTerms,
  secondSearchTerm,
  borough,
  exactWordFirstTerm,
  exactWordSecondTerm
) {
  if (!exactWordSecondTerm) {
    return false
  }

  return (
    normalizeString(name1)?.includes(normalizeString(searchTerms)) &&
    checkBidirectionalMatch(secondSearchTerm, borough) &&
    exactWordFirstTerm &&
    exactWordSecondTerm
  )
}

function searchTermsAndBorough(
  searchTerms,
  name1,
  secondSearchTerm,
  borough,
  exactWordFirstTerm,
  exactWordSecondTerm
) {
  if (!exactWordFirstTerm) {
    return false
  }

  if (isSearchTermEmpty(secondSearchTerm)) {
    return handleSingleSearchTerm(name1, searchTerms, exactWordFirstTerm)
  }

  return handleDualSearchTerm(
    name1,
    searchTerms,
    secondSearchTerm,
    borough,
    exactWordFirstTerm,
    exactWordSecondTerm
  )
}

export { searchTermsAndBorough }
