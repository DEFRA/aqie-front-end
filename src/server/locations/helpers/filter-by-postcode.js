const SINGLE_MATCH = 1 // Limit to a single match

// Helper function to normalize POPULATED_PLACE (handles arrays consistently) ''
const normalizePopulatedPlace = (populatedPlace) => {
  if (!populatedPlace) return ''

  // If it's an array, sort alphabetically and join with comma
  if (Array.isArray(populatedPlace)) {
    return populatedPlace.sort().join(', ')
  }

  // If it's already a string, return as-is
  return String(populatedPlace)
}

const filterByPostcode = (matches, postcodes) => {
  const { isFullPostcode } = postcodes

  if (isFullPostcode && matches.length > SINGLE_MATCH) {
    // '' Sort matches alphabetically by location name for consistency
    // '' Prefer POPULATED_PLACE if available, else use DISTRICT_BOROUGH or COUNTY_UNITARY
    // '' This ensures same postcode always returns same result (e.g., "N8 7GE, Hornsey")
    const sortedMatches = [...matches].sort((a, b) => {
      const locationA =
        normalizePopulatedPlace(a.GAZETTEER_ENTRY?.POPULATED_PLACE) ||
        a.GAZETTEER_ENTRY?.DISTRICT_BOROUGH ||
        a.GAZETTEER_ENTRY?.COUNTY_UNITARY ||
        ''
      const locationB =
        normalizePopulatedPlace(b.GAZETTEER_ENTRY?.POPULATED_PLACE) ||
        b.GAZETTEER_ENTRY?.DISTRICT_BOROUGH ||
        b.GAZETTEER_ENTRY?.COUNTY_UNITARY ||
        ''
      return locationA.localeCompare(locationB)
    })
    return sortedMatches.slice(0, SINGLE_MATCH)
  }

  return matches
}

export { filterByPostcode }
