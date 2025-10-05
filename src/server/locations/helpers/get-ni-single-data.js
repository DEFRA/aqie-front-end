import { sentenceCase } from '../../common/helpers/sentence-case.js'
import { LOCATION_TYPE_NI } from '../../data/constants.js'

function getNIData(locationData, distance, locationType) {
  let resultNI = []
  if (locationType === LOCATION_TYPE_NI && locationData) {
    // '' Ensure results is an array before accessing index 0
    const firstResult = Array.isArray(locationData.results)
      ? locationData.results[0]
      : undefined
    resultNI = [
      {
        GAZETTEER_ENTRY: {
          ID: locationData?.urlRoute,
          NAME1: firstResult?.postcode,
          DISTRICT_BOROUGH: sentenceCase(firstResult?.town),
          LONGITUDE: distance?.latlon?.lon,
          LATITUDE: distance?.latlon?.lat
        }
      }
    ]
  }
  return { resultNI }
}

export { getNIData }
