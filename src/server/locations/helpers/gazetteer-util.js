import { english } from '~/src/server/data/en/en.js'

const gazetteerEntryFilter = (locationDetails) => {
  let title = ''
  let headerTitle = ''
  if (locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH) {
    if (locationDetails.GAZETTEER_ENTRY.NAME2) {
      title =
        locationDetails.GAZETTEER_ENTRY.NAME2 +
        ', ' +
        locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH +
        ' - ' +
        english.multipleLocations.pageTitle
      headerTitle =
        locationDetails.GAZETTEER_ENTRY.NAME2 +
        ', ' +
        locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH
      return { title, headerTitle }
    } else {
      title =
        locationDetails.GAZETTEER_ENTRY.NAME1 +
        ', ' +
        locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH +
        ' - ' +
        english.multipleLocations.pageTitle
      headerTitle =
        locationDetails.GAZETTEER_ENTRY.NAME1 +
        ', ' +
        locationDetails.GAZETTEER_ENTRY.DISTRICT_BOROUGH
      return { title, headerTitle }
    }
  } else {
    if (locationDetails.GAZETTEER_ENTRY.NAME2) {
      title =
        locationDetails.GAZETTEER_ENTRY.NAME2 +
        ', ' +
        locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY +
        ' - ' +
        english.multipleLocations.pageTitle
      headerTitle =
        locationDetails.GAZETTEER_ENTRY.NAME2 +
        ', ' +
        locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY
      return { title, headerTitle }
    } else {
      title =
        locationDetails.GAZETTEER_ENTRY.NAME1 +
        ', ' +
        locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY +
        ' - ' +
        english.multipleLocations.pageTitle
      headerTitle =
        locationDetails.GAZETTEER_ENTRY.NAME1 +
        ', ' +
        locationDetails.GAZETTEER_ENTRY.COUNTY_UNITARY
      return { title, headerTitle }
    }
  }
}

export { gazetteerEntryFilter }
