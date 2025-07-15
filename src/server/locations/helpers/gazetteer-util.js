import { formatUKPostcode } from './convert-string.js' // Adjusted import path for ESM with .js extension

const gazetteerEntryFilter = (locationDetails) => {
  let title = ''
  let headerTitle = ''
  let formattedPostcode = ''
  // ''

  if (locationDetails?.GAZETTEER_ENTRY?.LOCAL_TYPE === 'Postcode') {
    if (!locationDetails.GAZETTEER_ENTRY.POPULATED_PLACE) {
      return updateTitleHeader(locationDetails)
    }
    if (locationDetails.GAZETTEER_ENTRY.POPULATED_PLACE) {
      if (locationDetails.GAZETTEER_ENTRY?.NAME2) {
        title = `${locationDetails.GAZETTEER_ENTRY?.NAME2}, ${locationDetails.GAZETTEER_ENTRY.POPULATED_PLACE}`
        headerTitle = `${locationDetails.GAZETTEER_ENTRY?.NAME2}, ${locationDetails.GAZETTEER_ENTRY.POPULATED_PLACE}`
        return { title, headerTitle }
      }
      formattedPostcode = formatUKPostcode(
        locationDetails.GAZETTEER_ENTRY?.NAME1
      )
      title = `${formattedPostcode}, ${locationDetails.GAZETTEER_ENTRY.POPULATED_PLACE}`
      headerTitle = `${formattedPostcode}, ${locationDetails.GAZETTEER_ENTRY.POPULATED_PLACE}`
      return { title, headerTitle }
    }
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
