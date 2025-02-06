import { getAirQuality } from '~/src/server/data/en/air-quality.js'
import { getAirQualityCy } from '~/src/server/data/cy/air-quality.js'
import { LANG_CY, LANG_EN } from '~/src/server/data/constants'

function airQualityValues(forecastNum, lang) {
  let airQuality = {}
  if (lang === LANG_EN) {
    airQuality = getAirQuality(
      forecastNum[0][0].today,
      Object.values(forecastNum[0][1])[0],
      Object.values(forecastNum[0][2])[0],
      Object.values(forecastNum[0][3])[0],
      Object.values(forecastNum[0][4])[0]
    )
  }
  if (lang === LANG_CY) {
    airQuality = getAirQualityCy(
      forecastNum[0][0].today,
      Object.values(forecastNum[0][1])[0],
      Object.values(forecastNum[0][2])[0],
      Object.values(forecastNum[0][3])[0],
      Object.values(forecastNum[0][4])[0]
    )
  }
  return { airQuality }
}

export { airQualityValues }
