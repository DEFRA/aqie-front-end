import { getNearestLocation } from '../../locations/helpers/get-nearest-location.js' // Updated import to use relative path

const determineNearestLocation = (
  locationData,
  getForecasts,
  locationType,
  index,
  lang
) => {
  return getNearestLocation(
    locationData?.results,
    getForecasts,
    locationType,
    index,
    lang,
    undefined // No request available in this context
  )
}

export default determineNearestLocation
