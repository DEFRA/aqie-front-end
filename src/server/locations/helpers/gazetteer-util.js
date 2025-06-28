import { formatUKPostcode } from './convert-string.js'

const gazetteerEntryFilter = (locationDetails) => {
  let title = ''
  let headerTitle = ''
  let formattedPostcode = ''
  // check if LOCAL_TYPE is Postcode then title & headerTitle should append with POPULATED_PLACE
  if (
    locationDetails.GAZETTEER_ENTRY.LOCAL_TYPE === 'Postcode' &&
    locationDetails.GAZETTEER_ENTRY.POPULATED_PLACE
  ) {
    if (locationDetails.GAZETTEER_ENTRY?.NAME2) {
      title = `${locationDetails.GAZETTEER_ENTRY?.NAME2}, ${locationDetails.GAZETTEER_ENTRY.POPULATED_PLACE}`
      headerTitle = `${locationDetails.GAZETTEER_ENTRY?.NAME2}, ${locationDetails.GAZETTEER_ENTRY.POPULATED_PLACE}`
      return { title, headerTitle }
    } else {
      formattedPostcode = formatUKPostcode(
        locationDetails.GAZETTEER_ENTRY?.NAME1
      )
      title = `${formattedPostcode}, ${locationDetails.GAZETTEER_ENTRY.POPULATED_PLACE}`
      headerTitle = `${formattedPostcode}, ${locationDetails.GAZETTEER_ENTRY.POPULATED_PLACE}`
      return { title, headerTitle }
    }
  } else if (locationDetails.GAZETTEER_ENTRY.LOCAL_TYPE !== 'Postcode') {
    if (locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH) {
      if (locationDetails.GAZETTEER_ENTRY?.NAME2) {
        title = `${locationDetails.GAZETTEER_ENTRY?.NAME2}, ${locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
        headerTitle = `${locationDetails.GAZETTEER_ENTRY?.NAME2}, ${locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
        return { title, headerTitle }
      } else {
        title = `${locationDetails.GAZETTEER_ENTRY?.NAME1}, ${locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
        headerTitle = `${locationDetails.GAZETTEER_ENTRY?.NAME1}, ${locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
        return { title, headerTitle }
      }
    } else {
      if (locationDetails.GAZETTEER_ENTRY?.NAME2) {
        title = `${locationDetails.GAZETTEER_ENTRY?.NAME2}, ${locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY}`
        headerTitle = `${locationDetails.GAZETTEER_ENTRY?.NAME2}, ${locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY}`
        return { title, headerTitle }
      } else {
        title = `${locationDetails.GAZETTEER_ENTRY?.NAME1}, ${locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY}`
        headerTitle = `${locationDetails.GAZETTEER_ENTRY?.NAME1}, ${locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY}`
        return { title, headerTitle }
      }
    }
  }
}

export { gazetteerEntryFilter }
