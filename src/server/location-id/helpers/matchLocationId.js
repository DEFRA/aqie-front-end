import { getIdMatch } from '../../locations/helpers/get-id-match.js' // Updated import to use relative path

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
