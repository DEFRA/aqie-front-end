import { LOCATION_TYPE_UK, LOCATION_TYPE_NI } from '~/src/server/data/constants'

function getIdMatch(
  locationId,
  locationData,
  resultNI,
  locationType,
  locationIndex
) {
  let locationDetails
  if (locationType === LOCATION_TYPE_UK) {
    locationDetails = locationData?.results?.find((item, index) => {
      if (
        item.GAZETTEER_ENTRY.ID.replace(/\s/g, '') ===
        locationId.replace(/\s/g, '')
      ) {
        locationIndex = index
        return (
          item.GAZETTEER_ENTRY.ID.replace(/\s/g, '') ===
          locationId.replace(/\s/g, '')
        )
      }
      return null
    })
  }
  if (locationType === LOCATION_TYPE_NI) {
    locationDetails = resultNI?.find((item, index) => {
      if (
        item.GAZETTEER_ENTRY.ID.replace(/\s/g, '') ===
        locationId.replace(/\s/g, '')
      ) {
        locationIndex = index
        return (
          item.GAZETTEER_ENTRY.ID.replace(/\s/g, '') ===
          locationId.replace(/\s/g, '')
        )
      }
      return null
    })
  }

  return { locationIndex, locationDetails }
}

export { getIdMatch }
