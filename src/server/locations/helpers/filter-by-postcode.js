const filterByPostcode = (matches, postcode) => {
  if (!postcode) {
    return []
  }
  return matches.filter(
    (location) =>
      location.GAZETTEER_ENTRY.ID.toUpperCase() === postcode.toUpperCase()
  )
}

export { filterByPostcode }
