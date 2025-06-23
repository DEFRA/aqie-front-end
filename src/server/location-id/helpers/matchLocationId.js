import { getIdMatch } from '~/src/server/locations/helpers/get-id-match'

const matchLocationId = (
  locationId,
  locationData,
  resultNI,
  locationType,
  indexNI
) => {
  return getIdMatch(locationId, locationData, resultNI, locationType, indexNI)
}

export default matchLocationId
