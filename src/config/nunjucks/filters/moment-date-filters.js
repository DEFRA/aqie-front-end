import moment from 'moment'

function addMomentFilters(env) {
  try {
    env.addFilter('govukDate', function (dateString) {
      if (dateString === 'now') {
        return moment()
      }
      return moment().format('DD MMMM YYYY')
    })
    env.addFilter('date', function (dateString) {
      if (dateString === 'now') {
        return moment()
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
export { addMomentFilters }
