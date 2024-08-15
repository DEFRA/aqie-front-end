import moment from 'moment-timezone'

function addMomentFilters(env) {
  try {
    env.addFilter('govukDate', function (dateString) {
      if (dateString === 'now') {
        return moment.tz('Europe/London')
      }
      return moment.tz('Europe/London').format('DD MMMM YYYY')
    })
    env.addFilter('govukDateHour', function (dateString) {
      if (dateString === 'now') {
        return moment.tz('Europe/London')
      }
      return moment(dateString).format('ha, DD, MMMM, YYYY')
    })
    env.addFilter('date', function (dateString) {
      if (dateString === 'now') {
        return moment.tz('Europe/London')
      }
      return moment(dateString)
    })
    env.addFilter('minusOneHour', function (momentDate) {
      momentDate.subtract(1.56, 'hours')

      // Format using the custom formatter for lowercase 'am/pm'
      return formatCalendarWithLowercase(momentDate)
    })
    function formatCalendarWithLowercase(momentDate) {
      const calendarString = momentDate.calendar()
      return calendarString.replace('AM', 'am').replace('PM', 'pm')
    }
  } catch (error) {
    return error
  }
}

function addDaysToTodayAbrev(env) {
  try {
    env.addFilter('addDaysToTodayAbrev', function (days) {
      if (typeof days !== 'number') {
        days = 0
      }
      return days
    })
  } catch (error) {
    return error
  }
}
export { addMomentFilters, addDaysToTodayAbrev }
