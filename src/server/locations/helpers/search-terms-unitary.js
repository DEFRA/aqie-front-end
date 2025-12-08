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

// '' Helper function to check unidirectional string inclusion
const checkUnidirectionalMatch = (str1, str2) => {
  const norm1 = normalizeString(str1)
  const norm2 = normalizeString(str2)
  return norm1?.includes(norm2) || norm2?.includes(norm1)
}

// '' Handle name2 matching scenarios
function handleName2Match(searchTerms, name2, secondSearchTerm, unitary) {
  if (isSearchTermEmpty(secondSearchTerm)) {
    return checkBidirectionalMatch(name2, searchTerms)
  }

  if (secondSearchTerm !== 'UNDEFINED') {
    return (
      checkBidirectionalMatch(name2, searchTerms) &&
      checkBidirectionalMatch(secondSearchTerm, unitary)
    )
  }

  return false
}

// '' Handle name1 matching scenarios
function handleName1Match(
  searchTerms,
  name1,
  secondSearchTerm,
  unitary,
  exactWordFirstTerm,
  exactWordSecondTerm
) {
  if (isSearchTermEmpty(secondSearchTerm)) {
    return checkBidirectionalMatch(name1, searchTerms)
  }

  if (!exactWordFirstTerm || !exactWordSecondTerm) {
    return false
  }

  return (
    checkUnidirectionalMatch(name1, searchTerms) &&
    checkUnidirectionalMatch(secondSearchTerm, unitary)
  )
}

function searchTermsAndUnitary(
  searchTerms,
  name1,
  name2,
  secondSearchTerm,
  unitary,
  exactWordFirstTerm,
  exactWordSecondTerm
) {
  // '' Handle name2 scenarios first
  if (name2) {
    return handleName2Match(searchTerms, name2, secondSearchTerm, unitary)
  }

  // '' Handle name1 scenarios
  return handleName1Match(
    searchTerms,
    name1,
    secondSearchTerm,
    unitary,
    exactWordFirstTerm,
    exactWordSecondTerm
  )
}

export { searchTermsAndUnitary }
