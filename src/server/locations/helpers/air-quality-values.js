import { getAirQuality } from '~/src/server/data/en/air-quality.js'
import { getAirQualityCy } from '~/src/server/data/cy/air-quality.js'
import { LANG_EN } from '~/src/server/data/constants'

function airQUalityValues(forecastNum, lang) {
  const airQuality =
    lang === LANG_EN
      ? getAirQuality(
          forecastNum[0][0].today,
          Object.values(forecastNum[0][1])[0],
          Object.values(forecastNum[0][2])[0],
          Object.values(forecastNum[0][3])[0],
          Object.values(forecastNum[0][4])[0]
        )
      : getAirQualityCy(
          forecastNum[0][0].today,
          Object.values(forecastNum[0][1])[0],
          Object.values(forecastNum[0][2])[0],
          Object.values(forecastNum[0][3])[0],
          Object.values(forecastNum[0][4])[0]
        )
  return { airQuality }
}

export default airQUalityValues
