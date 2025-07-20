const SINGLE_MATCH = 1 // Limit to a single match
const UNDEFINED_TERM = 'UNDEFINED' // Represents an undefined secondary search term

const filterBySearchTerms = (matches, search, isAlphanumeric) => {
  const normalizeString = (str) => str?.toUpperCase().replace(/\s+/g, '')
  const { searchTerms, secondSearchTerm } = search

  if (isAlphanumeric && searchTerms && secondSearchTerm === UNDEFINED_TERM) {
    const safeSearch = typeof searchTerms === 'string' ? searchTerms : ''
    return matches
      .filter((match) => {
        const name =
          typeof match?.GAZETTEER_ENTRY?.NAME1 === 'string'
            ? match.GAZETTEER_ENTRY.NAME1
            : ''
        return String(normalizeString(name)).includes(
          String(normalizeString(safeSearch))
        )
      })
      .slice(0, SINGLE_MATCH)
  }

  if (searchTerms && matches.length > SINGLE_MATCH) {
    return secondSearchTerm !== UNDEFINED_TERM
      ? matches.slice(0, SINGLE_MATCH)
      : []
  }

  return matches
}

export { filterBySearchTerms }
