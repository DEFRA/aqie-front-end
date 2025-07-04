import { sentenceCase } from '../../common/helpers/sentence-case.js'
import { LOCATION_TYPE_NI } from '../../data/constants.js'

function getNIData(locationData, distance, locationType) {
  let resultNI = []
  if (locationType === LOCATION_TYPE_NI && locationData) {
    resultNI = [
      {
        GAZETTEER_ENTRY: {
          ID: locationData?.urlRoute,
          NAME1: locationData?.results[0]?.postcode,
          DISTRICT_BOROUGH: sentenceCase(locationData?.results[0]?.town),
          LONGITUDE: distance?.latlon?.lon,
          LATITUDE: distance?.latlon?.lat
        }
      }
    ]
  }
  return { resultNI }
}

export { getNIData }
