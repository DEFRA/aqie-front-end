import { LOCATION_TYPE_UK, LOCATION_TYPE_NI } from '~/src/server/data/constants'

function getIdMatch(
  locationId,
  locationData,
  resultNI,
  locationType,
  locationIndex
) {
  const normalizeString = (str) => str?.toUpperCase().replace(/\s+/g, '')
  let locationDetails
  if (locationType === LOCATION_TYPE_UK) {
    locationDetails = locationData?.results?.find((item, index) => {
      if (item.GAZETTEER_ENTRY.ID === locationId) {
        locationIndex = index
        return item.GAZETTEER_ENTRY.ID === locationId
      }
      return null
    })
  }
  if (locationType === LOCATION_TYPE_NI) {
    locationDetails = resultNI?.find((item, index) => {
      if (
        normalizeString(item.GAZETTEER_ENTRY.ID) === normalizeString(locationId)
      ) {
        locationIndex = index
        return (
          normalizeString(item.GAZETTEER_ENTRY.ID) ===
          normalizeString(locationId)
        )
      }
      return null
    })
  }

  return { locationIndex, locationDetails }
}

export { getIdMatch }
