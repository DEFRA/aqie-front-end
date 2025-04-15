const SINGLE_MATCH = 1 // Limit to a single match
const UNDEFINED_TERM = 'UNDEFINED' // Represents an undefined secondary search term

const filterBySearchTerms = (matches, search, isAlphanumeric) => {
  const { searchTerms, secondSearchTerm } = search

  if (isAlphanumeric && searchTerms && secondSearchTerm !== UNDEFINED_TERM) {
    return matches.slice(0, SINGLE_MATCH)
  }

  if (searchTerms && matches.length > SINGLE_MATCH) {
    return secondSearchTerm !== UNDEFINED_TERM
      ? matches.slice(0, SINGLE_MATCH)
      : []
  }

  return matches
}

export { filterBySearchTerms }
