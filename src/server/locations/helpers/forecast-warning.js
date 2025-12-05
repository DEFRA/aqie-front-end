// '' - Helper to generate forecast warning for high and very high pollution levels
import moment from 'moment'
import { warningMessages as enWarningMessages } from '../../data/en/air-quality.js'
import { warningMessages as cyWarningMessages } from '../../data/cy/air-quality.js'
import { LANG_CY, LANG_EN } from '../../data/constants.js'

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

  // Define high and very high bands
  const highBands = ['high', 'uchel']
  const veryHighBands = ['veryHigh', 'uchelIawn']

  // Days to check in order - matches the DAQI tab structure
  const days = [
    { key: 'today', dayOffset: 0 },
    { key: 'day2', dayOffset: 1 },
    { key: 'day3', dayOffset: 2 },
    { key: 'day4', dayOffset: 3 },
    { key: 'day5', dayOffset: 4 }
  ]

  // Find first occurrence of high or very high
  for (const day of days) {
    const dayData = airQuality[day.key]
    if (!dayData || !dayData.band) {
      continue
    }

    const band = dayData.band
    const isHigh = highBands.includes(band)
    const isVeryHigh = veryHighBands.includes(band)

    if (isHigh || isVeryHigh) {
      // Get the readable band label
      const level = dayData.readableBand || band

      // Calculate weekday using the SAME format as DAQI tabs
      // This ensures the weekday matches the tab labels exactly
      const targetDate = moment().locale(lang).add(day.dayOffset, 'days')

      // Use "today" or "heddiw" for today, otherwise use full weekday name
      let weekday
      if (day.key === 'today') {
        weekday = lang === LANG_CY ? 'heddiw' : 'today'
      } else {
        // For day2-day5, use full weekday name
        weekday = targetDate.format('dddd')
      }

      // Get warning message template
      const warningMessages =
        lang === LANG_CY ? cyWarningMessages : enWarningMessages
      const template = warningMessages.forecastWarning

      // Replace placeholders
      const text = template
        .replace('{level}', capitalizeFirstLetter(level))
        .replace('{weekday}', weekday)

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
