import moment from 'moment-timezone'
import {
  LANG_CY,
  LANG_EN,
  EUROPE_LONDON,
  CALENDAR_STRING,
  HOURS_TO_SUBTRACT
} from '../../../server/data/constants.js'
import { createLogger } from '../../../server/common/helpers/logging/logger.js'

const logger = createLogger('moment-date-filters')

/**
 * Formats a moment date with lowercase 'am/pm'.
 * @param {Object} momentDate - The moment date object.
 * @returns {string} The formatted calendar string.
 */
function formatCalendarWithLowercase(momentDate) {
  const calendarString = momentDate.calendar()
  return calendarString.replace('AM', 'am').replace('PM', 'pm')
}

function addMomentFilters(env) {
  try {
    env.addFilter('govukDate', function (dateString) {
      if (dateString === CALENDAR_STRING.NOW) {
        return moment.tz(EUROPE_LONDON)
      }
      return moment.tz(EUROPE_LONDON).format(CALENDAR_STRING.DD_MMMM_YYYY)
    })
    env.addFilter('govukDateHour', function (dateString) {
      if (dateString === CALENDAR_STRING.NOW) {
        return moment.tz(EUROPE_LONDON)
      }
      return moment(dateString).format('ha, DD, MMMM, YYYY')
    })
    env.addFilter('date', function (dateString) {
      if (dateString === CALENDAR_STRING.NOW) {
        return moment.tz(EUROPE_LONDON)
      }
      return moment(dateString)
    })
    env.addFilter('minusOneHour', function (momentDate) {
      momentDate.subtract(HOURS_TO_SUBTRACT, 'hours')

      // Format using the custom formatter for lowercase 'am/pm'
      return formatCalendarWithLowercase(momentDate)
    })
  } catch (error) {
    return error
  }
}

const addDaysToTodayAbrev = function (env) {
  try {
    if (!env || typeof env.addFilter !== 'function') {
      logger.error(
        'Invalid Nunjucks environment passed to addDaysToTodayAbrev.'
      )
      throw new Error('Invalid Nunjucks environment.')
    }
    env.addFilter('addDaysToTodayAbrev', function (days) {
      if (typeof days !== 'number') {
        days = 0
      }
      // Create a new moment object for today and add days
      const futureDate = moment()
        .locale(LANG_EN)
        .add(days, CALENDAR_STRING.DAYS)
      // Return the formatted future date
      return futureDate.format(CALENDAR_STRING.DDD)
    })
  } catch (error) {
    logger.error('Error registering addDaysToTodayAbrev filter:', error)
    return error
  }
}

const addDaysToTodayAbrevWelsh = function (env) {
  try {
    env.addFilter('addDaysToTodayAbrevWelsh', function (days) {
      if (typeof days !== 'number') {
        days = 0
      }
      // Create a new moment object for today and add days
      const futureDate = moment()
        .locale(LANG_CY)
        .add(days, CALENDAR_STRING.DAYS)
      // Return the formatted future date
      return futureDate.format(CALENDAR_STRING.DDD)
    })
  } catch (error) {
    logger.error('Error registering addDaysToTodayAbrevWelsh filter:', error)
    return error
  }
}

export { addMomentFilters, addDaysToTodayAbrev, addDaysToTodayAbrevWelsh }
