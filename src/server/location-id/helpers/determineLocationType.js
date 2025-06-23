import { LOCATION_TYPE_UK, LOCATION_TYPE_NI } from '~/src/server/data/constants'

const determineLocationType = (locationData) => {
  return locationData.locationType === LOCATION_TYPE_UK
    ? LOCATION_TYPE_UK
    : LOCATION_TYPE_NI
}

export default determineLocationType
