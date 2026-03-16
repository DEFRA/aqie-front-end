import moment from 'moment-timezone'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getIssueTime } from '../locations/helpers/middleware-helpers.js'

const moduleLogger = createLogger()
const DAILY_SUMMARY_KEY = 'dailySummary'
const ISSUE_DATE_FORMAT = 'YYYY-MM-DD'
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const DATE_FORMAT = 'DD MMMM YYYY'

/**
 * Apply test mode changes to location data
 */
export function applyTestModeChanges(locationData, testMode, customLogger) {
  const log = customLogger || moduleLogger
  if (!testMode) {
    return
  }

  switch (testMode) {
    case 'noDailySummary':
      locationData[DAILY_SUMMARY_KEY] = null
      break

    case 'oldDate':
      if (locationData[DAILY_SUMMARY_KEY]) {
        const yesterday = moment().subtract(1, 'days')
        locationData[DAILY_SUMMARY_KEY].issue_date =
          yesterday.format(DATETIME_FORMAT)
        locationData.englishDate = yesterday.format(DATE_FORMAT)
        locationData.welshDate = yesterday.format(DATE_FORMAT)
      }
      break

    case 'todayDate': {
      const today = moment()
      if (!locationData[DAILY_SUMMARY_KEY]) {
        locationData[DAILY_SUMMARY_KEY] = {}
      }
      locationData[DAILY_SUMMARY_KEY].issue_date = today.format(DATETIME_FORMAT)
      locationData.englishDate = today.format(DATE_FORMAT)
      locationData.welshDate = today.format(DATE_FORMAT)
      break
    }

    case 'noDataOldDate': {
      const yesterday = moment().subtract(1, 'days')
      locationData[DAILY_SUMMARY_KEY] = {
        issue_date: yesterday.format(DATETIME_FORMAT)
      }
      locationData.englishDate = yesterday.format(DATE_FORMAT)
      locationData.welshDate = yesterday.format(DATE_FORMAT)
      break
    }

    default:
      log.warn(`Unknown testMode: ${testMode}`)
  }

  // Re-calculate showSummaryDate after any changes
  locationData.showSummaryDate = isSummaryDateToday(
    locationData[DAILY_SUMMARY_KEY]?.issue_date
  )
  locationData.issueTime = getIssueTime(
    locationData[DAILY_SUMMARY_KEY]?.issue_date
  )
}

/**
 * Check if summary date is today
 */
function isSummaryDateToday(issueDate) {
  if (!issueDate) {
    return false
  }
  const today = moment().format(ISSUE_DATE_FORMAT)
  const issueDateFormatted = moment(issueDate).format(ISSUE_DATE_FORMAT)
  return today === issueDateFormatted
}

/**
 * Calculate and set summary date if not already set
 */
export function calculateSummaryDate(locationData, customLogger) {
  if (
    locationData.showSummaryDate === undefined &&
    locationData[DAILY_SUMMARY_KEY]?.issue_date
  ) {
    const today = moment().format(ISSUE_DATE_FORMAT)
    const issueDate = moment(locationData[DAILY_SUMMARY_KEY].issue_date).format(
      ISSUE_DATE_FORMAT
    )
    locationData.showSummaryDate = today === issueDate
    locationData.issueTime = getIssueTime(
      locationData[DAILY_SUMMARY_KEY].issue_date
    )
  } else {
    if (
      !locationData.issueTime &&
      locationData[DAILY_SUMMARY_KEY]?.issue_date
    ) {
      locationData.issueTime = getIssueTime(
        locationData[DAILY_SUMMARY_KEY].issue_date
      )
    }
  }
}

/**
 * Determine location type from location data
 */
export function determineLocationType(locationData) {
  return locationData?.locationType || 'uk'
}
