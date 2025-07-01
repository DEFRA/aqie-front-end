import { getAirQuality } from '../../data/en/air-quality.js'
import { getAirQualityCy } from '../../data/cy/air-quality.js'
import { LANG_CY, LANG_EN } from '../../data/constants.js'

function airQualityValues(forecastNum, lang) {
  let airQuality = ''
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

const MODERATE_THRESHOLD = 40
function calculateAirQuality(pollutant, value) {
  if (pollutant === 'NO2' && value >= MODERATE_THRESHOLD) {
    return 'Moderate'
  }
  if (pollutant === 'INVALID' || value === null) {
    return 'Unknown'
  }
  return 'Good'
}

export { airQualityValues, calculateAirQuality }
