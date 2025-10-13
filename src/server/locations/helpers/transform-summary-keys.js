import moment from 'moment'
import {
  LANG_CY,
  SUMMARY_TRANSLATIONS,
  MAX_FORECAST_DAYS
} from '../../data/constants.js'

const transformKeys = (dailySummary, lang) => {
  const isValidDate = (date) => moment(date, moment.ISO_8601, true).isValid()

  const dailySummaryIssueDate = isValidDate(dailySummary?.issue_date)
    ? moment(dailySummary.issue_date)
    : moment.invalid()

  const currentDate = moment().startOf('day')
  const isCurrentDate =
    dailySummaryIssueDate.isValid() &&
    currentDate.isSame(dailySummaryIssueDate, 'day')

  const tomorrow = dailySummaryIssueDate.isValid()
    ? dailySummaryIssueDate.clone().add(1, 'days').format('dddd')
    : 'Invalid date'

  const remainingDays = []
  let transformedDailySummary

  for (let i = 2; i <= MAX_FORECAST_DAYS; i++) {
    remainingDays.push(
      dailySummaryIssueDate.isValid()
        ? dailySummaryIssueDate.clone().add(i, 'days').format('dddd')
        : 'Invalid date'
    )
  }

  const remainingDaysRange = `${remainingDays[0]} to ${remainingDays[remainingDays.length - 1]}`

  if (lang === LANG_CY) {
    const translateDayToWelsh = (day) => {
      return SUMMARY_TRANSLATIONS[day] || day
    }

    const translateRangeToWelsh = (range) => {
      const [startDay, endDay] = range.split(' to ')
      return `${translateDayToWelsh(startDay)} i ${translateDayToWelsh(endDay)}`
    }

    transformedDailySummary = {
      issue_date: dailySummary?.issue_date ?? 'N/A',
      Heddiw: dailySummary.today,
      [`${translateDayToWelsh(tomorrow)}`]: dailySummary.tomorrow,
      [`${translateRangeToWelsh(remainingDaysRange)}`]: dailySummary.outlook,
      isCurrentDate
    }
  } else {
    transformedDailySummary = {
      issue_date: dailySummary?.issue_date ?? 'N/A',
      Today: dailySummary.today,
      [`${tomorrow}`]: dailySummary.tomorrow,
      [`${remainingDaysRange}`]: dailySummary.outlook,
      isCurrentDate
    }
  }

  return { transformedDailySummary }
}

export { transformKeys }
