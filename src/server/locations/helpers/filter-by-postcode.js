const SINGLE_MATCH = 1 // Limit to a single match

const filterByPostcode = (matches, postcodes) => {
  const { isFullPostcode } = postcodes

  if (isFullPostcode && matches.length > SINGLE_MATCH) {
    return matches.slice(0, SINGLE_MATCH)
  }

  return matches
}

export { filterByPostcode }
