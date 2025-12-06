// '' - Helper to generate forecast warning for high and very high pollution levels
import moment from 'moment'
import { warningMessages as enWarningMessages } from '../../data/en/air-quality.js'
import { warningMessages as cyWarningMessages } from '../../data/cy/air-quality.js'
import { LANG_CY, LANG_EN } from '../../data/constants.js'

// ''  Constants for high pollution bands
const HIGH_BANDS = new Set(['high', 'uchel'])
const VERY_HIGH_BANDS = new Set(['veryHigh', 'uchelIawn'])

// Days configuration
const FORECAST_DAYS = [
  { key: 'today', dayOffset: 0 },
  { key: 'day2', dayOffset: 1 },
  { key: 'day3', dayOffset: 2 },
  { key: 'day4', dayOffset: 3 },
  { key: 'day5', dayOffset: 4 }
]

/**
 * Check if a band is high or very high pollution level
 */
function isHighOrVeryHighBand(band) {
  return HIGH_BANDS.has(band) || VERY_HIGH_BANDS.has(band)
}

/**
 * Get weekday label for a given day
 */
function getWeekdayLabel(dayKey, dayOffset, lang) {
  if (dayKey === 'today') {
    return lang === LANG_CY ? 'heddiw' : 'today'
  }
  const targetDate = moment().locale(lang).add(dayOffset, 'days')
  return targetDate.format('dddd')
}

/**
 * Build warning text from template
 */
function buildWarningText(level, weekday, lang) {
  const warningMessages =
    lang === LANG_CY ? cyWarningMessages : enWarningMessages
  const template = warningMessages.forecastWarning

  return template
    .replace('{level}', capitalizeFirstLetter(level))
    .replace('{weekday}', weekday)
}

/**
 * Check if air quality forecast contains High or Very High levels
 * and return warning text with level and weekday
 * @param {Object} airQuality - Air quality object with today, day2, day3, day4, day5
 * @param {string} lang - Language code ('en' or 'cy')
 * @returns {Object|null} - { text: string, level: string, weekday: string } or null if no warning needed
 */
export function getForecastWarning(airQuality, lang = LANG_EN) {
  if (!airQuality) {
    return null
  }

  // ''  Find first day with high or very high pollution
  for (const day of FORECAST_DAYS) {
    const dayData = airQuality[day.key]
    if (!dayData?.band) {
      continue
    }

    if (isHighOrVeryHighBand(dayData.band)) {
      const level = dayData.readableBand || dayData.band
      const weekday = getWeekdayLabel(day.key, day.dayOffset, lang)
      const text = buildWarningText(level, weekday, lang)

      return {
        text,
        level,
        weekday,
        dayKey: day.key
      }
    }
  }

  return null
}

/**
 * Capitalize first letter of a string
 * @param {string} str
 * @returns {string}
 */
function capitalizeFirstLetter(str) {
  if (!str) {
    return ''
  }
  return str.charAt(0).toUpperCase() + str.slice(1)
}
