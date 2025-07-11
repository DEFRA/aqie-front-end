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
        name2?.includes(normalizeString(searchTerms)) &&
        normalizeString(searchTerms).includes(name2)
      )
    }
    if (secondSearchTerm !== 'UNDEFINED') {
      return (
        name2?.includes(normalizeString(searchTerms)) &&
        normalizeString(searchTerms).includes(name2) &&
        normalizeString(secondSearchTerm).includes(normalizeString(unitary)) &&
        normalizeString(unitary)?.includes(normalizeString(secondSearchTerm))
      )
    }
  }
  if (secondSearchTerm === 'UNDEFINED' || secondSearchTerm === '') {
    return (
      name1?.includes(normalizeString(searchTerms)) &&
      normalizeString(searchTerms).includes(name1)
    )
  }
  if (!exactWordFirstTerm) {
    return false
  }
  if (!exactWordSecondTerm) {
    return false
  }
  return (
    (name1?.includes(normalizeString(searchTerms)) ||
      normalizeString(searchTerms).includes(name1)) &&
    (normalizeString(secondSearchTerm).includes(normalizeString(unitary)) ||
      normalizeString(unitary)?.includes(normalizeString(secondSearchTerm))) &&
    exactWordFirstTerm &&
    exactWordSecondTerm
  )
}

export { searchTermsAndUnitary }
