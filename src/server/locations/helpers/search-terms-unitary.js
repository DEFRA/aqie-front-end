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

  // Handle name2 cases first
  if (name2) {
    return handleName2Cases(
      searchTerms,
      name2,
      secondSearchTerm,
      unitary,
      normalizeString
    )
  }

  // Handle name1 cases
  return handleName1Cases(
    searchTerms,
    name1,
    secondSearchTerm,
    unitary,
    exactWordFirstTerm,
    exactWordSecondTerm,
    normalizeString
  )
}

function handleName2Cases(
  searchTerms,
  name2,
  secondSearchTerm,
  unitary,
  normalizeString
) {
  const isSecondTermEmpty =
    secondSearchTerm === 'UNDEFINED' ||
    secondSearchTerm === '' ||
    !secondSearchTerm
  const searchTermsMatch =
    normalizeString(name2)?.includes(normalizeString(searchTerms)) &&
    normalizeString(searchTerms).includes(normalizeString(name2))

  if (isSecondTermEmpty) {
    return searchTermsMatch
  }

  if (secondSearchTerm !== 'UNDEFINED') {
    const unitaryMatch =
      normalizeString(secondSearchTerm)?.includes(normalizeString(unitary)) &&
      normalizeString(unitary)?.includes(normalizeString(secondSearchTerm))
    return searchTermsMatch && unitaryMatch
  }

  return false
}

function handleName1Cases(
  searchTerms,
  name1,
  secondSearchTerm,
  unitary,
  exactWordFirstTerm,
  exactWordSecondTerm,
  normalizeString
) {
  const isSecondTermEmpty =
    secondSearchTerm === 'UNDEFINED' ||
    secondSearchTerm === '' ||
    !secondSearchTerm

  if (isSecondTermEmpty) {
    return (
      normalizeString(name1)?.includes(normalizeString(searchTerms)) &&
      normalizeString(searchTerms).includes(normalizeString(name1))
    )
  }

  // Early returns for missing exact matches
  if (!exactWordFirstTerm || !exactWordSecondTerm) {
    return false
  }

  const searchMatch =
    normalizeString(name1)?.includes(normalizeString(searchTerms)) ||
    normalizeString(searchTerms).includes(normalizeString(name1))

  const unitaryMatch =
    normalizeString(secondSearchTerm)?.includes(normalizeString(unitary)) ||
    normalizeString(unitary)?.includes(normalizeString(secondSearchTerm))

  return (
    searchMatch && unitaryMatch && exactWordFirstTerm && exactWordSecondTerm
  )
}

export { searchTermsAndUnitary }
