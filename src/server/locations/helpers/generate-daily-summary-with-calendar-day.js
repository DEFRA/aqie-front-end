import moment from 'moment'

const transformKeys = (dailySummary) => {
  const dailySummaryIssueDate = moment(dailySummary.issue_date)
  const tomorrow = dailySummaryIssueDate.clone().add(1, 'days').format('dddd')
  const remainingDays = []
  for (let i = 2; i <= 6; i++) {
    remainingDays.push(
      dailySummaryIssueDate.clone().add(i, 'days').format('dddd')
    )
  }
  const remainingDaysRange = `${remainingDays[0]} to ${remainingDays[remainingDays.length - 1]}`
  const transformedDailySummary = {
    issue_date: dailySummary.issue_date,
    Today: dailySummary.today,
    [`${tomorrow}`]: dailySummary.tomorrow,
    [`${remainingDaysRange}`]: dailySummary.outlook
  }
  return { transformedDailySummary }
}

export { transformKeys }
