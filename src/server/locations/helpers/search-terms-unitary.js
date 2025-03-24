function searchTermsAndUnitary(
  userLocation,
  name1,
  name2,
  secondSearchTerm,
  unitary,
  exactWordFirstTerm,
  exactWordSecondTerm
) {
  const normalizeString = (str) => str?.toUpperCase().replace(/\s+/g, '')
  if (name2) {
    if (secondSearchTerm === 'UNDEFINED') {
      return (
        name2?.includes(normalizeString(userLocation)) ||
        normalizeString(userLocation).includes(name2)
      )
    }
    if (secondSearchTerm !== 'UNDEFINED') {
      return (
        normalizeString(name2)?.includes(normalizeString(userLocation)) &&
        normalizeString(userLocation).includes(normalizeString(name2)) &&
        normalizeString(secondSearchTerm).includes(normalizeString(unitary)) &&
        normalizeString(unitary)?.includes(normalizeString(secondSearchTerm))
      )
    }
  }
  if (secondSearchTerm === 'UNDEFINED') {
    return (
      name1?.includes(normalizeString(userLocation)) ||
      normalizeString(userLocation).includes(name1)
    )
  }
  if (!exactWordFirstTerm) {
    return false
  }
  if (!exactWordSecondTerm) {
    return false
  }
  return (
    (name1?.includes(normalizeString(userLocation)) ||
      normalizeString(userLocation).includes(name1)) &&
    (normalizeString(secondSearchTerm).includes(normalizeString(unitary)) ||
      normalizeString(unitary)?.includes(normalizeString(secondSearchTerm))) &&
    exactWordFirstTerm &&
    exactWordSecondTerm
  )
}

export { searchTermsAndUnitary }
