import moment from 'moment'
import { LANG_CY, SUMMARY_TRANSLATIONS } from '~/src/server/data/constants'

const transformKeys = (dailySummary, lang) => {
  const dailySummaryIssueDate = moment(dailySummary?.issue_date)
  const currentDate = moment().startOf('day')
  const isCurrentDate = currentDate.isSame(dailySummaryIssueDate, 'day')
  const tomorrow = dailySummaryIssueDate.clone().add(1, 'days').format('dddd')
  const remainingDays = []
  let transformedDailySummary
  for (let i = 2; i <= 6; i++) {
    remainingDays.push(
      dailySummaryIssueDate.clone().add(i, 'days').format('dddd')
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
