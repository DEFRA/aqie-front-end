function searchTermsAndUnitary(
  searchTerms,
  name1,
  name2,
  secondSearchTerm,
  unitary,
  exactWordFirstTerm,
  exactWordSecondTerm
) {
  const normalizeString = (str) => str?.toUpperCase().replace(/\s+/g, '')
  if (name2) {
    if (secondSearchTerm === 'UNDEFINED' || secondSearchTerm === '') {
      return (
        normalizeString(name2)?.includes(normalizeString(searchTerms)) &&
        normalizeString(searchTerms).includes(normalizeString(name2))
      )
    }
    if (secondSearchTerm !== 'UNDEFINED') {
      return (
        normalizeString(name2)?.includes(normalizeString(searchTerms)) &&
        normalizeString(searchTerms).includes(normalizeString(name2)) &&
        normalizeString(secondSearchTerm).includes(normalizeString(unitary)) &&
        normalizeString(unitary)?.includes(normalizeString(secondSearchTerm))
      )
    }
  }
  if (secondSearchTerm === 'UNDEFINED' || secondSearchTerm === '') {
    return (
      normalizeString(name1)?.includes(normalizeString(searchTerms)) &&
      normalizeString(searchTerms).includes(normalizeString(name1))
    )
  }
  if (!exactWordFirstTerm) {
    return false
  }
  if (!exactWordSecondTerm) {
    return false
  }
  return (
    (normalizeString(name1)?.includes(normalizeString(searchTerms)) ||
      normalizeString(searchTerms).includes(normalizeString(name1))) &&
    (normalizeString(secondSearchTerm).includes(normalizeString(unitary)) ||
      normalizeString(unitary)?.includes(normalizeString(secondSearchTerm))) &&
    exactWordFirstTerm &&
    exactWordSecondTerm
  )
}

export { searchTermsAndUnitary }
