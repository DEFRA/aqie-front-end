import { getNearestLocation } from '~/src/server/locations/helpers/get-nearest-location'

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
