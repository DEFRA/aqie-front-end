import { LOCATION_TYPE_UK, LOCATION_TYPE_NI } from '../../data/constants.js' // Updated import to use relative path

const determineLocationType = (locationData) => {
  return locationData.locationType === LOCATION_TYPE_UK
    ? LOCATION_TYPE_UK
    : LOCATION_TYPE_NI
}

export default determineLocationType
