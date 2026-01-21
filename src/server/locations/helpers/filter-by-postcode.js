const SINGLE_MATCH = 1 // Limit to a single match

const filterByPostcode = (matches, postcodes) => {
  const { isFullPostcode } = postcodes

  if (isFullPostcode && matches.length > SINGLE_MATCH) {
    // '' Sort matches alphabetically by district name for consistency
    // '' This ensures same postcode always returns same result (e.g., "N8 7GE, Haringey" vs "N8 7GE, Hornsey")
    const sortedMatches = [...matches].sort((a, b) => {
      const districtA =
        a.GAZETTEER_ENTRY?.DISTRICT_BOROUGH ||
        a.GAZETTEER_ENTRY?.COUNTY_UNITARY ||
        ''
      const districtB =
        b.GAZETTEER_ENTRY?.DISTRICT_BOROUGH ||
        b.GAZETTEER_ENTRY?.COUNTY_UNITARY ||
        ''
      return districtA.localeCompare(districtB)
    })
    return sortedMatches.slice(0, SINGLE_MATCH)
  }

  return matches
}

export { filterByPostcode }
