import { getNearestLocation } from '../locations/helpers/get-nearest-location.js' // Updated import to use relative path

const determineNearestLocation = (
  locationData,
  getForecasts,
  getMeasurements,
  locationType,
  index,
  lang
) => {
  return getNearestLocation(
    locationData?.results,
    getForecasts,
    getMeasurements,
    locationType,
    index,
    lang
  )
}

export default determineNearestLocation
