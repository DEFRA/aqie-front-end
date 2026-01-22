// Helper function to normalize POPULATED_PLACE (handles arrays consistently) ''
// eslint-disable-next-line no-unused-vars
const normalizePopulatedPlace = (populatedPlace) => {
  if (!populatedPlace) return ''

  // If it's an array, sort alphabetically and join with comma
  if (Array.isArray(populatedPlace)) {
    return populatedPlace.sort().join(', ')
  }

  // If it's already a string, return as-is
  return String(populatedPlace)
}

const gazetteerEntryFilter = (locationDetails) => {
  let title = ''
  let headerTitle = ''

  if (locationDetails?.GAZETTEER_ENTRY?.LOCAL_TYPE === 'Postcode') {
    // '' For postcodes, ALWAYS use DISTRICT_BOROUGH or COUNTY_UNITARY instead of POPULATED_PLACE
    // '' because POPULATED_PLACE can vary between API calls for the same postcode
    // '' This ensures consistent location strings for duplicate detection
    return updateTitleHeader(locationDetails)
  }

  if (locationDetails?.GAZETTEER_ENTRY?.LOCAL_TYPE !== 'Postcode') {
    return updateTitleHeader(locationDetails)
  }

  return null

  function updateTitleHeader(_locationDetails) {
    if (_locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH) {
      if (_locationDetails.GAZETTEER_ENTRY?.NAME2) {
        title = `${_locationDetails.GAZETTEER_ENTRY?.NAME2}, ${_locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
        headerTitle = `${_locationDetails.GAZETTEER_ENTRY?.NAME2}, ${_locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
        return { title, headerTitle }
      }
      title = `${_locationDetails.GAZETTEER_ENTRY?.NAME1}, ${_locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
      headerTitle = `${_locationDetails.GAZETTEER_ENTRY?.NAME1}, ${_locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
      return { title, headerTitle }
    }
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
