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

// Helper function to get the appropriate location field for postcodes ''
// '' For postcodes, use POPULATED_PLACE if it exists (for consistency), else DISTRICT_BOROUGH
// '' This ensures we always get the same location name (e.g., "Hornsey") for the same postcode
const getPostcodeLocationField = (gazetteerEntry) => {
  const populatedPlace = normalizePopulatedPlace(
    gazetteerEntry?.POPULATED_PLACE
  )
  if (populatedPlace) {
    return populatedPlace
  }
  return (
    gazetteerEntry?.DISTRICT_BOROUGH || gazetteerEntry?.COUNTY_UNITARY || ''
  )
}

const gazetteerEntryFilter = (locationDetails) => {
  let title = ''
  let headerTitle = ''

  if (locationDetails?.GAZETTEER_ENTRY?.LOCAL_TYPE === 'Postcode') {
    // '' For postcodes, prefer POPULATED_PLACE when available for consistency
    // '' Fall back to DISTRICT_BOROUGH or COUNTY_UNITARY if POPULATED_PLACE doesn't exist
    // '' This ensures consistent location strings (e.g., always "Hornsey" for N8 7GE)
    return updateTitleHeader(locationDetails)
  }

  if (locationDetails?.GAZETTEER_ENTRY?.LOCAL_TYPE !== 'Postcode') {
    return updateTitleHeader(locationDetails)
  }

  return null

  function updateTitleHeader(_locationDetails) {
    const isPostcode =
      _locationDetails.GAZETTEER_ENTRY?.LOCAL_TYPE === 'Postcode'
    // '' For postcodes, use POPULATED_PLACE if available, else DISTRICT_BOROUGH/COUNTY_UNITARY
    const locationField = isPostcode
      ? getPostcodeLocationField(_locationDetails.GAZETTEER_ENTRY)
      : _locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH ||
        _locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY

    if (locationField) {
      if (_locationDetails.GAZETTEER_ENTRY?.NAME2) {
        title = `${_locationDetails.GAZETTEER_ENTRY?.NAME2}, ${locationField}`
        headerTitle = `${_locationDetails.GAZETTEER_ENTRY?.NAME2}, ${locationField}`
        return { title, headerTitle }
      }
      title = `${_locationDetails.GAZETTEER_ENTRY?.NAME1}, ${locationField}`
      headerTitle = `${_locationDetails.GAZETTEER_ENTRY?.NAME1}, ${locationField}`
      return { title, headerTitle }
    }
    // '' Fallback if no location field is available
    if (_locationDetails.GAZETTEER_ENTRY?.NAME2) {
      title = `${_locationDetails.GAZETTEER_ENTRY?.NAME2}, ${_locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY}`
      headerTitle = `${_locationDetails.GAZETTEER_ENTRY?.NAME2}, ${_locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY}`
      return { title, headerTitle }
    }
    title = `${_locationDetails.GAZETTEER_ENTRY?.NAME1}, ${_locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY}`
    headerTitle = `${_locationDetails.GAZETTEER_ENTRY?.NAME1}, ${_locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY}`
    return { title, headerTitle }
  }
}

export { gazetteerEntryFilter }
